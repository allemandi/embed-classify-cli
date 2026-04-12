const logger = require('../utils/logger');
const fs = require('fs');
const { processCsvForEmbedding } = require('../utils/csv');
const { createEmbeddings } = require('../utils/embedding');
const { sanitizeText } = require('../utils/sanitizer');

const path = require('path');

const csvEmbedding = async (inputFile, outputFile = 'data/embedding.json') => {
  try {
    const csvHeaderStrings = {
      category: 'category',
      comment: 'comment',
    };

    const commentHeader = csvHeaderStrings.comment;
    const categoryHeader = csvHeaderStrings.category;
    const fileData = await processCsvForEmbedding(
      inputFile,
      categoryHeader,
      commentHeader
    );

    // More efficient data structuring and sanitization in one pass
    const trainingData = {
      categories: [],
      cleanedComments: [],
    };

    for (const item of fileData) {
      trainingData.categories.push(item.category);
      trainingData.cleanedComments.push(sanitizeText(item.comment));
    }

    const embeddings = await createEmbeddings(trainingData.cleanedComments);
    const classifiedEmbeddings = embeddings.map((item, index) => ({
      category: trainingData.categories[index],
      ...item,
    }));

    // Ensure directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      await fs.promises.mkdir(outputDir, { recursive: true });
    }

    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(classifiedEmbeddings, null, 2)
    );
    logger.info(`Successfully wrote to ${outputFile}`);
  } catch (error) {
    logger.error(`Failed to process CSV: ${error.message}`);
    throw error;
  }
};

module.exports = csvEmbedding;
