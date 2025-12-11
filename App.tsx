import React, { useState, useRef, useCallback } from 'react';
import { Language, TranscriptionState } from './types';
import { transcribeAudio } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import RecordingControls from './components/RecordingControls';
import TranscriptionResult from './components/TranscriptionResult';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [state, setState] = useState<TranscriptionState>({
    isRecording: false,
    isProcessing: false,
    text: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prefer standard MIME types supported by Gemini
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true, error: null, text: null }));
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setState(prev => ({ 
        ...prev, 
        error: "Could not access microphone. Please ensure you have granted permission." 
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
      
      // Stop all tracks to release microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      handleTranscription(audioBlob, mediaRecorder.mimeType);
    };

    mediaRecorder.stop();
    setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
  }, [language]); // Depend on language because handleTranscription reads it

  const handleTranscription = async (blob: Blob, mimeType: string) => {
    try {
      const result = await transcribeAudio(blob, mimeType, language);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        text: result
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || "An error occurred during transcription."
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-4 selection:bg-indigo-500 selection:text-white">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
          Gemini Scribe
        </h1>
        <p className="text-slate-400">AI-Powered Audio Transcription</p>
      </header>

      <main className="w-full max-w-lg flex flex-col items-center">
        <LanguageSelector 
          selectedLanguage={language} 
          onSelectLanguage={setLanguage}
          disabled={state.isRecording || state.isProcessing}
        />

        <div className="bg-slate-800 rounded-3xl p-2 w-full shadow-2xl shadow-indigo-500/10 border border-slate-700">
          <div className="bg-slate-900/50 rounded-[1.25rem] border border-slate-700/50">
            <RecordingControls 
              isRecording={state.isRecording}
              isProcessing={state.isProcessing}
              onStart={startRecording}
              onStop={stopRecording}
            />
          </div>
        </div>

        {state.error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {state.error}
          </div>
        )}

        <TranscriptionResult text={state.text} />
      </main>

      <footer className="mt-auto py-8 text-slate-600 text-sm">
        Powered by Gemini 2.5 Flash
      </footer>
    </div>
  );
};

export default App;