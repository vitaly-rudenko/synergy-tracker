import fs from 'fs/promises';
import express from 'express'

const endpoint = 'https://fitness-kit.synergy.fitness/clubs/get_clients_in_club_count/?club_id=1'

const INTERVAL_MS = 10 * 60_000; // every 10 minutes
const TRUNCATE_SIZE = 100_000; // keep last 100k counts
const TRUNCATE_EVERY_ITERATION = 1_000; // truncate counts every 1000 iterations

let iteration = 0;

async function start() {
  await fs.mkdir('./storage', { recursive: true });

  setInterval(async () => {
    iteration++;
    if (iteration > TRUNCATE_EVERY_ITERATION) {
      iteration = 0;
      await truncateCounts();
    }

    await fs.appendFile('./storage/counts.txt', `${Date.now()} ${await fetchCount()}\n`);
  }, INTERVAL_MS)

  const app = express();
  app.use(express.json())

  app.get('/counts', async (_, res) => {
    const counts = await fs.readFile('./storage/counts.txt', 'utf-8');

    res.send({
      counts: counts
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [timestamp, count] = line.split(' ');
          return { timestamp: Number(timestamp), count: Number(count) };
        })
    });
  });

  const port = Number(process.env.PORT || 3000)
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
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
