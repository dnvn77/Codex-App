
import { useMemo } from 'react';
import { useTelegram } from './useTelegram';
import { translations, type Language, supportedLanguages } from '@/lib/i18n';

export function useTranslations() {
  const { user } = useTelegram();
  const lang = user?.language_code;

  const currentTranslations = useMemo(() => {
    // Check if the user's language code is one of our supported languages
    const language: Language = supportedLanguages.includes(lang as Language) ? (lang as Language) : 'en';
    return translations[language];
  }, [lang]);

  return currentTranslations;
}
