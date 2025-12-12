import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Language, TranscriptionState } from './types';
import { transcribeAudioOpenAI } from './services/openaiService';
import LanguageSelector from './components/LanguageSelector';
import RecordingControls from './components/RecordingControls';
import TranscriptionResult from './components/TranscriptionResult';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const [state, setState] = useState<TranscriptionState>({
    isRecording: false,
    isProcessing: false,
    text: null,
    translation: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowSettings(true);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('openai_api_key', key);
    setApiKey(key);
    setShowSettings(false);
    setState(prev => ({ ...prev, error: null }));
  };

  const startRecording = useCallback(async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use standard webm or mp4 which OpenAI supports
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
      setState(prev => ({ ...prev, isRecording: true, error: null, text: null, translation: null }));
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setState(prev => ({ 
        ...prev, 
        error: "Could not access microphone. Please ensure you have granted permission." 
      }));
    }
  }, [apiKey]);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      handleTranscription(audioBlob);
    };

    mediaRecorder.stop();
    setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
  }, [language, apiKey]); 

  const handleTranscription = async (blob: Blob) => {
    if (!apiKey) {
        setState(prev => ({ ...prev, isProcessing: false, error: "API Key is missing." }));
        return;
    }

    try {
      const { text, translation } = await transcribeAudioOpenAI(blob, apiKey, language);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        text,
        translation
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-4 selection:bg-indigo-500 selection:text-white relative">
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setShowSettings(true)}
          className="text-slate-500 hover:text-white transition-colors"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
          Gemini Scribe
        </h1>
        <p className="text-slate-400">Powered by OpenAI Whisper & GPT-4</p>
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

        <TranscriptionResult text={state.text} translation={state.translation} />
      </main>

      <footer className="mt-auto py-8 text-slate-600 text-sm">
        BYOK - Your keys are stored locally.
      </footer>

      <ApiKeyModal 
        isOpen={showSettings} 
        onSave={handleSaveKey} 
        onClose={() => setShowSettings(false)}
        hasKey={!!apiKey}
      />
    </div>
  );
};

export default App;