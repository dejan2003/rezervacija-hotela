import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'hotel_theme';

  readonly isDark = signal(this.readInitialTheme());

  constructor() {
    this.applyTheme(this.isDark());

    effect(() => {
      const dark = this.isDark();
      this.applyTheme(dark);
      localStorage.setItem(this.storageKey, dark ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDark.update((value) => !value);
  }

  private readInitialTheme(): boolean {
    const storedTheme = localStorage.getItem(this.storageKey);

    if (storedTheme) {
      return storedTheme === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(dark: boolean): void {
    document.body.classList.toggle('dark-theme', dark);
    document.documentElement.classList.toggle('dark-theme', dark);
  }
}
