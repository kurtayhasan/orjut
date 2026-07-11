/**
 * Shared Gemini client factory (server-side only).
 * Prefer importing this instead of constructing GoogleGenAI ad-hoc.
 */

import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

export const GEMINI_MODELS = {
  /** Dashboard chat / light completions */
  flash: 'gemini-2.0-flash',
  /** Embeddings */
  embedding: 'text-embedding-004',
} as const;
