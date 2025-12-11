import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';
import { blobToBase64 } from '../utils/audioUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeAudio = async (
  audioBlob: Blob,
  mimeType: string,
  language: Language
): Promise<string> => {
  try {
    const base64Audio = await blobToBase64(audioBlob);

    const prompt = `
      Please transcribe the following audio file. 
      The audio is spoken in ${language}. 
      Return ONLY the transcribed text. 
      Do not add any introductory or concluding remarks.
      If the audio is unclear, provide the best possible transcription.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio. Please try again.");
  }
};