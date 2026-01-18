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

/**
 * Get list of all unique documents with their metadata
 */
export async function getDocumentsList(): Promise<Array<{
  source: string;
  title?: string;
  chunkCount: number;
  firstSeen: string;
}>> {
  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('metadata, created_at');

  if (error) {
    throw new Error(`Failed to get documents list: ${error.message}`);
  }

  // Group by source and aggregate
  const docsMap = new Map<string, {
    source: string;
    title?: string;
    chunkCount: number;
    firstSeen: string;
  }>();

  data?.forEach((doc: any) => {
    const source = doc.metadata.source;
    if (docsMap.has(source)) {
      const existing = docsMap.get(source)!;
      existing.chunkCount++;
      // Keep earliest created_at
      if (doc.created_at < existing.firstSeen) {
        existing.firstSeen = doc.created_at;
      }
    } else {
      docsMap.set(source, {
        source,
        title: doc.metadata.title,
        chunkCount: 1,
        firstSeen: doc.created_at || new Date().toISOString(),
      });
    }
  });

  return Array.from(docsMap.values()).sort((a, b) => 
    new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime()
  );
}

