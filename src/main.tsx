import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
// 👇 1. استيراد إعدادات اللغات (تأكد إنك أنشأت ملف i18n.ts في نفس المجلد)
import './i18n'; 

// 👇 2. كود تغيير اتجاه الصفحة (RTL) إذا كانت اللغة عربي
import i18n from './i18n';
document.documentElement.dir = i18n.dir();
document.documentElement.lang = i18n.language;

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = i18n.dir(lng);
  document.documentElement.lang = lng;
});


const GOOGLE_CLIENT_ID = "26238613968-sjrd3frfonf5uht0amc59r2pe6spfke8.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
