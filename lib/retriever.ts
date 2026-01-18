import { cohere } from './config';
import { searchDocuments, SearchResult } from './vectorStore';
import { generateQueryEmbedding } from './embeddings';
import { TOP_K_RETRIEVAL, TOP_K_RERANK } from './config';

export interface RerankedResult extends SearchResult {
  rerankScore: number;
  citationIndex: number;
}

/**
 * Retrieve documents using vector similarity search
 */
export async function retrieveDocuments(
  query: string,
  topK: number = TOP_K_RETRIEVAL
): Promise<SearchResult[]> {
  const queryEmbedding = await generateQueryEmbedding(query);
  const results = await searchDocuments(queryEmbedding, topK);
  return results;
}

/**
 * Rerank retrieved documents using Cohere Rerank API
 */
export async function rerankDocuments(
  query: string,
  documents: SearchResult[],
  topN: number = TOP_K_RERANK
): Promise<RerankedResult[]> {
  if (documents.length === 0) {
    return [];
  }

  const rerankedResponse = await cohere.rerank({
    query,
    documents: documents.map(doc => doc.content),
    topN,
    model: 'rerank-english-v3.0',
  });

  const rerankedResults: RerankedResult[] = rerankedResponse.results.map((result, idx) => {
    const originalDoc = documents[result.index];
    return {
      ...originalDoc,
      rerankScore: result.relevanceScore,
      citationIndex: idx + 1,
    };
  });

  return rerankedResults;
}

/**
 * Main retrieval pipeline: retrieve + rerank
 */
export async function retrieveAndRerank(
  query: string
): Promise<{
  results: RerankedResult[];
  timing: {
    retrievalMs: number;
    rerankMs: number;
    totalMs: number;
  };
}> {
  const startTime = Date.now();
  
  // Step 1: Retrieve
  const retrievalStart = Date.now();
  const retrievedDocs = await retrieveDocuments(query);
  const retrievalMs = Date.now() - retrievalStart;
  
  // Step 2: Rerank
  const rerankStart = Date.now();
  const rerankedDocs = await rerankDocuments(query, retrievedDocs);
  const rerankMs = Date.now() - rerankStart;
  
  const totalMs = Date.now() - startTime;
  
  return {
    results: rerankedDocs,
    timing: {
      retrievalMs,
      rerankMs,
      totalMs,
    },
  };
}
