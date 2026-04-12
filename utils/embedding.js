const { pipeline } = require('@huggingface/transformers');
const logger = require('./logger');

const createEmbeddings = async (textArr) => {
  if (!Array.isArray(textArr) || textArr.length === 0) {
    throw new Error('Input must be a non-empty array of strings');
  }
  try {
    // Cache the pipeline instance
    if (!createEmbeddings.extractor) {
      createEmbeddings.extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { dtype: 'fp32' }
      );
    }

    const embedding = await createEmbeddings.extractor(textArr, {
      pooling: 'mean',
      normalize: true,
    });

    if (!embedding) {
      throw new Error('No embedding generated');
    }

    const embeddingOutput = embedding.tolist();

    if (!Array.isArray(embeddingOutput) || embeddingOutput.length === 0) {
      throw new Error('Invalid embedding output');
    }

    return textArr.map((text, i) => ({
      text,
      embedding: embeddingOutput[i],
    }));
  } catch (error) {
    logger.error('Error creating embeddings:', error);
    return textArr.map((text) => ({
      text,
      embedding: [],
    }));
  }
};

module.exports = {
  createEmbeddings,
};
