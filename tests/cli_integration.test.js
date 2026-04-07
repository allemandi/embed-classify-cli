const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');

test('CLI Integration - Full Pipeline', async (t) => {
  const trainingFile = 'data/training.csv';
  const embeddingFile = 'data/embedding.json';
  const unclassifiedFile = 'data/unclassified.csv';
  const predictedFile = 'data/predicted_test.csv';

  await t.test('csv-embedding command works', () => {
    const result = spawnSync(
      'node',
      ['index.js', 'csv-embedding', '-i', trainingFile],
      { encoding: 'utf-8' }
    );
    assert.strictEqual(result.status, 0, `Command failed: ${result.stderr}`);
    assert.ok(fs.existsSync(embeddingFile), 'embedding.json should be created');
  });

  await t.test('embedding-classification command works', () => {
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
        '-e',
      ],
      { encoding: 'utf-8' }
    );

    assert.strictEqual(result.status, 0, `Command failed: ${result.stderr}`);
    assert.ok(
      fs.existsSync(predictedFile),
      'predicted_test.csv should be created'
    );

    // Check if predicted file has content
    const content = fs.readFileSync(predictedFile, 'utf-8');
    const lines = content.trim().split('\n');
    assert.ok(
      lines.length > 1,
      'Predicted file should have at least header and one row'
    );
  });

  // Cleanup
  if (fs.existsSync(predictedFile)) {
    fs.unlinkSync(predictedFile);
  }
});
