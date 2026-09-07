import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import te from '../locales/te.json';

const translations = { en, te };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('samithi_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('samithi_lang', language);
  }, [language]);

  const toggleLanguage = (lang) => {
    if (lang && (lang === 'en' || lang === 'te')) {
      setLanguage(lang);
    } else {
      setLanguage((prev) => (prev === 'en' ? 'te' : 'en'));
    }
  };

  // Helper function to resolve nested keys e.g. t('createEntry.title')
  const t = (path) => {
    if (!path) return '';
    const keys = path.split('.');
    let current = translations[language] || translations['en'];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if missing in target language
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
