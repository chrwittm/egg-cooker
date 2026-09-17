import { describe, expect, it } from 'vitest';
import {
  LANGUAGE_KEY,
  detectLocale,
  messages,
  readLocale,
  translate,
  writeLocale,
} from './i18n';

describe('language selection and catalog', () => {
  it('uses the first supported requested language and falls back to English', () => {
    expect(detectLocale(['fr-FR', 'de-DE', 'en-US'])).toBe('de');
    expect(detectLocale(['es', 'fr'])).toBe('en');
  });

  it('accepts only validated explicit preferences and isolates storage errors', () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    };
    expect(readLocale(storage, ['de'])).toBe('de');
    data.set(LANGUAGE_KEY, 'fr');
    expect(readLocale(storage, ['de'])).toBe('de');
    writeLocale(storage, 'en');
    expect(data.get(LANGUAGE_KEY)).toBe('en');
    expect(
      readLocale(
        {
          getItem: () => {
            throw new Error('denied');
          },
        },
        ['de'],
      ),
    ).toBe('de');
    expect(() =>
      writeLocale(
        {
          setItem: () => {
            throw new Error('denied');
          },
        },
        'de',
      ),
    ).not.toThrow();
  });

  it('keeps both catalogs complete and interpolates explicit entries', () => {
    expect(Object.keys(messages.de)).toEqual(Object.keys(messages.en));
    expect(translate('de', 'sizeValue', { name: 'M', grams: 60 })).toBe(
      'M, 60 Gramm',
    );
  });
});
