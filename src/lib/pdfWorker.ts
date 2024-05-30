import { Worker, Queue } from 'bullmq';
import { loadS3IntoPinecone } from './pinecone';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { getS3Url } from '@/lib/s3';
import redis, { createClient } from 'redis';

// Wrap the client creation in an async function and await it
const createRedisClient = async () => {
  return await redis?.createClient({
    url: '127.0.0.1:6379', // Replace with your Redis URL
  });
};

// Use async/await to create the Redis client
const redisClient = await createRedisClient();

// Handle connection errors
redisClient?.on('error', (err) => {
  console.error('Redis error:', err);
});

export const pdfQueue = new Queue('pdf-processing', { connection: redisClient });

const worker = new Worker('pdf-processing', async (job) => {
  const { fileKey, fileName, projectName, projectDescription, userId } = job.data;

  try {
    // Step 1: Load S3 file into Pinecone
    await loadS3IntoPinecone(fileKey);

    // Step 2: Insert chat record into the database
    const chatId = await db
      .insert(chats)
      .values({
        fileKey,
        pdfName: fileName,
        pdfUrl: getS3Url(fileKey),
        projectName,
        projectDesc: projectDescription,
        userId,
      })
      .returning({ insertedId: chats.id });

    // Step 3: Return chat ID
    return chatId[0].insertedId;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error; // Propagate the error to trigger job retry or handle it elsewhere
  }
});

export default worker;