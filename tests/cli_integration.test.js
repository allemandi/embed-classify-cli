import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

describe('CLI Integration - Full Pipeline', () => {
  const trainingFile = 'data/training.csv';
  const embeddingFile = 'data/embedding.json';
  const unclassifiedFile = 'data/unclassified.csv';
  const predictedFile = 'data/predicted_test.csv';

  it('csv-embedding command works', () => {
    const result = spawnSync('node', ['index.js', 'csv-embedding', '-i', trainingFile], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    expect(fs.existsSync(embeddingFile)).toBe(true);
  }, 30000); // 30s timeout

  it('embedding-classification command works', () => {
    const result = spawnSync('node', [
      'index.js', 'embedding-classification',
      '-i', unclassifiedFile,
      '-c', embeddingFile,
      '-o', predictedFile,
      '-e'
    ], { encoding: 'utf-8' });

    expect(result.status).toBe(0);
    expect(fs.existsSync(predictedFile)).toBe(true);

    const content = fs.readFileSync(predictedFile, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1);
  }, 120000); // 120s timeout

  afterEach(() => {
    if (fs.existsSync(predictedFile)) {
      fs.unlinkSync(predictedFile);
    }
  });
});
