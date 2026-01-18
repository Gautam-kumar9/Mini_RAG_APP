import { supabase, COLLECTION_NAME } from './supabase';

export interface VectorDocument {
  id?: number;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    title?: string;
    section?: string;
    position: number;
    chunkSize: number;
    overlap: number;
  };
}

export interface SearchResult {
  id: number;
  content: string;
  metadata: VectorDocument['metadata'];
  similarity: number;
}

/**
 * Upsert documents into the vector database
 * Strategy: Insert new documents with embeddings
 */
export async function upsertDocuments(documents: VectorDocument[]): Promise<void> {
  const { error } = await supabase
    .from(COLLECTION_NAME)
    .insert(documents);

  if (error) {
    throw new Error(`Failed to upsert documents: ${error.message}`);
  }
}

/**
 * Search for similar documents using vector similarity
 */
export async function searchDocuments(
  queryEmbedding: number[],
  topK: number = 10
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: topK,
  });

  if (error) {
    throw new Error(`Failed to search documents: ${error.message}`);
  }

  return data || [];
}

/**
 * Clear all documents from the collection
 */
export async function clearDocuments(): Promise<void> {
  const { error } = await supabase
    .from(COLLECTION_NAME)
    .delete()
    .neq('id', 0); // Delete all rows

  if (error) {
    throw new Error(`Failed to clear documents: ${error.message}`);
  }
}

/**
 * Get document count
 */
export async function getDocumentCount(): Promise<number> {
  const { count, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to get document count: ${error.message}`);
  }

  return count || 0;
}
