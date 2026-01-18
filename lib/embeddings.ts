import { genAI, CHUNK_SIZE, CHUNK_OVERLAP, EMBEDDING_MODEL } from './config';

export interface TextChunk {
  content: string;
  metadata: {
    source: string;
    title?: string;
    section?: string;
    position: number;
    chunkSize: number;
    overlap: number;
  };
}

/**
 * Split text into chunks with overlap
 * Strategy: 1000 tokens per chunk with 100 token (10%) overlap
 */
export function chunkText(
  text: string,
  source: string,
  title?: string
): TextChunk[] {
  const chunks: TextChunk[] = [];
  
  // Simple word-based chunking (approximation: 1 token ≈ 0.75 words)
  const words = text.split(/\s+/);
  const wordsPerChunk = Math.floor(CHUNK_SIZE * 0.75);
  const overlapWords = Math.floor(CHUNK_OVERLAP * 0.75);
  
  let position = 0;
  
  for (let i = 0; i < words.length; i += (wordsPerChunk - overlapWords)) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    const content = chunkWords.join(' ');
    
    if (content.trim().length === 0) continue;
    
    chunks.push({
      content,
      metadata: {
        source,
        title,
        position,
        chunkSize: CHUNK_SIZE,
        overlap: CHUNK_OVERLAP,
      },
    });
    
    position++;
  }
  
  return chunks;
}

/**
 * Generate embeddings for text chunks using Google Gemini
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    const result = await model.embedContent(text);
    embeddings.push(result.embedding.values);
  }
  
  return embeddings;
}

/**
 * Generate a single embedding for a query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(query);
  return result.embedding.values;
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost for embeddings
 */
export function estimateEmbeddingCost(tokenCount: number): number {
  // Google text-embedding-004: FREE (no cost)
  return 0;
}
