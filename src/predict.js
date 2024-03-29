const tf = require('@tensorflow/tfjs-node');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');

const { MODEL_URL } = process.env;

const usePromise = universalSentenceEncoder.load();
const classifierModelPromise = tf.loadLayersModel(MODEL_URL);

// This value greatly affects RAM usage due to USE
// Higher values will tend to yield better performance, but higher RAM usage
const SENTENCE_EMBEDDING_BATCH_SIZE = parseInt(
  process.env.SENTENCE_EMBEDDING_BATCH_SIZE || 200,
  10,
);

const predict = async (sentences) => {
  const useModel = await usePromise;
  const classifierModel = await classifierModelPromise;

  const tensors = [];
  for (let i = 0; i < sentences.length; i += SENTENCE_EMBEDDING_BATCH_SIZE) {
    const batch = sentences.slice(i, i + SENTENCE_EMBEDDING_BATCH_SIZE);

    // eslint-disable-next-line no-await-in-loop
    const tensor = await useModel.embed(batch);
    tensors.push(tensor);
  }

  if (!tensors.length) return [];

  const tensor = tf.concat(tensors);

  const resultTensors = classifierModel.predict(tensor);

  const results = await resultTensors.arraySync();

  // Must clean up after tensorflow, since it'll leak memory otherwise
  tensors.forEach((_tensor) => tf.dispose(_tensor));
  tf.dispose(resultTensors);
  tf.dispose(tensor);

  console.log('Current tensors in memory:', tf.memory().numTensors, 'Current TF mem bytes:', tf.memory().numBytes);

  return results;
};

module.exports = predict;
