import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const client = new Pinecone({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index("chatpdfproject");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });

    if (!queryResult.matches) {
      console.error("Unexpected query result structure:", queryResult);
      throw new Error("Invalid query result structure from Pinecone");
    }

    return queryResult.matches;
  } catch (error) {
    console.error("Error querying embeddings:", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  try {
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    const qualifyingDocs = matches.filter(
      (match) => match.score && match.score > 0.7
    );

    type Metadata = {
      text: string;
      pageNumber: number;
    };

    let docs = qualifyingDocs?.map((match) => (match.metadata as Metadata).text);
    // 5 vectors
    return docs.join("\n").substring(0, 3000);
  } catch (error) {
    console.error("Error in getContext:", error);
    throw error;
  }
}
