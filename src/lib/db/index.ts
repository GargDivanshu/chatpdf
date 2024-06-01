import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("database url not found");
}

const sql = neon(process.env.DATABASE_URL);

// ioredis client setup
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || '6379';
// const redisUrl = `redis://${redisHost}:${redisPort}`;
const redisUrl = '127.0.0.1:6379'

// ioredis client setup
const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.on('connect', () => {
  console.log('Redis Client Connected');

  // Pinging the Redis server to check its health
  redisClient.ping((err, result) => {
    if (err) {
      console.log('Error pinging Redis:', err);
    } else {
      console.log('Redis server response:', result); // Should print 'PONG'
    }
  });
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

// Optional: Set a regular interval to ping the server and check its health
setInterval(() => {
  redisClient.ping((err, result) => {
    if (err) {
      console.log('Error pinging Redis:', err);
    } else {
      console.log('Redis server response:', result); // Should print 'PONG'
    }
  });
}, 60000); // Ping every 60 seconds

export const db = drizzle(sql);
export const redis = redisClient;
