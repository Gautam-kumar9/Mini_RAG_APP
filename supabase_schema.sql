-- Enable pgvector extension
create extension if not exists vector;

-- Create the documents table with vector embeddings
create table if not exists rag_documents (
  id bigserial primary key,
  content text not null,
  embedding vector(768),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for vector similarity search using HNSW
create index if not exists rag_documents_embedding_idx 
  on rag_documents 
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Create an index on metadata for filtering
create index if not exists rag_documents_metadata_idx 
  on rag_documents 
  using gin (metadata);

-- Function to search for similar documents
create or replace function match_documents (
  query_embedding vector(768),
  match_count int default 10,
  filter jsonb default '{}'::jsonb
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    rag_documents.id,
    rag_documents.content,
    rag_documents.metadata,
    1 - (rag_documents.embedding <=> query_embedding) as similarity
  from rag_documents
  where rag_documents.metadata @> filter
  order by rag_documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
