import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import katex from 'katex';

@Pipe({
  name: 'katex',
  standalone: true
})
export class KatexPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  private static cache = new Map<string, SafeHtml>();
  private static readonly MAX_CACHE_SIZE = 500;

  transform(value: string): SafeHtml {
    if (!value) return '';
    if (KatexPipe.cache.has(value)) {
      return KatexPipe.cache.get(value)!;
    }
    let result = value.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          output: 'html'
        });
      } catch (e) {
        console.error('KaTeX error:', e);
        return match;
      }
    });

    // Process inline math ($...$)
    result = result.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          output: 'html'
        });
      } catch (e) {
        console.error('KaTeX error:', e);
        return match;
      }
    });

    // Bypass Angular sanitization for KaTeX HTML
    const safeHtml = this.sanitizer.bypassSecurityTrustHtml(result);
    
    // Cache the result (with size limit to prevent memory issues)
    if (KatexPipe.cache.size >= KatexPipe.MAX_CACHE_SIZE) {
      // Remove oldest entry (first item in Map)
      const firstKey = KatexPipe.cache.keys().next().value;
      if (firstKey !== undefined) {
        KatexPipe.cache.delete(firstKey);
      }
    }
    KatexPipe.cache.set(value, safeHtml);
    
    return safeHtml;
  }
}
