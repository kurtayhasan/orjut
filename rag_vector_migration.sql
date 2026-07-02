-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store your documents (e.g., knowledge base articles, PDFs, past weather, disease logs)
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL, -- The actual text content
  metadata jsonb, -- Metadata to filter on (e.g., land_id, document_type, date)
  embedding vector(768) -- Google's text-embedding-004 model outputs 768-dimensional vectors
);

-- Create a function to search for documents
-- This function uses cosine similarity (<=>) to find the closest documents to the query vector
CREATE OR REPLACE FUNCTION match_rag_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (rag_documents.embedding <=> query_embedding) AS similarity
  FROM rag_documents
  WHERE metadata @> filter_metadata -- Only match documents that have the required metadata
  AND 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create an index for faster similarity searches (optional but recommended for large datasets)
-- HNSW (Hierarchical Navigable Small World) index is highly efficient for vector search
CREATE INDEX ON public.rag_documents USING hnsw (embedding vector_cosine_ops);

-- RLS (Row Level Security) Policies
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" 
ON public.rag_documents FOR SELECT 
TO authenticated 
USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access to authenticated users" 
ON public.rag_documents FOR INSERT 
TO authenticated 
WITH CHECK (true);
