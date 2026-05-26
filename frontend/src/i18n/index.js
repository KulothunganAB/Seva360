import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';

const savedLang = localStorage.getItem('seva360_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ta: { translation: ta } },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export const setLanguage = (lang) => {
  localStorage.setItem('seva360_lang', lang);
  i18n.changeLanguage(lang);
};

export default i18n;
