import { STORAGE_KEY, recoverCook } from '../domain/cook';
import type { Cook } from '../domain/cook';
export class CookStorage {
  // A failed deletion must not resurrect this page's finished in-memory cook.
  private ignoreRecord = false;
  constructor(private storage: () => Storage = () => sessionStorage) {}
  read(now: number) {
    if (this.ignoreRecord)
      return { recovery: { kind: 'missing' as const }, warning: '' };
    try {
      return {
        recovery: recoverCook(this.storage().getItem(STORAGE_KEY), now),
        warning: '',
      };
    } catch {
      return {
        recovery: { kind: 'missing' as const },
        warning: 'Recovery unavailable',
      };
    }
  }
  remove() {
    this.ignoreRecord = true;
    try {
      this.storage().removeItem(STORAGE_KEY);
      return '';
    } catch {
      return 'Recovery unavailable. An older timer may reappear after reload.';
    }
  }
  save(cook: Cook) {
    try {
      this.storage().setItem(STORAGE_KEY, JSON.stringify(cook));
      this.ignoreRecord = false;
      return '';
    } catch {
      const warning = this.remove();
      return warning || 'Recovery unavailable';
    }
  }
}
