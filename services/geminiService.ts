import { GoogleGenAI } from "@google/genai";
import type { UploadedImage } from '../types';

export async function generatePost(
  sheetData: string,
  media: UploadedImage[],
  postType: 'image' | 'video' | 'carousel',
  customPrompt: string | undefined,
  temperature: number,
  maxTokens: number
): Promise<string> {
  
  if (!process.env.API_KEY) {
    throw new Error("Google AI API Key is not configured in the environment.");
  }
  if (media.length === 0) {
      throw new Error("Cannot generate post without media.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
    if (error?.message?.includes('API key not valid')) {
      throw new Error('Google AI API Key ที่ตั้งค่าไว้ในระบบไม่ถูกต้อง');
    }
    
    // Handle structured API errors from Google AI
    if (error?.error?.message) {
      const apiError = error.error;
      if (apiError.status === 'RESOURCE_EXHAUSTED' || apiError.code === 429) {
          throw new Error(`สร้างโพสต์ไม่สำเร็จ: คุณใช้งานเกินโควต้าที่กำหนดแล้ว กรุณาลองใหม่ในวันถัดไป`);
      }
      throw new Error(`เกิดข้อผิดพลาดจาก AI (Code ${apiError.code}): ${apiError.message}`);
    }

    if (error instanceof Error) {
      // Re-throw custom error messages from the try block
      throw error;
    }
    throw new Error("ไม่สามารถสร้างโพสต์ได้ โมเดล AI อาจไม่พร้อมใช้งานหรือเกิดข้อผิดพลาด");
  }
}

export async function generateImage(prompt: string): Promise<{ base64: string, mimeType: string }> {
  if (!process.env.API_KEY) {
    throw new Error("Google AI API Key is not configured in the environment.");
  }

  try {
    const enhancedPrompt = `
      Professional, high-quality marketing photography for a social media post.
      Subject: "${prompt}".
      Style: Photorealistic, clean, bright lighting, high detail, studio quality.
      Avoid: text, logos, watermarks, blurry backgrounds, unrealistic shadows.
    `;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    if (error?.message?.includes('API key not valid')) {
     throw new Error('Google AI API Key ที่ตั้งค่าไว้ในระบบไม่ถูกต้อง');
   }
   
   // Handle structured API errors from Google AI
   if (error?.error?.message) {
     const apiError = error.error;
     if (apiError.status === 'RESOURCE_EXHAUSTED' || apiError.code === 429) {
         throw new Error(`สร้างรูปภาพไม่สำเร็จ: คุณใช้งานเกินโควต้าที่กำหนดแล้ว กรุณาลองใหม่ในวันถัดไป`);
     }
     throw new Error(`เกิดข้อผิดพลาดจาก AI (Code ${apiError.code}): ${apiError.message}`);
   }

   if (error instanceof Error) {
      // Re-throw custom error messages from the try block
     throw error;
   }
   throw new Error("ไม่สามารถสร้างรูปภาพได้ โมเดล AI อาจไม่พร้อมใช้งานหรือเกิดข้อผิดพลาด");
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
    image?: UploadedImage | null
): Promise<{ base64: string, mimeType: string }> {
    if (!process.env.API_KEY) {
        throw new Error("Google AI API Key is not configured in the environment.");
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
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
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

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
        if (error?.message?.includes('API key not valid')) {
            throw new Error('Google AI API Key ที่ตั้งค่าไว้ในระบบไม่ถูกต้อง');
        }
        if (error?.error?.message) {
            const apiError = error.error;
            throw new Error(`เกิดข้อผิดพลาดจาก AI (Code ${apiError.code}): ${apiError.message}`);
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("ไม่สามารถสร้างวิดีโอได้ โมเดล AI อาจไม่พร้อมใช้งานหรือเกิดข้อผิดพลาด");
    }
}