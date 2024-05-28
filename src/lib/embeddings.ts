import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response?.text();
      console.error("Error response from OpenAI API:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.error("Unexpected response structure:", result);
      throw new Error("Invalid response structure from OpenAI API");
    }

    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("Error calling OpenAI embeddings API:", error);
    throw error;
  }
}
