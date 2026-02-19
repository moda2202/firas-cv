import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select 
        value={i18n.resolvedLanguage} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="auth-input" 
        style={{ marginBottom: 0, padding: '4px 8px', width: 'auto', cursor: 'pointer' }}
      >
        <option value="en">🇬🇧 English</option>
        <option value="sv">🇸🇪 Svenska</option>
        <option value="ar">🇸🇾 العربية</option>
      </select>
    </div>
  );
}