import { S3, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  const s3 = new S3({
    region: process.env.NEXT_PUBLIC_S3_REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    },
  });

  const file_key =
    "uploads/" + Date.now().toString() + file.name.replace(/\s+/g, "-");

  // Log the generated file key
  console.log("Generated file key for upload:", file_key);

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: file_key,
    Body: file,
  };

  try {
    const data = await s3.send(new PutObjectCommand(params));
    console.log("File uploaded successfully:", data);
    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${file_key}`;
  return url;
}
