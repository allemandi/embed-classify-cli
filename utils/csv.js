const csv = require('csvtojson');
const path = require('path');

const parseCsvToJson = async (filePath) => {
  try {
    const jsonArray = await csv().fromFile(path.resolve(filePath));
    if (!jsonArray?.length) throw new Error('CSV file is empty or invalid');
    return jsonArray;
  } catch (error) {
    throw new Error(`Failed to parse CSV file: ${error.message}`, { cause: error });
  }
};

const processCsvForEmbedding = async (filePath, categoryColumn, textColumn) => {
  try {
    const csvData = await parseCsvToJson(filePath);
    const processedData = csvData
      .filter((row) => row[categoryColumn]?.trim() && row[textColumn]?.trim())
      .sort((a, b) => a[categoryColumn].localeCompare(b[categoryColumn]));

    if (!processedData.length) throw new Error('No valid data rows found after filtering');
    return processedData;
  } catch (error) {
    throw new Error(`CSV processing failed: ${error.message}`, { cause: error });
  }
};

module.exports = { parseCsvToJson, processCsvForEmbedding };
