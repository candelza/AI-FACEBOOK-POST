import { GoogleGenAI } from "@google/genai";
import type { UploadedImage } from '../types';

export async function generatePost(
  sheetData: string,
  image: UploadedImage,
  customPrompt: string | undefined,
  temperature: number,
  maxTokens: number,
  shopeeLink: string | undefined
): Promise<string> {
  
  if (!process.env.API_KEY) {
    throw new Error("Google AI API Key is not configured in the environment.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a professional social media manager creating an engaging Facebook post for a Thai audience.
      
      **Context from Google Sheet:**
      ${sheetData}

      **Instructions:**
      1. Write a compelling and creative caption in Thai for a Facebook post based on the provided context and the attached image.
      2. The tone should be friendly, and professional, suitable for the product/service.
      3. Include a clear call-to-action (e.g., "สั่งซื้อเลย!", "สอบถามเพิ่มเติมได้ที่...", "คลิกเลย!").
      ${shopeeLink ? `4. **Crucially, you must include this Shopee link in the post, preferably near the call-to-action:** ${shopeeLink}` : ''}
      5. Add 3-5 relevant and popular hashtags in Thai.
      6. Use emojis appropriately to make the post more engaging.
      ${customPrompt ? `\n**User's Custom Instructions (in Thai):**\n${customPrompt}` : ''}

      Generate only the text for the post caption. Do not include any other explanatory text or markdown formatting.
    `;

    const imagePart = {
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64.split(',')[1], // Remove the data URL prefix
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
            // Reserve some tokens for thinking to avoid empty responses when maxOutputTokens is set.
            thinkingConfig: { thinkingBudget: Math.floor(maxTokens / 2) },
        }
    });

    return response.text.trim();

  } catch (error) {
    console.error("Error generating post with Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error('Google AI API Key ที่ตั้งค่าไว้ในระบบไม่ถูกต้อง');
    }
    throw new Error("ไม่สามารถสร้างโพสต์ได้ โมเดล AI อาจไม่พร้อมใช้งานหรือเกิดข้อผิดพลาด");
  }
}