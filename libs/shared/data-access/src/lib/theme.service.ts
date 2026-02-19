import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  readonly isDark = signal<boolean>(false);

  constructor() {
    // Initialize from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDark.set(savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDark.set(true);
    }

    // Effect to update DOM and localStorage
    effect(() => {
      const isDark = this.isDark();
      if (isDark) {
        this.document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        this.document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleTheme() {
    this.isDark.update(d => !d);
  }

  setTheme(isDark: boolean) {
    this.isDark.set(isDark);
  }
}
