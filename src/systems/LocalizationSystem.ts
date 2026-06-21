import { localization, supportedLanguages } from '../config/localization';
import type { LanguageCode } from '../types';

export class LocalizationSystem {
  private currentLanguage: LanguageCode = 'ru';

  setLanguage(language: string | null | undefined): LanguageCode {
    this.currentLanguage = supportedLanguages.includes(language as LanguageCode) ? (language as LanguageCode) : 'ru';
    return this.currentLanguage;
  }

  getLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  t(key: string, params: Record<string, string | number> = {}): string {
    const raw = localization[this.currentLanguage][key] ?? localization.ru[key] ?? key;
    return Object.entries(params).reduce((value, [paramKey, paramValue]) => value.split(`{${paramKey}}`).join(String(paramValue)), raw);
  }
}

export const i18n = new LocalizationSystem();
