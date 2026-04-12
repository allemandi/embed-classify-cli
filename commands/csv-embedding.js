const fs = require('fs');
const path = require('path');
const { processCsvForEmbedding } = require('../utils/csv');
const { createEmbeddings } = require('../utils/embedding');
const { sanitizeText } = require('../utils/helpers');

module.exports = async (inputFile, outputFile = 'data/embedding.json') => {
  try {
    const fileData = await processCsvForEmbedding(inputFile, 'category', 'comment');
    const cleanedComments = fileData.map((item) => sanitizeText(item.comment));
    const embeddings = await createEmbeddings(cleanedComments);
    const result = embeddings.map((item, i) => ({ category: fileData[i].category, ...item }));

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) await fs.promises.mkdir(outputDir, { recursive: true });

    await fs.promises.writeFile(outputFile, JSON.stringify(result, null, 2));
    console.log(`Successfully wrote to ${outputFile}`);
  } catch (error) {
    console.error(`Failed to process CSV: ${error.message}`);
    throw error;
  }
};
