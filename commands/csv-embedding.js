const logger = require('../utils/logger');
const fs = require('fs');
const { processCsvForEmbedding } = require('../utils/csv');
const { createEmbeddings } = require('../utils/embedding');
const { batchSanitize } = require('../utils/sanitizer');

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

    // More efficient data structuring
    const trainingData = {
      category: fileData.map((item) => item.category),
      comment: fileData.map((item) => item.comment),
    };

    // Use batchSanitize for better performance and cleaner code
    const cleanedComments = batchSanitize(trainingData.comment);

    const embeddings = await createEmbeddings(cleanedComments);
    const classifiedEmbeddings = embeddings.map((item, index) => ({
      category: trainingData.category[index],
      ...item,
    }));

    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(classifiedEmbeddings, null, 2)
    );
    logger.info(`Successfully wrote to ${outputFile}`);
  } catch (error) {
    logger.error(`Failed to process CSV: ${error.message}`);
    throw new Error(`Failed to process CSV: ${error.message}`, {
      cause: error,
    });
  }
};

module.exports = csvEmbedding;
