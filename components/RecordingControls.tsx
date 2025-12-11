import React from 'react';

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isProcessing,
  onStart,
  onStop
}) => {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-indigo-400 animate-pulse font-medium">Transcribing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <button
        onClick={isRecording ? onStop : onStart}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.4)]'
        }`}
      >
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-wave z-0"></div>
        )}
        
        <div className="z-10 text-white">
          {isRecording ? (
             // Stop Icon
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
               <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
             </svg>
          ) : (
            // Microphone Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
      </button>
      <p className="mt-6 text-lg font-medium text-slate-300">
        {isRecording ? "Listening..." : "Tap to Record"}
      </p>
    </div>
  );
};

export default RecordingControls;