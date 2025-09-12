
import { GoogleGenAI } from "@google/genai";
import type { UploadedImage } from '../types';

// A single, module-level client instance.
// It will be initialized when a valid API key is verified.
let ai: GoogleGenAI | null = null;

/**
 * Translates a generic error from the Google AI SDK into a user-friendly
 * Thai message.
 * @param error The error object caught from the SDK.
 * @returns A localized, readable error string.
 */
const translateGeminiError = (error: any): string => {
    if (error?.message?.includes('API key not valid')) {
        return 'API Key ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
    }
    // Updated check for the new error structure
    if (error?.error?.message || error?.message) {
        const apiError = error.error || error;
        const message = apiError.message || '';
        const status = apiError.status || '';
        const code = apiError.code || 0;
        
        if (status === 'RESOURCE_EXHAUSTED' || code === 429) {
            return `ใช้งานเกินโควต้าที่กำหนดแล้ว กรุณาลองใหม่ในภายหลัง`;
        }
        if (status === 'PERMISSION_DENIED') {
            return 'API Key ไม่มีสิทธิ์เข้าถึงโมเดลที่ร้องขอ';
        }
        if (status === 'INTERNAL' || code === 500) {
             return 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ของ Google AI กรุณาลองใหม่อีกครั้งในภายหลัง';
        }
        return `เกิดข้อผิดพลาดจาก Google AI: ${message}`;
    }
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('fetch')) {
             return 'เกิดข้อผิดพลาดเกี่ยวกับเครือข่าย ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ของ Google AI ได้';
        }
        return `เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message}`;
    }
    return 'เกิดข้อผิดพลาดที่ไม่รู้จักขณะตรวจสอบ API Key';
};

/**
 * Verifies a Google AI API key by making a lightweight test call.
 * If successful, it initializes the shared AI client for subsequent calls.
 * @param apiKey The user-provided API key.
 * @returns An object containing the success status and a user-friendly message.
 */
export async function verifyApiKey(apiKey: string): Promise<{ success: boolean; message: string; }> {
    if (!apiKey) {
        return { success: false, message: 'กรุณากรอก API Key' };
    }
    try {
        // Use a temporary client for verification to not override a potentially valid existing one.
        const tempAi = new GoogleGenAI({ apiKey });
        
        // Make a lightweight, non-streaming call to check validity.
        // Removed the config with maxOutputTokens which was causing issues.
        await tempAi.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'ping', // A simple, harmless prompt.
        });
        
        // If verification is successful, set the module-level client.
        ai = tempAi;
        return { success: true, message: 'เชื่อมต่อสำเร็จ! API Key ถูกต้องและพร้อมใช้งาน' };

    } catch (error) {
        console.error("API Key validation failed:", error);
        ai = null; // Ensure client is null on any failure.
        return { success: false, message: `เชื่อมต่อล้มเหลว: ${translateGeminiError(error)}` };
    }
}


export async function generatePost(
  sheetData: string,
  media: UploadedImage[],
  postType: 'image' | 'video' | 'carousel',
  customPrompt: string | undefined,
  temperature: number,
  maxTokens: number
): Promise<string> {
  
  if (!ai) {
    throw new Error("กรุณาเชื่อมต่อและตรวจสอบ Google AI API Key ของคุณก่อน");
  }
  if (media.length === 0) {
      throw new Error("Cannot generate post without media.");
  }

  try {
    const postTypeInstruction = {
      image: "The user has provided a single image.",
      video: "The user has provided a single video.",
      carousel: "The user has provided multiple images for a carousel post. Your caption should be suitable for a multi-image post, either by creating a narrative across the images or by providing a general description that covers all of them."
    };

    const prompt = `
      You are a professional social media manager creating an engaging Facebook post for a Thai audience.
      
      **Context from Google Sheet:**
      ${sheetData}

      **Post Format:**
      ${postTypeInstruction[postType]}

      **Instructions:**
      1. Write a compelling and creative caption in Thai for a Facebook post based on the provided context and the attached image(s).
      2. The tone should be friendly, and professional, suitable for the product/service.
      3. Include a clear call-to-action (e.g., "สั่งซื้อเลย!", "สอบถามเพิ่มเติมได้ที่...", "คลิกเลย!").
      4. Add 3-5 relevant and popular hashtags in Thai.
      5. Use emojis appropriately to make the post more engaging.
      ${customPrompt ? `\n**User's Custom Instructions (in Thai):**\n${customPrompt}` : ''}

      Generate only the text for the post caption. A product link will be added separately, so do not include any placeholder links or URLs in your response.
    `;

    const textPart = { text: prompt };
    
    const mediaParts = media.map(m => ({
      inlineData: {
        mimeType: m.mimeType,
        data: m.base64.split(',')[1], // Remove the data URL prefix
      },
    }));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, ...mediaParts] },
        config: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
            // Reserve some tokens for thinking to avoid empty responses when maxOutputTokens is set.
            thinkingConfig: { thinkingBudget: Math.floor(maxTokens / 2) },
        }
    });

    const text = response.text;

    if (text === undefined || text === null) {
      if (response.promptFeedback?.blockReason) {
        throw new Error(`ไม่สามารถสร้างโพสต์ได้เนื่องจากเนื้อหาถูกบล็อก: ${response.promptFeedback.blockReason}. กรุณาปรับแก้เนื้อหาหรือรูปภาพ`);
      }
      console.error("Gemini API returned an empty response. Full response:", JSON.stringify(response, null, 2));
      throw new Error("โมเดล AI ไม่ได้สร้างเนื้อหาตอบกลับ กรุณาลองปรับคำสั่งหรือรูปภาพใหม่อีกครั้ง");
    }

    return text.trim();

  } catch (error: any) {
    console.error("Error generating post with Gemini API:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`ไม่สามารถสร้างโพสต์ได้: ${translateGeminiError(error)}`);
  }
}

export async function generateImage(prompt: string): Promise<{ base64: string, mimeType: string }> {
  if (!ai) {
    throw new Error("กรุณาเชื่อมต่อและตรวจสอบ Google AI API Key ของคุณก่อน");
  }

  try {
    const enhancedPrompt = `
      Professional, high-quality marketing photography for a social media post.
      Subject: "${prompt}".
      Style: Photorealistic, clean, bright lighting, high detail, studio quality.
      Avoid: text, logos, watermarks, blurry backgrounds, unrealistic shadows.
    `;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      console.error("Imagen API returned no images. Full response:", JSON.stringify(response, null, 2));
      throw new Error("ไม่สามารถสร้างรูปภาพได้เนื่องจากคำสั่งอาจไม่เหมาะสมหรือขัดต่อนโยบาย กรุณาลองใช้คำสั่งอื่น");
    }
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
    
    return {
        base64: imageUrl,
        mimeType: 'image/png'
    };

  } catch (error: any) {
    console.error("Error generating image with Imagen API:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`ไม่สามารถสร้างรูปภาพได้: ${translateGeminiError(error)}`);
  }
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function generateVideo(
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    onProgress: (message: string) => void,
    apiKeyForFetch: string, // Keep apiKey for fetch since the service client can't be used for this
    image?: UploadedImage | null
): Promise<{ base64: string, mimeType: string }> {
    if (!ai) {
      throw new Error("กรุณาเชื่อมต่อและตรวจสอบ Google AI API Key ของคุณก่อน");
    }
    
    try {
        onProgress('กำลังส่งคำขอสร้างวิดีโอ...');
        
        const generateVideosRequest: any = {
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatio,
            }
        };

        if (image) {
            generateVideosRequest.image = {
                imageBytes: image.base64.split(',')[1],
                mimeType: image.mimeType,
            };
        }

        let operation = await ai.models.generateVideos(generateVideosRequest);

        onProgress('โมเดล AI กำลังสร้างวิดีโอ... ขั้นตอนนี้อาจใช้เวลาหลายนาที กรุณารอสักครู่');
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
            console.error("Video generation operation completed but no video URI found.", operation);
            throw new Error("การสร้างวิดีโอล้มเหลว: ไม่พบไฟล์วิดีโอในผลลัพธ์จาก AI");
        }

        onProgress('สร้างวิดีโอสำเร็จ! กำลังดาวน์โหลดไฟล์...');

        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const videoResponse = await fetch(`${downloadLink}&key=${apiKeyForFetch}`);

        if (!videoResponse.ok) {
            throw new Error(`ไม่สามารถดาวน์โหลดไฟล์วิดีโอได้ (สถานะ: ${videoResponse.status})`);
        }
        
        const videoBlob = await videoResponse.blob();
        const base64Video = await blobToBase64(videoBlob);

        onProgress('ดาวน์โหลดวิดีโอสำเร็จ!');

        return {
            base64: base64Video,
            mimeType: 'video/mp4'
        };

    } catch (error: any) {
        console.error("Error generating video with Veo API:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`ไม่สามารถสร้างวิดีโอได้: ${translateGeminiError(error)}`);
    }
}
