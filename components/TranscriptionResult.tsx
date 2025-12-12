import React from 'react';

interface TranscriptionResultProps {
  text: string | null;
  translation: string | null;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => (
  <button 
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
  >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
      </svg>
      Copy
  </button>
);

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text, translation }) => {
  if (!text) return null;

  return (
    <div className="w-full max-w-2xl mt-8 flex flex-col gap-6 animate-fade-in-up">
      {/* Original Transcript */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transcript</h3>
            <CopyButton text={text} />
        </div>
        <p className="text-xl text-slate-100 leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>

      {/* Translation (if available) */}
      {translation && (
        <div className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-indigo-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
             </svg>
          </div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">English Translation</h3>
            <CopyButton text={translation} />
          </div>
          <p className="text-xl text-indigo-50 leading-relaxed whitespace-pre-wrap relative z-10">
            {translation}
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionResult;