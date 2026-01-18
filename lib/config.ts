import { GoogleGenerativeAI } from '@google/generative-ai';
import { CohereClient } from 'cohere-ai';
import Groq from 'groq-sdk';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY environment variable');
}

if (!process.env.COHERE_API_KEY) {
  throw new Error('Missing COHERE_API_KEY environment variable');
}

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Configuration constants
export const CHUNK_SIZE = 1000; // tokens
export const CHUNK_OVERLAP = 100; // 10% overlap
export const EMBEDDING_MODEL = 'text-embedding-004';
export const LLM_MODEL = 'llama-3.3-70b-versatile'; // Groq's free fast model
export const TOP_K_RETRIEVAL = 10;
export const TOP_K_RERANK = 5;
