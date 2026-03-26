import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { LANGUAGES } from '../../utils/translations';

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLang();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-gem-900/60 hover:bg-gem-800/60 border border-gem-700/50 rounded-lg px-3 py-2 transition-all duration-200 text-sm"
        title="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-gem-200 font-medium hidden sm:block">{current.nativeLabel}</span>
        <svg
          className={`w-3.5 h-3.5 text-gem-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-outside overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-44 bg-gem-950 border border-gem-800/60 rounded-xl shadow-xl shadow-black/50 py-1 z-50 animate-in">
            <p className="px-3 py-1.5 text-gem-500 text-xs font-medium border-b border-gem-800/40 mb-1">
              Choose Language
            </p>
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => { changeLang(language.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gem-800/40 transition-colors ${
                  lang === language.code ? 'bg-gem-800/50' : ''
                }`}
              >
                <span className="text-lg leading-none">{language.flag}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${lang === language.code ? 'text-gem-200' : 'text-gem-300'}`}>
                    {language.nativeLabel}
                  </p>
                  <p className="text-gem-600 text-xs">{language.label}</p>
                </div>
                {lang === language.code && (
                  <svg className="w-4 h-4 text-gem-400 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
