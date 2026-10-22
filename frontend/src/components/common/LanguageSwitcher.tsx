import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ isDarkBg?: boolean }> = ({ isDarkBg = false }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language.startsWith('am') ? 'am' : 'en';

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'am', label: 'Amharic', native: 'አማርኛ' },
  ];

  const handleSelectLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-btn transition-all duration-150 ${
          isDarkBg
            ? 'text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-emerald-400/20'
            : 'text-brand-textMain hover:text-brand-emerald bg-gray-50 hover:bg-gray-100 border border-gray-200'
        }`}
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
        <span className="sm:hidden">{currentLang === 'am' ? 'አማ' : 'EN'}</span>
        <span className="hidden sm:inline">{currentLang === 'am' ? 'አማርኛ' : 'English'}</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-card bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-xs font-semibold text-brand-textLight uppercase tracking-wider">
            Select Language
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              id={`lang-option-${lang.code}`}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors ${
                currentLang === lang.code
                  ? 'bg-emerald-50 text-brand-emerald font-semibold'
                  : 'text-brand-textMain hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.label}</span>
                <span className="text-xs text-brand-textMuted">{lang.native}</span>
              </div>
              {currentLang === lang.code && <Check className="w-4 h-4 text-brand-emerald" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
