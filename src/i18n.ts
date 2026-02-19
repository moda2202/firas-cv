import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// استيراد القواميس اللي عملناها
import enTranslation from './locales/en.json';
import svTranslation from './locales/sv.json';
import arTranslation from './locales/ar.json';

i18n
  // 👈 تفعيل كاشف لغة المتصفح
  .use(LanguageDetector)
  // 👈 تمرير النسخة لـ React
  .use(initReactI18next)
  .init({
    resources: {
      en: { ...enTranslation },
      sv: { ...svTranslation },
      ar: { ...arTranslation }
    },
    fallbackLng: 'en', // اللغة الاحتياطية لو ما لقى لغة المستخدم
    interpolation: {
      escapeValue: false, // React بيحمي من الـ XSS لحاله
    },
  });

export default i18n;