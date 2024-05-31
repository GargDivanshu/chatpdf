import { Queue, Worker } from 'bullmq';
import { redis } from './index';
import { loadS3IntoPinecone } from '@/lib/pinecone';  // Adjust the import path as necessary
import { db } from './index';  // Adjust the import path as necessary
import { chats } from './schema';  // Adjust the import path as necessary
import { getS3Url } from '@/lib/s3';  // Adjust the import path as necessary

// Create a queue
const myQueue = new Queue('myQueue', {
  connection: redis,
});

// Add a job to the queue (example function, call this where appropriate)
async function addJobToQueue(data: any) {
  await myQueue.add('myJob', data);
}

// Define a worker to process jobs from the queue
const worker = new Worker('myQueue', async (job) => {
  console.log('Processing job:', job.data);
  const { file_key, file_name, projectName, projectDescription, userId } = job.data;

  try {
    await loadS3IntoPinecone(file_key);
    await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        projectName,
        projectDesc: projectDescription,
        userId,
      })
      .returning({
        insertedId: chats.id,
      });
  } catch (error) {
    console.error('Error processing job:', job.id, error);
    throw error;  // Ensure the error is thrown so BullMQ can handle retries
  }
}, {
  connection: redis,
});

worker.on('completed', (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job with id ${job.id} has failed with error ${err.message}`);
});

export { myQueue, addJobToQueue };