/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * Returns a new shuffled array.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} A new shuffled array.
 */
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Splits an array into chunks of a specified size.
 * @param {Array} array - The array to split.
 * @param {number} size - The size of each chunk.
 * @returns {Array[]} An array of chunks.
 */
const chunkArray = (array, size) => {
  if (size <= 0) return [array];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

module.exports = {
  shuffle,
  chunkArray,
};
