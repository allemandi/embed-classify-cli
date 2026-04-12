const { program } = require('commander');

// Commands
const csvEmbedding = require('./commands/csv-embedding');
const embeddingClassification = require('./commands/embedding-classification');

program
  .command('csv-embedding')
  .description('Create embedding JSON from CSV')
  .requiredOption(
    '-i, --inputFile <filepath>',
    'File path to the CSV for creating embeddings'
  )
  .option(
    '-o, --outputFile <filepath>',
    'File path to the output embedding JSON',
    'data/embedding.json'
  )
  .action(async (cmdObj) => {
    await csvEmbedding(cmdObj.inputFile, cmdObj.outputFile);
  });

program
  .command('embedding-classification')
  .description('Classify input CSV against existing JSON')
  .requiredOption(
    '-i, --inputFile <filepath>',
    'File path to unclassified input'
  )
  .requiredOption(
    '-c, --comparisonFile <filepath>',
    'File path to the embedding JSON'
  )
  .requiredOption(
    '-o, --outputFile <filepath>',
    'File path to write predicted results'
  )
  .option('-r, --resultMetrics', 'Include to add metrics to outputFile')
  .option(
    '-e, --evaluateModel',
    'Include to run evaluation for comparison dataset'
  )
  .option('--no-weightedVotes', 'Do not use weighted votes for classification')
  .option(
    '--comparisonPercentage <number>',
    'Percentage of dataset to use for comparison',
    (val) => parseInt(val, 10),
    80
  )
  .option(
    '--maxSamplesToSearch <number>',
    'Maximum number of samples to search',
    (val) => parseInt(val, 10),
    40
  )
  .option(
    '--similarityThresholdPercent <number>',
    'Minimum similarity percentage for a sample to be considered',
    (val) => parseInt(val, 10),
    30
  )
  .action(async (cmdObj) => {
    await embeddingClassification(
      cmdObj.inputFile,
      cmdObj.comparisonFile,
      cmdObj.outputFile,
      {
        resultMetrics: cmdObj.resultMetrics,
        evaluateModel: cmdObj.evaluateModel,
        weightedVotes: cmdObj.weightedVotes,
        comparisonPercentage: cmdObj.comparisonPercentage,
        maxSamplesToSearch: cmdObj.maxSamplesToSearch,
        similarityThresholdPercent: cmdObj.similarityThresholdPercent,
      }
    );
  });

program.parseAsync(process.argv);
