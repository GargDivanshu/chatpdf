import { Worker, Queue } from 'bullmq';
import { loadS3IntoPinecone } from './pinecone';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { getS3Url } from '@/lib/s3';
import { createClient } from 'redis';

// Wrap the client creation in an async function and await it
const createRedisClient = async () => {
  const client = createClient({
    url: 'redis://redis:6379', // Use the Docker service name for Redis
  });

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  // Wait for the client to be ready
  await new Promise((resolve, reject) => {
    client.on('ready', resolve);
    client.on('error', reject);
  });

  return client;
};

// Use async/await to create the Redis client
const redisClient = await createRedisClient();

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
