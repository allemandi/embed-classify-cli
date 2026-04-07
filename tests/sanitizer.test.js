import { describe, it, expect } from 'vitest';
import { sanitizeText, normalizeWhitespace, standardizeQuotes } from '../utils/sanitizer';

describe('sanitizer utilities', () => {
  it('normalizeWhitespace should trim and reduce internal whitespace', () => {
    expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
    expect(normalizeWhitespace('\n hello \t world \r')).toBe('hello world');
  });

  it('standardizeQuotes should convert various quotes to single quotes', () => {
    expect(standardizeQuotes(' "double" \'single\' "curly" ')).toBe(" 'double' 'single' 'curly' ");
  });

  it('sanitizeText should chain operations correctly', () => {
    expect(sanitizeText('  "Hello"   World  ')).toBe("'Hello' World");
  });

  it('sanitizeText should handle non-string or empty input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(123)).toBe('');
  });
});
