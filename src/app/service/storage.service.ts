import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage: Storage | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage = window.localStorage;
    }
  }

  get(key: string): string | null {
    if (!this.storage) {
      return null;
    }
    return this.storage.getItem(key);
  }

  set(key: string, value: string): void {
    if (this.storage) {
      this.storage.setItem(key, value);
    }
  }

  clear(): void {
    if (this.storage) {
      this.storage.clear();
    }
  }

  remove(key: string): void {
    if (this.storage) {
      this.storage.removeItem(key);
    }
  }
}
