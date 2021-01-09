# Ingredient & Instruction Classifier

This repository contains a TensorFlow model and example express server for classifying sentences as either ingredient, instruction, or other.

This is particularly useful when pulling recipe information from a site (see https://github.com/julianpoy/recipeclipper ).

## Usage

The TensorFlow model exists in the `model` folder. The `src/server.js` file provides an example of usage.

The example server can easily be spun up with docker-compose.

To use within a node project:

```
const predict = require('@julianpoy/ingredient-instruction-classifier/src/predict.js');

const sentences = [
  "1 lb all purpose flour",
  "add all purpose flour to mixing bowl",
  "I absolutely love cooking, it's my favorite pastime",
];

const results = await predict(sentences);

// Results is array of arrays:
[
  [float, float, float] // Result for sentence one
  [float, float, float] // Result for sentence two
  ...
];

// Array positions:
// Idx 0: Ingredient
// Idx 1: Instruction
// Idx 2: Non-recipe text
```
