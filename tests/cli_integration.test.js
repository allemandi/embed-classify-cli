import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

describe('CLI Integration - Full Pipeline', () => {
  const trainingFile = 'data/training.csv';
  const embeddingFile = 'data/embedding.json';
  const unclassifiedFile = 'data/unclassified.csv';
  const predictedFile = 'data/predicted_test.csv';

  it('csv-embedding command works', () => {
    const result = spawnSync(
      'node',
      ['index.js', 'csv-embedding', '-i', trainingFile, '-o', embeddingFile],
      { encoding: 'utf-8' }
    );
    expect(result.status).toBe(0);
    expect(fs.existsSync(embeddingFile)).toBe(true);

    const embeddings = JSON.parse(fs.readFileSync(embeddingFile, 'utf-8'));
    expect(Array.isArray(embeddings)).toBe(true);
    expect(embeddings[0]).toHaveProperty('category');
    expect(embeddings[0]).toHaveProperty('text');
    expect(embeddings[0]).toHaveProperty('embedding');
    expect(Array.isArray(embeddings[0].embedding)).toBe(true);
  }, 30000);

  it('embedding-classification command works', () => {
    const result = spawnSync(
      'node',
      [
        'index.js',
        'embedding-classification',
        '-i',
        unclassifiedFile,
        '-c',
        embeddingFile,
        '-o',
        predictedFile,
        '-r',
        '-e',
      ],
      { encoding: 'utf-8' }
    );

    expect(result.status).toBe(0);
    expect(fs.existsSync(predictedFile)).toBe(true);

    const content = fs.readFileSync(predictedFile, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1);

    const headers = lines[0].split(',');
    expect(headers).toContain('category');
    expect(headers).toContain('comment');
    expect(headers).toContain('nearest_cosine_score');
    expect(headers).toContain('similar_samples_count');
  }, 120000);

  afterEach(() => {
    if (fs.existsSync(predictedFile)) fs.unlinkSync(predictedFile);
  });
});
