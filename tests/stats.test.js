const test = require('node:test');
const assert = require('node:assert');
const { resolveBestCategory, calculateMetrics } = require('../utils/stats');

test('stats utilities', async (t) => {
  await t.test(
    'resolveBestCategory should handle empty or invalid input',
    () => {
      assert.strictEqual(resolveBestCategory([]), '');
      assert.strictEqual(resolveBestCategory(null), '');
    }
  );

  await t.test('resolveBestCategory should work with majority voting', () => {
    const predictions = [
      { category: 'apple' },
      { category: 'orange' },
      { category: 'apple' },
    ];
    assert.strictEqual(resolveBestCategory(predictions), 'apple');
  });

  await t.test('resolveBestCategory should work with weighted voting', () => {
    const predictions = [
      { category: 'apple', score: 0.5 },
      { category: 'orange', score: 0.9 },
      { category: 'apple', score: 0.5 },
    ];
    // apple avg = 0.5, orange avg = 0.9
    assert.strictEqual(resolveBestCategory(predictions, true), 'orange');
  });

  await t.test('calculateMetrics should calculate correctly', () => {
    const predictions = [
      { category: 'apple', confidence: 0.8 },
      { category: 'orange', confidence: 0.6 },
    ];
    const actuals = [{ category: 'apple' }, { category: 'apple' }];
    const metrics = calculateMetrics(predictions, actuals);
    assert.strictEqual(metrics.totalPredictions, 2);
    assert.strictEqual(metrics.correctPredictions, 1);
    assert.strictEqual(metrics.accuracy, 0.5);
    assert.strictEqual(metrics.avgConfidence, 0.7);
    assert.strictEqual(metrics.categoryMetrics.apple.correct, 1);
    assert.strictEqual(metrics.categoryMetrics.apple.actual, 2);
    assert.strictEqual(metrics.categoryMetrics.orange.predicted, 1);
  });
});
