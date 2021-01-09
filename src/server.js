const express = require('express');
const cors = require('cors');
const predict = require('./predict.js');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  const { sentences } = req.body;

  const results = await predict(sentences);

  res.status(200).json(results);
});

app.listen(parseInt(process.env.PORT || 3000, 10));
