const { parseCsvToJson } = require('../utils/csv');
const logger = require('../utils/logger');
const fs = require('fs');
const { createEmbeddings } = require('../utils/embedding');
const { resolveBestCategory, calculateMetrics } = require('../utils/stats');
const { sanitizeText, formatCSVRow } = require('../utils/sanitizer');
const { shuffle, chunkArray } = require('../utils/helpers');
const { findNearestNeighbors } = require('@allemandi/embed-utils');

const embeddingClassification = async (
  inputFile,
  comparisonFile,
  outputFile,
  resultMetrics,
  evaluateModel,
  config = {}
) => {
  const {
    weightedVotes = true,
    comparisonPercentage = 80,
    maxSamplesToSearch = 40,
    similarityThresholdPercent = 30,
  } = config;

  const csvHeaderStrings = {
    category: 'category',
    comment: 'comment',
    nearestCosineScore: 'nearest_cosine_score',
    similarSamplesCount: 'similar_samples_count',
  };

  let jsonData;
  try {
    const jsonFile = await fs.promises.readFile(comparisonFile, 'utf-8');
    jsonData = JSON.parse(jsonFile);
  } catch (err) {
    logger.error(`Failed to read or parse comparison file: ${err.message}`);
    throw new Error(`Failed to read or parse comparison file: ${err.message}`, {
      cause: err,
    });
  }

  logger.info(`Fetching ${jsonData.length} samples from comparison set`);

  const randomizedEmbeddingArray = shuffle(jsonData);
  const originalEmbeddingLength = randomizedEmbeddingArray.length;
  const majorityIndex = Math.round(
    originalEmbeddingLength * (comparisonPercentage / 100)
  );

  const comparisonData = randomizedEmbeddingArray.slice(0, majorityIndex);
  logger.info(
    `Reserving ${comparisonPercentage}% (${comparisonData.length}) of original dataset to compare.`
  );

  const similarityThreshold = similarityThresholdPercent / 100;

  if (evaluateModel) {
    const evaluateData = randomizedEmbeddingArray.slice(majorityIndex);
    logger.info(
      `Starting model evaluation preview using remaining ${100 - comparisonPercentage}% (${evaluateData.length}) of samples.`
    );

    const chunkSize = 100;
    const evaluationResults = [];
    const chunks = chunkArray(evaluateData, chunkSize);

    for (const chunk of chunks) {
      // Batch embed texts for the entire chunk
      const texts = chunk.map((item) => item.text);
      const embeddingsResponse = await createEmbeddings(texts);

      const chunkResults = await Promise.all(
        chunk.map(async (item, index) => {
          const queryEmbedding = embeddingsResponse[index]?.embedding;
          if (!queryEmbedding) {
            return {
              text: item.text,
              category: '???',
              confidence: 0,
              actualCategory: item.category,
            };
          }

          const searchResults = await findNearestNeighbors(
            queryEmbedding,
            comparisonData,
            { topK: maxSamplesToSearch, threshold: similarityThreshold }
          );

          const predictedCategory =
            resolveBestCategory(searchResults, weightedVotes) || '???';
          const confidence = searchResults[0]?.similarityScore || 0;

          return {
            text: item.text,
            category: predictedCategory,
            confidence,
            actualCategory: item.category,
          };
        })
      );
      evaluationResults.push(...chunkResults);
    }

    const metrics = calculateMetrics(evaluationResults, evaluateData);

    logger.info('\n=== Model Evaluation Results ===');
    logger.info(`Total Test Samples: ${metrics.totalPredictions}`);
    logger.info(`Correct Predictions: ${metrics.correctPredictions}`);
    logger.info(`Overall Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
    logger.info(
      `Average Confidence: ${(metrics.avgConfidence * 100).toFixed(2)}%`
    );

    logger.info('\n=== Category-wise Performance ===');
    Object.entries(metrics.categoryMetrics).forEach(([category, stats]) => {
      logger.info(`\nCategory: ${category}`);
      logger.info(`├─ Predictions: ${stats.predicted}`);
      logger.info(`├─ Correct: ${stats.correct}`);
      logger.info(`├─ Actual Occurrences: ${stats.actual}`);
      const categoryPrecision =
        stats.predicted > 0
          ? ((stats.correct / stats.predicted) * 100).toFixed(2)
          : '0.00';
      const categoryRecall =
        stats.actual > 0
          ? ((stats.correct / stats.actual) * 100).toFixed(2)
          : '0.00';
      logger.info(`├─ Precision: ${categoryPrecision}%`);
      logger.info(`└─ Recall: ${categoryRecall}%`);
    });
    logger.info('\n');
  }

  const inputData = await parseCsvToJson(inputFile);

  const chunkSize = 100;
  const outputArr = [];
  const inputChunks = chunkArray(inputData, chunkSize);

  for (const chunk of inputChunks) {
    const sanitizedTexts = chunk.map(({ comment }) => sanitizeText(comment));
    const embeddingsResponse = await createEmbeddings(sanitizedTexts);

    const chunkResults = await Promise.all(
      chunk.map(async (_, index) => {
        const queryEmbedding = embeddingsResponse[index]?.embedding;
        const sanitizedText = sanitizedTexts[index];

        if (!queryEmbedding) {
          return {
            text: sanitizedText,
            category: '???',
            nearestCosineScore: 0,
            similarSamplesCount: 0,
          };
        }

        const searchResults = await findNearestNeighbors(
          queryEmbedding,
          comparisonData,
          { topK: maxSamplesToSearch, threshold: similarityThreshold }
        );

        const predictedCategory =
          resolveBestCategory(searchResults, weightedVotes) || '???';
        const nearestCosineScore = searchResults[0]?.similarityScore || 0;

        return {
          text: sanitizedText,
          category: predictedCategory,
          nearestCosineScore,
          similarSamplesCount: searchResults.length,
        };
      })
    );
    outputArr.push(...chunkResults);
  }

  const outputString = [
    resultMetrics
      ? formatCSVRow([
          csvHeaderStrings.category,
          csvHeaderStrings.comment,
          csvHeaderStrings.nearestCosineScore,
          csvHeaderStrings.similarSamplesCount,
        ])
      : formatCSVRow([csvHeaderStrings.category, csvHeaderStrings.comment]),
    ...outputArr.map((i) =>
      resultMetrics
        ? formatCSVRow([
            i.category,
            i.text,
            (i.nearestCosineScore * 100).toFixed(2),
            i.similarSamplesCount,
          ])
        : formatCSVRow([i.category, i.text])
    ),
  ].join('\n');

  try {
    await fs.promises.writeFile(outputFile, outputString);
    logger.info(`Results have been written to ${outputFile}`);
  } catch (err) {
    logger.error(`Failed to write output file: ${err.message}`);
    throw new Error(`Failed to write output file: ${err.message}`, {
      cause: err,
    });
  }
};

module.exports = embeddingClassification;
