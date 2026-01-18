import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const COLLECTION_NAME = process.env.VECTOR_COLLECTION_NAME || 'rag_documents';
export const EMBEDDING_DIMENSION = parseInt(process.env.EMBEDDING_DIMENSION || '768');
