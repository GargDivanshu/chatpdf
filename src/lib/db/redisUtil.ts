import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { loadS3IntoPinecone } from '@/lib/pinecone';  // Adjust the import path as necessary
import { db } from './index';  // Adjust the import path as necessary
import { chats } from './schema';  // Adjust the import path as necessary
import { getS3Url } from '@/lib/s3';  // Adjust the import path as necessary
import {redis} from './index'


const myQueue = new Queue('myQueue', {
  connection: redis,
});

// const queueScheduler = new QueueScheduler('myQueue', {
//   connection: redis,
// });

async function addJobToQueue(data: any) {
  const job = await myQueue.add('myJob', data);
  return job.id;
}

const worker = new Worker('myQueue', async (job) => {
  console.log('Processing job:', job.data);
  const { file_key, file_name, projectName, projectDescription, userId } = job.data;

  try {
    console.log(file_name + " :pdfName:")
    const result = await db
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

    // Save the result in Redis
    await redis.set(`job:${job.id}:result`, JSON.stringify(result), 'EX', 60 * 60); // Expires in 1 hour

    return result;
  } catch (error) {
    console.error('Error processing job:', job.id, error);
    throw error;  // Ensure the error is thrown so BullMQ can handle retries
  }
}, {
  connection: redis,
});

worker.on('completed', async (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job with id ${job.id} has failed with error ${err.message}`);
});

export { myQueue, addJobToQueue };
