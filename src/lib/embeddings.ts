import { GoogleGenAI } from '@google/genai';

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Ensure text is clean and within limits
    const cleanText = text.replace(/\n/g, ' ').trim();

    // Call the embedding model (text-embedding-004 is recommended for general text)
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
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
