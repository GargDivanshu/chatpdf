import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createClient } from 'redis';
import { Queue, Worker } from 'bullmq';

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("database url not found");
}

const sql = neon(process.env.DATABASE_URL);

// Redis client setup
// const redisClient = createClient({
//   url: 'redis://127.0.0.1:6379',
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));

// await redisClient.connect();

export const db = drizzle(sql);
// export const redis = redisClient;