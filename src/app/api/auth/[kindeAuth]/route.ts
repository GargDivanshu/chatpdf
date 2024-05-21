import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";


export async function GET(request:NextResponse, {params}:any) {
    const endpoint = params.kindeAuth;
    return handleAuth(request, endpoint)
}