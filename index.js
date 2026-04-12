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
    'File path for the output embedding JSON',
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
    '-e, --evaluteModel',
    'Include to run evaluation for comparison dataset'
  )
  .option('--no-weightedVotes', 'Disable weighted voting for classification')
  .option(
    '--comparisonPercentage <number>',
    'Percentage of comparison dataset to use',
    (val) => parseInt(val, 10),
    80
  )
  .option(
    '--maxSamplesToSearch <number>',
    'Maximum number of similar samples to search',
    (val) => parseInt(val, 10),
    40
  )
  .option(
    '--similarityThresholdPercent <number>',
    'Minimum similarity threshold percentage',
    (val) => parseInt(val, 10),
    30
  )
  .action(async (cmdObj) => {
    const config = {
      weightedVotes: cmdObj.weightedVotes,
      comparisonPercentage: cmdObj.comparisonPercentage,
      maxSamplesToSearch: cmdObj.maxSamplesToSearch,
      similarityThresholdPercent: cmdObj.similarityThresholdPercent,
    };
    await embeddingClassification(
      cmdObj.inputFile,
      cmdObj.comparisonFile,
      cmdObj.outputFile,
      cmdObj.resultMetrics,
      cmdObj.evaluteModel,
      config
    );
  });

program.parseAsync(process.argv);
