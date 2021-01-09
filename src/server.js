// tfjs-node-gpu will yield better performance if you have CUDA
const tf = require('@tensorflow/tfjs-node');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const usePromise = universalSentenceEncoder.load();
const classifierModelPromise = tf.loadLayersModel('https://recipesage-ml.s3-us-west-2.amazonaws.com/models/ingredient-instruction-text-classifier/prod/model.json');

// This value greatly affects RAM usage due to USE
// Higher values will tend to yield better performance, but higher RAM usage
const SENTENCE_EMBEDDING_BATCH_SIZE = 200;

app.post('/', async (req, res) => {
  const useModel = await usePromise;
  const classifierModel = await classifierModelPromise;

  const { sentences } = req.body;
  const tensors = [];
  for (var i = 0; i < sentences.length; i += SENTENCE_EMBEDDING_BATCH_SIZE) {
    const batch = sentences.slice(i, i + SENTENCE_EMBEDDING_BATCH_SIZE);

    const tensor = await useModel.embed(batch);
    tensors.push(tensor);
  }

  const tensor = tf.concat(tensors);

  const results = await classifierModel.predict(tensor).arraySync();

  res.status(200).json(results);
});

app.listen(parseInt(process.env.PORT || 3000));
