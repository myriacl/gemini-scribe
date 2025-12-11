import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  disabled: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onSelectLanguage,
  disabled 
}) => {
  return (
    <div className="flex gap-4 justify-center items-center mb-8">
      <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Language</span>
      <div className="flex bg-slate-800 p-1 rounded-full border border-slate-700">
        <button
          onClick={() => onSelectLanguage(Language.ENGLISH)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            selectedLanguage === Language.ENGLISH
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          English
        </button>
        <button
          onClick={() => onSelectLanguage(Language.FRENCH)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            selectedLanguage === Language.FRENCH
              ? 'bg-indigo-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Français
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;