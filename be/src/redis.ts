import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from 'redis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local development reads be/.env. Docker injects be/.env.development through
// env_file, and dotenv does not overwrite those existing environment values.
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const redisHost = process.env.REDIS_HOST ?? 'localhost';
const redisPort = Number(process.env.REDIS_PORT ?? 6379);

if (!Number.isInteger(redisPort) || redisPort < 1 || redisPort > 65535) {
  throw new Error(`Invalid REDIS_PORT: ${process.env.REDIS_PORT}`);
}

const redisUrl =
  process.env.REDIS_URL ?? `redis://${redisHost}:${redisPort}`;

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (error) => {
  console.error('Redis client error:', error);
});

redisClient.on('connect', () => {
  console.log(`Redis connecting to ${redisHost}:${redisPort}...`);
});

redisClient.on('ready', () => {
  console.log('Redis connection ready');
});

redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

let connectionPromise: ReturnType<typeof redisClient.connect> | undefined;

export async function connectRedis(): Promise<typeof redisClient> {
  if (redisClient.isOpen) {
    return redisClient;
  }

  connectionPromise ??= redisClient.connect().finally(() => {
    connectionPromise = undefined;
  });

  await connectionPromise;
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.close();
  }
}

export default redisClient;
