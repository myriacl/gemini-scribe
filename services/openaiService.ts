import OpenAI from 'openai';
import { Language } from '../types';

export const transcribeAudioOpenAI = async (
  audioBlob: Blob,
  apiKey: string,
  language: Language
): Promise<{ text: string; translation: string | null }> => {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });

  // 1. Convert Blob to File for OpenAI API
  const audioFile = new File([audioBlob], "recording.webm", { type: audioBlob.type });
  const languageCode = language === Language.FRENCH ? 'fr' : 'en';

  try {
    // 2. Transcribe using Whisper-1
    // Using whisper-1 as standard model for audio transcriptions
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: languageCode,
    });

    const text = transcriptionResponse.text;
    let translation = null;

    // 3. If language is French, translate using GPT-4o
    if (language === Language.FRENCH && text) {
      const translationResponse = await openai.chat.completions.create({
        model: 'gpt-4o', // Using gpt-4o as a robust modern model
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Translate the following French text into English. Return ONLY the English translation."
          },
          {
            role: "user",
            content: text
          }
        ]
      });
      translation = translationResponse.choices[0]?.message?.content || null;
    }

    return { text, translation };
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    throw new Error(error.message || "Failed to process audio with OpenAI.");
  }
};