import { Injectable, signal } from '@angular/core';
import { Language, translations } from './translation';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'hotel_language';

  readonly currentLanguage = signal<Language>(this.readInitialLanguage());

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    localStorage.setItem(this.storageKey, language);
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLanguage() === 'sr' ? 'en' : 'sr');
  }

  t(key: string): string {
    return translations[this.currentLanguage()][key] || key;
  }

  private readInitialLanguage(): Language {
    const stored = localStorage.getItem(this.storageKey);

    if (stored === 'sr' || stored === 'en') {
      return stored;
    }

    return 'sr';
  }
}