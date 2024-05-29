// pages/chat-list.tsx (or any appropriate file name in the pages directory)

import React from 'react';
// import { GetServerSideProps } from 'next';
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"



type Chat = {
  id: number;
  userId: string;
  pdfName: string;
};

type Props = {
    params: {
      user_Id: string;
    };
  };

const Page: React.FC<Props> = async ({ params: {user_Id}}:Props) => {
    const { userId } = await auth();
    if (!userId) {
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        },
      };
    }
    const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

    function formatDateToIST(dateString: string): string {
      const date = new Date(dateString);
      
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short'
      };
    
      return date.toLocaleString('en-IN', options);
    }

console.log(_chats[0])
  return (
    <div className="flex min-h-screen pb-20 flex-col gap-2 mt-4 mx-auto">
      <span className="text-3xl font-bold text-center mx-auto">DASHBOARD</span>


<div >
    <Table>
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className="">Project Name</TableHead>
          <TableHead className="">PDF Name</TableHead>
          <TableHead>Project Description</TableHead>
          <TableHead>Created At</TableHead>
          {/* <TableHead className="text-right">Amount</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {_chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
          <TableRow className="hover:cursor-pointer">
            <TableCell className="font-medium">{chat.projectName}</TableCell>
            <TableCell className="font-medium">{chat.pdfName}</TableCell>
            <TableCell>{chat.projectDesc}</TableCell>
            <TableCell>{formatDateToIST(chat.createdAt)}</TableCell>
            {/* <TableCell className="text-right">{chat.totalAmount}</TableCell> */}
          </TableRow>
          </Link>
        ))}
      </TableBody>
    </Table>
    </div>
    </div>
  );
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { userId } = await auth();

//   if (!userId) {
//     return {
//       redirect: {
//         destination: '/sign-in',
//         permanent: false,
//       },
//     };
//   }

//   const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

//   return {
//     props: {
//       _chats,
//     },
//   };
// };

export default Page;
