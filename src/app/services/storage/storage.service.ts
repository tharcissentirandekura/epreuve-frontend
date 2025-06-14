import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class StorageService{
    private storage: Storage = localStorage;
    constructor(){}

    setItem<T>(key: string, value: T): void {
        try {
            const serializedValue = JSON.stringify(value);
            this.storage.setItem(key, serializedValue);
        } catch (error) {
            console.error('Error setting item in storage:', error);
        }
    }

    getItem<T>(key: string): T | null {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) as T : null;
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    }

  /**
   * Remove an item from storage
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

}