// Types:
// 1: Ingredient
// 2: Instruction
// 3: Non-ingredient and non-instruction
const getPredictionType = (prediction) => {
  const max = Math.max(...prediction);

  return prediction.indexOf(max) + 1;
};

module.exports = {
  getPredictionType,
};
