const fs = require('fs');
const { parseCsvToJson } = require('../utils/csv');
const {
  createEmbeddings,
  findNearestNeighbors,
} = require('../utils/embedding');
const {
  resolveBestCategory,
  calculateMetrics,
  sanitizeText,
  formatCSVRow,
  shuffle,
} = require('../utils/helpers');

module.exports = async (
  inputFile,
  comparisonFile,
  outputFile,
  options = {}
) => {
  const {
    resultMetrics = false,
    evaluateModel = false,
    weightedVotes = true,
    comparisonPercentage = 80,
    maxSamplesToSearch = 40,
    similarityThresholdPercent = 30,
  } = options;

  const jsonData = JSON.parse(
    await fs.promises.readFile(comparisonFile, 'utf-8')
  );
  const randomized = shuffle(jsonData);
  const splitIndex = Math.round(
    randomized.length * (comparisonPercentage / 100)
  );
  const comparisonData = randomized.slice(0, splitIndex);
  const threshold = similarityThresholdPercent / 100;

  if (evaluateModel) {
    const evaluateData = randomized.slice(splitIndex);
    const evaluationResults = [];
    for (let i = 0; i < evaluateData.length; i += 100) {
      const chunk = evaluateData.slice(i, i + 100);
      const chunkResults = chunk.map((item) => {
        const searchResults = findNearestNeighbors(
          item.embedding,
          comparisonData,
          { topK: maxSamplesToSearch, threshold }
        );
        return {
          category: resolveBestCategory(searchResults, weightedVotes) || '???',
          confidence: searchResults[0]?.similarityScore || 0,
        };
      });
      evaluationResults.push(...chunkResults);
    }
    const metrics = calculateMetrics(evaluationResults, evaluateData);
    console.log('\n=== Model Evaluation ===');
    console.log(
      `Accuracy: ${((metrics.correct / metrics.total) * 100).toFixed(2)}%`
    );
  }

  const inputData = await parseCsvToJson(inputFile);
  const outputArr = [];
  for (let i = 0; i < inputData.length; i += 100) {
    const chunk = inputData.slice(i, i + 100);
    const sanitized = chunk.map((item) => sanitizeText(item.comment));
    const embeddings = await createEmbeddings(sanitized);

    const chunkResults = embeddings.map((item) => {
      const searchResults = findNearestNeighbors(
        item.embedding,
        comparisonData,
        { topK: maxSamplesToSearch, threshold }
      );
      return {
        text: item.text,
        category: resolveBestCategory(searchResults, weightedVotes) || '???',
        score: searchResults[0]?.similarityScore || 0,
        count: searchResults.length,
      };
    });
    outputArr.push(...chunkResults);
  }

  const headers = resultMetrics
    ? ['category', 'comment', 'nearest_cosine_score', 'similar_samples_count']
    : ['category', 'comment'];
  const csvRows = [formatCSVRow(headers)];
  outputArr.forEach((i) => {
    const row = resultMetrics
      ? [i.category, i.text, (i.score * 100).toFixed(2), i.count]
      : [i.category, i.text];
    csvRows.push(formatCSVRow(row));
  });

  await fs.promises.writeFile(outputFile, csvRows.join('\n'));
  console.log(`Results written to ${outputFile}`);
};
