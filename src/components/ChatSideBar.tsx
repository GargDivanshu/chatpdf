"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { FileText, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="w-full min-h-screen overflow-scroll soff p-4 text-gray-200 bg-gray-600">
      <Link href="/">
        <Button className="w-full border-white border">
          {/* <PlusCircle className="mr-2 w-4 h-4" /> */}
          Chat with new PDF
        </Button>
      </Link>

      <div className="flex min-h-screen pb-20 flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-[#0F172A] text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <FileText className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

   
    </div>
  );
};

export default ChatSideBar;
