import { createReadStream } from 'fs';
import fs from 'fs/promises';
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const endpoint = 'https://fitness-kit.synergy.fitness/clubs/get_clients_in_club_count/?club_id=1'

const INTERVAL_MS = 10 * 60_000; // every 10 minutes
const TRUNCATE_SIZE = 100_000; // keep last 100k counts
const TRUNCATE_EVERY_ITERATION = 1_000; // truncate counts every 1000 iterations

let iteration = 0;

async function start() {
  await fs.mkdir('./storage', { recursive: true });

  writeCounts()
    .then(() => setInterval(() => writeCounts(), INTERVAL_MS));

  const app = express();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    }
  }));

  app.get('/counts.txt', (_, res) => {
    const stream = createReadStream('./storage/counts.txt', 'utf-8');
    stream.pipe(res);
  });

  const port = Number(process.env.PORT || 3000)
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

async function writeCounts() {
  try {
    iteration++;
    if (iteration > TRUNCATE_EVERY_ITERATION) {
      iteration = 0;
      await truncateCounts();
    }

    const count = await Promise.race([
      fetchCount(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout!')), 30_000)),
    ])

    await fs.appendFile('./storage/counts.txt', `${new Date().toISOString()} ${count}\n`);
  } catch (error) {
    console.error('Error writing counts:', error);
  }
}

async function fetchCount() {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (typeof data?.count !== 'number') {
    throw new Error(`Invalid response: ${JSON.stringify(data)}`);
  }

  return data.count;
}

async function truncateCounts() {
  const counts = await fs.readFile('./storage/counts.txt', 'utf-8');
  const lines = counts.split('\n');
  if (lines.length > TRUNCATE_SIZE) {
    await fs.writeFile('./storage/counts.txt', lines.slice(-TRUNCATE_SIZE).join('\n'));
  }
}

start()
  .then(() => console.log('Started!'))
  .catch((error) => console.error('Error:', error));
