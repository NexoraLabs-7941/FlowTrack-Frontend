import {Component, inject, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher implements OnInit {
  private static readonly LANGUAGE_STORAGE_KEY = 'flowtrack_language';
  
  protected currentLanguage: string = 'es';
  protected languages = ['es', 'en'];

  private translate: TranslateService;

  constructor() {
    this.translate = inject(TranslateService);
  }

  ngOnInit(): void {
    // Load saved language from localStorage or use default
    const savedLanguage = this.getSavedLanguage();
    this.currentLanguage = savedLanguage;
    this.translate.use(savedLanguage);
  }

  /**
   * Changes the application language and saves it to localStorage.
   * @param lang - The language code to switch to.
   */
  useLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguage = lang;
    this.saveLanguage(lang);
  }

  /**
   * Retrieves the saved language from localStorage.
   * @returns The saved language code or default 'es'.
   */
  private getSavedLanguage(): string {
    const saved = localStorage.getItem(LanguageSwitcher.LANGUAGE_STORAGE_KEY);
    return saved && this.languages.includes(saved) ? saved : 'es';
  }

  /**
   * Saves the selected language to localStorage.
   * @param lang - The language code to save.
   */
  private saveLanguage(lang: string): void {
    localStorage.setItem(LanguageSwitcher.LANGUAGE_STORAGE_KEY, lang);
  }
}
