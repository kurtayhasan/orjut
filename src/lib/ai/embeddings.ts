import { getGeminiClient, GEMINI_MODELS } from '@/lib/ai/gemini';

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const ai = getGeminiClient();

    // Ensure text is clean and within limits
    const cleanText = text.replace(/\n/g, ' ').trim();

    // Call the embedding model (text-embedding-004 is recommended for general text)
    const response = await ai.models.embedContent({
      model: GEMINI_MODELS.embedding,
      contents: cleanText,
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error('Failed to generate embedding from Gemini API');
    }

    // Return the array of floats
    return response.embeddings[0].values as number[];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}
