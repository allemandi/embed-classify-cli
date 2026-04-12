const { pipeline } = require('@huggingface/transformers');

const createEmbeddings = async (textArr) => {
  if (!Array.isArray(textArr) || textArr.length === 0) {
    throw new Error('Input must be a non-empty array of strings');
  }
  try {
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

    if (!embedding) throw new Error('No embedding generated');

    const embeddingOutput = embedding.tolist();
    return textArr.map((text, i) => ({
      text,
      embedding: embeddingOutput[i],
    }));
  } catch (error) {
    console.error('Error creating embeddings:', error);
    return textArr.map((text) => ({ text, embedding: [] }));
  }
};

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
};

const findNearestNeighbors = (queryEmbedding, samples, { topK = 10, threshold = 0 } = {}) => {
  return samples
    .map((sample) => ({
      ...sample,
      similarityScore: cosineSimilarity(queryEmbedding, sample.embedding),
    }))
    .filter((sample) => sample.similarityScore >= threshold)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, topK);
};

module.exports = {
  createEmbeddings,
  findNearestNeighbors,
};
