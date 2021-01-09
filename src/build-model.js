const tf = require('@tensorflow/tfjs-node-gpu');
const fs = require('fs');
const path = require('path');
const universalSentenceEncoder = require('@tensorflow-models/universal-sentence-encoder');

const buildEncodedSentences = async (sentences) => {
  const model = await universalSentenceEncoder.load();
  const batchSize = 2000;

  const tensors = [];
  for (let sentenceIdx = 0; sentenceIdx < sentences.length; sentenceIdx += batchSize) {
    const sentenceBatch = sentences.slice(sentenceIdx, sentenceIdx + batchSize);
    // eslint-disable-next-line no-await-in-loop
    const tensor = await model.embed(sentenceBatch);
    tensors.push(tensor);
  }

  return tf.concat(tensors);
};

// Use for deduping within same type
const dedupeCategoryData = (entries) => {
  const seen = new Set();
  return entries.filter((entry) => {
    const isSeen = seen.has(entry.text);
    seen.add(entry.text);
    return !isSeen;
  });
};

// Use for deduping entire dataset - will ensure that an entry does not exist across multiple types
const dedupeTrainingData = (entries) => {
  const duplicates = [];

  entries.forEach((entry1, idx1) => {
    entries.forEach((entry2, idx2) => {
      if (entry1.text === entry2.text && idx1 !== idx2) {
        duplicates.push(entry1, entry2);
      }
    });
  });

  const dedupedEntries = [...entries];
  duplicates.forEach((duplicate) => {
    dedupedEntries.splice(dedupedEntries.indexOf(duplicate), 1);
  });

  return dedupedEntries;
};

// Types:
// 1: Ingredient
// 2: Instruction
// 3: Non-recipe text

const INGREDIENTS_DATA_PATH = path.resolve(__dirname, '../data/ingredients.json'); // Should be a JSON file - array of strings
const INSTRUCTIONS_DATA_PATH = path.resolve(__dirname, '../data/instructions.json'); // Should be a JSON file - array of strings
const NON_RECIPE_DATA_PATH = path.resolve(__dirname, '../data/non-recipe-text.txt'); // Should be a text file - one text sample per line
const TESTING_SAMPLES_DATA_PATH = path.resolve(__dirname, '../data/testing-samples.json'); // // Should be a JSON file - array of objects with keys "text" and "type"
const MODEL_OUTPUT_PATH = path.resolve(__dirname, '../model');

const run = async () => {
  const startTime = Date.now();

  const ingredients = dedupeCategoryData(
    JSON.parse(fs.readFileSync(INGREDIENTS_DATA_PATH)).map((element) => ({
      text: element.trim(),
      type: 1,
    })),
  );

  const instructions = dedupeCategoryData(
    JSON.parse(fs.readFileSync(INSTRUCTIONS_DATA_PATH)).map((element) => ({
      text: element.trim(),
      type: 2,
    })),
  );

  const nonRecipeText = dedupeCategoryData(
    fs.readFileSync(NON_RECIPE_DATA_PATH)
      .toString()
      .toLowerCase()
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => ({
        text: line.trim(),
        type: 3,
      })),
  );

  console.log(`${ingredients.length} ingredients loaded`);
  console.log(`${instructions.length} instructions loaded`);
  console.log(`${nonRecipeText.length} non-recipe texts loaded`);

  const smallestDatasetLength = Math.min(
    instructions.length,
    ingredients.length,
    nonRecipeText.length,
  );

  const trainingSamples = dedupeTrainingData([
    ...instructions.slice(0, smallestDatasetLength - 1),
    ...ingredients.slice(0, smallestDatasetLength - 1),
    ...nonRecipeText.slice(0, smallestDatasetLength - 1),
  ]).sort(() => Math.floor((Math.random() * 3) - 1));

  console.log('Total number of training samples (restricted by smallest dataset):', trainingSamples.length);

  const testingSamples = JSON.parse(fs.readFileSync(TESTING_SAMPLES_DATA_PATH));

  console.log('Building word vectors...');
  const trainingData = await buildEncodedSentences(trainingSamples.map((item) => item.text));
  const testingData = await buildEncodedSentences(testingSamples.map((item) => item.text));

  console.log('Building ouput data tensor...');
  const trainingDataOutput = tf.tensor2d(trainingSamples.map((item) => [
    item.type === 1 ? 1 : 0,
    item.type === 2 ? 1 : 0,
    item.type === 3 ? 1 : 0,
  ]));
  const testingDataOutput = tf.tensor2d(testingSamples.map((item) => [
    item.type === 1 ? 1 : 0,
    item.type === 2 ? 1 : 0,
    item.type === 3 ? 1 : 0,
  ]));

  console.log('Building model');

  const model = tf.sequential();

  // Add layers to the model
  model.add(tf.layers.dense({
    inputShape: [512],
    activation: 'sigmoid',
    units: 3,
  }));

  model.add(tf.layers.dense({
    inputShape: [3],
    activation: 'sigmoid',
    units: 3,
  }));

  model.add(tf.layers.dense({
    inputShape: [3],
    activation: 'sigmoid',
    units: 3,
  }));

  // Compile the model
  model.compile({
    loss: 'meanSquaredError',
    optimizer: tf.train.adam(0.06),
    metrics: ['accuracy'],
  });

  await model.fit(
    trainingData,
    trainingDataOutput,
    {
      batchSize: 32,
      epochs: 20,
      validationSplit: 0.20,
      callbacks: [
        tf.callbacks.earlyStopping(),
      ],
    },
  );

  const [testLoss, testAcc] = model.evaluate(testingData, testingDataOutput, { batchSize: 128 });
  console.log(`Evaluation loss: ${(await testLoss.data())[0].toFixed(4)}`);
  console.log(`Evaluation accuracy: ${(await testAcc.data())[0].toFixed(4)}`);

  console.log('Saving model...');

  await model.save(`file://${MODEL_OUTPUT_PATH}`);

  const secondsElapsed = (Date.now() - startTime) / 1000;
  console.log(`Done building model in ${secondsElapsed} seconds.`);
};

run();
