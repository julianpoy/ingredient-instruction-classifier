const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const predict = require('./predict.js');

const app = express();
app.use(morgan(':method :url :status :response-time ms'));
app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
  const { sentences } = req.body;
  if (!sentences) {
    res.status(400).send('Must provide sentences');
    return;
  }

  const results = await predict(sentences);

  res.status(200).json(results);
});

const server = app.listen(parseInt(process.env.PORT || 3000, 10));

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
