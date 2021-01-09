// This file is mostly intended to test the model itself, rather than predict.js

const predict = require('./predict.js');
const { getPredictionType } = require('./util.js');

const ingredients = [
  '1 cup granulated sugar',
  '2 tablespoons Vegetable or Canola Oil',
  '1 cup dry long-grain white rice',
  '1 8- ounce can tomato sauce',
  '16 ounces warm water',
  '1 teaspoon chili powder',
  '2 teaspoons Calde de Tomate tomato bouillon',
  '2 teaspoons minced garlic about 2 cloves',
];

const instructions = [
  'Heat oil in a 5 quart saute pan over medium-high heat. Add rice. Cook rice, stirring constantly, for several minutes, until rice begins to turn a golden color.',
  'Reduce heat to low to avoid spattering. Gently pour in warm water, then tomato sauce and stir. Stir in chili powder, Calde de Tomate and minced garlic. Turn heat back up to medium-high, bring to a boil, then reduce to low and cover. Simmer for 20 minutes, or until all water has been absorbed.',
  'Turn off heat, fluff rice then let sit, covered, for 5-10 minutes before serving.',
];

const nonRecipeText = [
  'We’ve done the creamy red pepper sauce thing before, a few times – like here, with cashews and roasted cauliflower, and here, with almond milk and zucchini noodles, and here, with the butter and fettuccine and shrimp. But this version is special because it sees us just as we are in this moment:',
  'I like GOOD olive oil, QUALITY pasta, ACTUALLY DELICIOUS jarred roasted red peppers are the best ingredients to add.',
  'Brand allegiance aside, I can’t say enough good things about this creamy red pepper pasta situation.',
];

describe('model predictions', () => {
  it('classifies ingredients correctly', async () => {
    const predictions = await predict(ingredients);

    predictions.forEach((prediction, idx) => {
      // Idx included so that test failure shows array position
      expect([idx, getPredictionType(prediction)]).toEqual([idx, 1]);
    });
  });

  it('classifies instructions correctly', async () => {
    const predictions = await predict(instructions);

    predictions.forEach((prediction, idx) => {
      // Idx included so that test failure shows array position
      expect([idx, getPredictionType(prediction)]).toEqual([idx, 2]);
    });
  });

  it('classifies non recipe text correctly', async () => {
    const predictions = await predict(nonRecipeText);

    predictions.forEach((prediction, idx) => {
      // Idx included so that test failure shows array position
      expect([idx, getPredictionType(prediction)]).toEqual([idx, 3]);
    });
  });
});
