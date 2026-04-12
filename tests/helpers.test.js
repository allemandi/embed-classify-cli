import { describe, it, expect } from 'vitest';
const helpers = require('../utils/helpers');

describe('Helpers Utility', () => {
  it('sanitizeText normalizes strings', () => {
    expect(helpers.sanitizeText('  hello   world  ')).toBe('hello world');
    expect(helpers.sanitizeText('It\'s a "test"')).toBe("It's a 'test'");
  });

  it('formatCSVRow handles commas and quotes', () => {
    expect(helpers.formatCSVRow(['a', 'b,c', "d'e"])).toBe('a,"b,c","d\'e"');
  });

  it('resolveBestCategory handles weighted and unweighted votes', () => {
    const predictions = [
      { category: 'A', similarityScore: 0.9 },
      { category: 'B', similarityScore: 0.8 },
      { category: 'B', similarityScore: 0.7 },
    ];
    // Unweighted majority: B (2 votes) vs A (1 vote)
    expect(helpers.resolveBestCategory(predictions, false)).toBe('B');
    // Weighted average: A (0.9) vs B ((0.8+0.7)/2 = 0.75)
    expect(helpers.resolveBestCategory(predictions, true)).toBe('A');
  });
});
