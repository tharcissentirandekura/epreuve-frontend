import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdEncoderService {
  private readonly secret = 'epreuve-test-secret-2024'; // Change this to your own secret

  /**
   * Encode a test ID to make it harder to guess
   */
  encode(id: number): string {
    if (!id || id <= 0) {
      throw new Error('Invalid ID');
    }
    
    // Combine ID with secret and timestamp for uniqueness
    const data = `${id}_${this.secret}_${Date.now()}`;
    const encoded = btoa(data);
    // Reverse and make URL-safe
    return encoded.split('').reverse().join('').replace(/[+/=]/g, (match) => {
      return match === '+' ? '-' : match === '/' ? '_' : '';
    });
  }

  /**
   * Decode and validate an encoded test ID
   */
  decode(encoded: string): number | null {
    try {
      if (!encoded || encoded.length < 10) {
        return null;
      }

      // Reverse the URL-safe encoding
      const urlSafe = encoded.replace(/[-_]/g, (match) => {
        return match === '-' ? '+' : '/';
      });
      
      const reversed = urlSafe.split('').reverse().join('');
      const decoded = atob(reversed);
      const parts = decoded.split('_');
      
      if (parts.length < 2 || parts[1] !== this.secret) {
        return null; // Invalid secret
      }
      
      const id = parseInt(parts[0], 10);
      
      if (isNaN(id) || id <= 0) {
        return null;
      }
      
      return id;
    } catch (error) {
      console.error('Error decoding ID:', error);
      return null;
    }
  }
}
