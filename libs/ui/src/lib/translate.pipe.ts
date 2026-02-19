import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '@lifeos-nexus/data-access';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);
  
  private lastKey: string | null = null;
  private lastParams: Record<string, string | number> | undefined | null = null;
  private lastLang: string | null = null;
  private lastResult: string | null = null;

  transform(key: string, params?: Record<string, string | number>): string {
    const currentLang = this.i18n.currentLang();
    
    // Simple optimization: if nothing changed, return cached result
    // Note: params object reference comparison is used. 
    // If you pass a new object literal in template every time (e.g. {val: 1}), 
    // it will be treated as specific change, which is correct behavior for pure:false.
    if (
      key === this.lastKey && 
      params === this.lastParams && 
      currentLang === this.lastLang
    ) {
      return this.lastResult!;
    }

    this.lastKey = key;
    this.lastParams = params;
    this.lastLang = currentLang;
    this.lastResult = this.i18n.translate(key, params);
    
    return this.lastResult;
  }
}
