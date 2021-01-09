const tf = require('@tensorflow/tfjs-node');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');

const MODEL_URL = process.env.MODEL_URL || 'https://recipesage-ml.s3-us-west-2.amazonaws.com/models/ingredient-instruction-text-classifier/prod/model.json';

const usePromise = universalSentenceEncoder.load();
const classifierModelPromise = tf.loadLayersModel(MODEL_URL);

// This value greatly affects RAM usage due to USE
// Higher values will tend to yield better performance, but higher RAM usage
const SENTENCE_EMBEDDING_BATCH_SIZE = process.env.SENTENCE_EMBEDDING_BATCH_SIZE || 200;

const predict = async (sentences) => {
  const useModel = await usePromise;
  const classifierModel = await classifierModelPromise;

  const tensors = [];
  for (var i = 0; i < sentences.length; i += SENTENCE_EMBEDDING_BATCH_SIZE) {
    const batch = sentences.slice(i, i + SENTENCE_EMBEDDING_BATCH_SIZE);

    const tensor = await useModel.embed(batch);
    tensors.push(tensor);
  }

  const tensor = tf.concat(tensors);

  const results = await classifierModel.predict(tensor).arraySync();

  return results;
};

module.exports = predict;
