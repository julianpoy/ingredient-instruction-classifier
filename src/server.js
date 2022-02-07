const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const os = require('os');
const { default: PQueue } = require('p-queue');

const predict = require('./predict');

const app = express();
app.use(morgan(':method :url :status :response-time ms'));
app.use(cors());
app.use(express.json());

// Use PREDICTION_CONCURRENCY to limit CPU and memory usage when handling many parallel requests
const PREDICTION_CONCURRENCY = parseInt(process.env.PREDICTION_CONCURRENCY || os.cpus().length, 10);

const queue = new PQueue({
  concurrency: PREDICTION_CONCURRENCY,
});

app.post('/', async (req, res) => {
  const { sentences } = req.body;
  if (!sentences) {
    res.status(400).send('Must provide sentences');
    return;
  }

  queue.add(async () => {
    const results = await predict(sentences);

    res.status(200).json(results);
  });
});

const server = app.listen(parseInt(process.env.PORT || 3000, 10));

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
