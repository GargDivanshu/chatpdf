import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { addJobToQueue } from '@/lib/db/redisUtil';
import Redis from 'ioredis';

// const redisHost = process.env.REDIS_HOST || 'redis';
// const redisPort = process.env.REDIS_PORT || '6379';
// const redisUrl = `redis://${redisHost}:${redisPort}`;

// const redisClient = new Redis(redisUrl);

// /api/create-chat
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name, projectName, projectDescription } = body;
    console.log(file_key, file_name);

    const jobId = await addJobToQueue({
      fileKey: file_key,
      fileName: file_name,
      projectName,
      projectDescription,
      userId,
    });

    return NextResponse.json(
      {
        jobId: jobId[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}