
import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Fixed: Initialize GoogleGenAI with apiKey strictly from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTasksFromImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Extract to-do list items from this image. For each item, identify a likely priority (LOW, MEDIUM, or HIGH) and a title. Return a valid JSON array of objects.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            },
            required: ["title", "priority"],
          },
        },
      },
    });

    // Fixed: Accessed response.text as a property (not a method) correctly
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("OCR Error:", error);
    return [];
  }
};
