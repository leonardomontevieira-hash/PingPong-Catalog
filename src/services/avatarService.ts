import { GoogleGenAI } from "@google/genai";

export const generateAvatar = async (baseImageBase64: string, playerName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const model = "gemini-3.1-flash-image-preview";

  const parts: any[] = [];
  
  if (baseImageBase64) {
    parts.push({
      inlineData: {
        data: baseImageBase64,
        mimeType: "image/png",
      },
    });
  }

  parts.push({
    text: `Create a professional avatar for a ping pong player named ${playerName}. 
    Style: Minimalist, Black and White, sharp geometric lines, stylized cartoon/manga aesthetic.
    Features: The character must have glasses and a hair style with a fringe (franja) covering part of the forehead.
    Mood: Serious and focused.
    Background: Solid light gray or white.
    ${baseImageBase64 ? 'Use the attached image as a style reference.' : 'Follow the style of minimalist geometric vector art.'}`,
  });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
