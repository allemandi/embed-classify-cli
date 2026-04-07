const test = require('node:test');
const assert = require('node:assert');
const {
  sanitizeText,
  normalizeWhitespace,
  standardizeQuotes,
} = require('../utils/sanitizer');

test('sanitizer utilities', async (t) => {
  await t.test(
    'normalizeWhitespace should trim and reduce internal whitespace',
    () => {
      assert.strictEqual(
        normalizeWhitespace('  hello   world  '),
        'hello world'
      );
      assert.strictEqual(
        normalizeWhitespace('\n hello \t world \r'),
        'hello world'
      );
    }
  );

  await t.test(
    'standardizeQuotes should convert various quotes to single quotes',
    () => {
      assert.strictEqual(
        standardizeQuotes(' "double" \'single\' "curly" '),
        " 'double' 'single' 'curly' "
      );
    }
  );

  await t.test('sanitizeText should chain operations correctly', () => {
    assert.strictEqual(sanitizeText('  "Hello"   World  '), "'Hello' World");
  });

  await t.test('sanitizeText should handle non-string or empty input', () => {
    assert.strictEqual(sanitizeText(null), '');
    assert.strictEqual(sanitizeText(undefined), '');
    assert.strictEqual(sanitizeText(123), '');
  });
});
