"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2, ArrowUpFromLine } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [projectName, setprojectName] = useState("");
  const [projectDescription, setprojectDescription] = useState("");

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({ file_key, file_name }) => {
      const response = await axios.post("/api/create-chat", { file_key, file_name, projectName, projectDescription });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!projectName || !projectDescription) {
        toast.error("File name and description are required");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Something went wrong");
          return;
        }

        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created! Consider visiting Dashboard!!");
            console.log("Chat created: ", chat_id);
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("Error creating chat: " + err);
          },
        });
      } catch (error) {
        toast.error("Upload error: " + error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div className="mb-4">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setprojectName(e.target.value)}
          placeholder="Project name"
          className="bg-gray-50 mt-1 block w-full sm:text-sm border-gray-300 rounded-md p-2 focus:outline-none border-[1px]"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={projectDescription}
          onChange={(e) => setprojectDescription(e.target.value)}
          placeholder="File Description"
          className="bg-gray-50 mt-1 block w-full sm:text-sm border-gray-300 rounded-md p-2 focus:outline-none border-[1px]"
        />
      </div>
      <div
        {...getRootProps({
          className: "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isLoading ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Synthesizing responses from GPT...</p>
          </>
        ) : (
          <>
            <ArrowUpFromLine className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Upload PDF</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
