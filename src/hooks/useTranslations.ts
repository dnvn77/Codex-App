
import { useMemo } from 'react';
import { useTelegram } from './useTelegram';
import { translations, type Language } from '@/lib/i18n';

export function useTranslations() {
  const { user } = useTelegram();
  const lang = user?.language_code;

  const currentTranslations = useMemo(() => {
    const language: Language = lang === 'es' ? 'es' : 'en';
    return translations[language];
  }, [lang]);

  return currentTranslations;
}
