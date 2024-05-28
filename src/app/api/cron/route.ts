import fs from "fs";
import path from "path";
// import cron from "node-cron";
import { NextApiRequest, NextApiResponse } from "next";

// // Function to delete files starting with 'tmp__' in the root directory


// // Schedule the cron job to run every day at midnight
// cron.schedule("0 0 * * *", () => {
//   console.log("Running cron job to delete temp files...");
//   deleteTempFiles();
// });


const deleteTempFiles = () => {
  const rootDir = path.resolve("./");
  fs.readdir(rootDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      if (file.startsWith("tmp__")) {
        const filePath = path.join(rootDir, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file}:`, err);
          } else {
            console.log(`Deleted file: ${file}`);
          }
        });
      }
    });
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  deleteTempFiles();
  res.status(200).end("Hello Cron!");
}