import { describe, it, expect } from 'vitest';
import { resolveBestCategory, calculateMetrics } from '../utils/stats';

describe('stats utilities', () => {
  it('resolveBestCategory should handle empty or invalid input', () => {
    expect(resolveBestCategory([])).toBe('');
    expect(resolveBestCategory(null)).toBe('');
  });

  it('resolveBestCategory should work with majority voting', () => {
    const predictions = [
      { category: 'apple' },
      { category: 'orange' },
      { category: 'apple' },
    ];
    expect(resolveBestCategory(predictions)).toBe('apple');
  });

  it('resolveBestCategory should work with weighted voting', () => {
    const predictions = [
      { category: 'apple', score: 0.5 },
      { category: 'orange', score: 0.9 },
      { category: 'apple', score: 0.5 },
    ];
    expect(resolveBestCategory(predictions, true)).toBe('orange');
  });

  it('calculateMetrics should calculate correctly', () => {
    const predictions = [
      { category: 'apple', confidence: 0.8 },
      { category: 'orange', confidence: 0.6 },
    ];
    const actuals = [{ category: 'apple' }, { category: 'apple' }];
    const metrics = calculateMetrics(predictions, actuals);
    expect(metrics.totalPredictions).toBe(2);
    expect(metrics.correctPredictions).toBe(1);
    expect(metrics.accuracy).toBe(0.5);
    expect(metrics.avgConfidence).toBe(0.7);
    expect(metrics.categoryMetrics.apple.correct).toBe(1);
    expect(metrics.categoryMetrics.apple.actual).toBe(2);
    expect(metrics.categoryMetrics.orange.predicted).toBe(1);
  });
});
