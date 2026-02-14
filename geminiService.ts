
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVideoUrl = async (url: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this video URL: ${url}. Provide realistic metadata including a title, platform name, and estimated duration. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            platform: { type: Type.STRING, description: "one of: youtube, facebook, tiktok, other" },
            duration: { type: Type.STRING },
            thumbnailSeed: { type: Type.STRING, description: "a random keyword for a thumbnail image" }
          },
          required: ["title", "platform", "duration", "thumbnailSeed"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const searchForVideos = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for video URLs and websites for: ${query}. List direct video links and platform names.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Video Source",
      uri: chunk.web?.uri || ""
    })).filter((s: any) => s.uri) || [];

    return {
      text: response.text,
      sources: sources
    };
  } catch (error) {
    console.error("Search failed:", error);
    return null;
  }
};
