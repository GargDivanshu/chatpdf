import Redis from 'ioredis';
import { NextResponse } from "next/server";
import {redis} from '@/lib/db/index'

// /api/job-status
export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  try {
    const result = await redis.get(`job:${jobId}:result`);
    if (!result) {
      return NextResponse.json({ status: "pending" }, { status: 200 });
    }

    return NextResponse.json(
      {
        status: "completed",
        result: JSON.parse(result),
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
