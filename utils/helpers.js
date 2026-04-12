const WHITESPACE_REGEX = /\s+/g;

const helpers = {
  // Shuffling
  shuffle: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Sanitization
  sanitizeText: (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      .trim()
      .replace(/['"''""]/g, "'")
      .replace(WHITESPACE_REGEX, ' ');
  },

  formatCSVRow: (values) => {
    return values
      .map((field) => {
        const s = String(field || '')
          .replace(/['"''""]/g, "'")
          .replace(/\r?\n/g, ' ');
        return /[,']/.test(s) ? `"${s}"` : s;
      })
      .join(',');
  },

  // Statistics & Metrics
  resolveBestCategory: (predictions, weighted = false) => {
    if (!predictions?.length) return '';

    if (weighted) {
      const stats = new Map();
      for (const { category, similarityScore = 0 } of predictions) {
        const current = stats.get(category) || { sum: 0, count: 0 };
        current.sum += similarityScore;
        current.count += 1;
        stats.set(category, current);
      }
      return [...stats.entries()].reduce(
        (best, [category, { sum, count }]) => {
          const avg = sum / count;
          return avg > best.avg ? { category, avg } : best;
        },
        { category: '', avg: -Infinity }
      ).category;
    }

    const counts = new Map();
    let best = { category: '', count: 0 };
    for (const { category } of predictions) {
      const count = (counts.get(category) || 0) + 1;
      counts.set(category, count);
      if (count > best.count) best = { category, count };
    }
    return best.category;
  },

  calculateMetrics: (predictions, actuals) => {
    const metrics = {
      total: predictions.length,
      correct: 0,
      categories: {},
      totalConfidence: 0,
    };

    predictions.forEach((p, i) => {
      const predCat = p.category || 'unknown';
      const actualCat = actuals[i]?.category || 'unknown';

      metrics.totalConfidence += p.confidence || 0;
      if (!metrics.categories[predCat]) metrics.categories[predCat] = { pred: 0, correct: 0, actual: 0 };
      if (!metrics.categories[actualCat]) metrics.categories[actualCat] = { pred: 0, correct: 0, actual: 0 };

      metrics.categories[predCat].pred++;
      metrics.categories[actualCat].actual++;

      if (predCat === actualCat) {
        metrics.correct++;
        metrics.categories[predCat].correct++;
      }
    });

    return metrics;
  },
};

module.exports = helpers;
