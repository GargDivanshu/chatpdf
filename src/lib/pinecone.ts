import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export const getPineconeClient = () => {
  return new Pinecone({
    // environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    // 1. Obtain the PDF -> download and read from PDF
    console.log("Downloading S3 into file system");
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) {
      throw new Error("Could not download from S3");
    }
    console.log("Loading PDF into memory: " + file_name);
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    // 2. Split and segment the PDF
    const documents = await Promise.all(pages.map(prepareDocument));

    // 3. Vectorize and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    // 4. Upload to Pinecone
    const client = await getPineconeClient();
    const pineconeIndex = await client.index("chatpdfproject");
    // Use the default namespace because gcp-starter do not support namespaces.
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

    console.log("Inserting vectors into Pinecone");
    await namespace.upsert(vectors);

    return documents[0];
  } catch (error) {
    console.error("Error in loadS3IntoPinecone:", error);
    throw error;
  }
}

async function embedDocument(doc: Document) {
  try {
    // Log the entire document structure for debugging
    console.log("Embedding document:", JSON.stringify(doc, null, 2));

    // Ensure document has the required structure
    if (!doc?.pageContent || !doc?.metadata) {
      console.error(`Invalid document structure: ${JSON.stringify(doc)}`);
      throw new Error(`Document structure is missing required properties: ${JSON.stringify(doc)}`);
    }

    // Log metadata for debugging
    console.log("Document metadata:", JSON.stringify(doc.metadata, null, 2));

    const metadata = doc.metadata as { text?: string; pageNumber?: number };

    if (!metadata.text || !metadata.pageNumber) {
      console.error(`Document metadata is missing required properties: ${JSON.stringify(metadata)}`);
      throw new Error(`Document metadata is missing required properties: ${JSON.stringify(metadata)}`);
    }

    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: metadata.text,
        pageNumber: metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.error("Error embedding document:", error);
    throw error;
  }
}




export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  // Split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  // Validate documents
  docs.forEach((doc, index) => {
    if (!doc.pageContent || !doc.metadata) {
      console.error(`Invalid document at index ${index}:`, doc);
      throw new Error("Invalid document structure detected");
    }

    const metadata = doc.metadata as { text?: string; pageNumber?: number };

    if (!metadata.text || !metadata.pageNumber) {
      console.error(`Document metadata is missing required properties: ${JSON.stringify(metadata)}`);
      throw new Error(`Document metadata is missing required properties: ${JSON.stringify(metadata)}`);
    }
  });

  return docs;
}

