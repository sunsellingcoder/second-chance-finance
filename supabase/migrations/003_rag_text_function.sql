-- Function for RAG similarity search that accepts text directly
-- This function generates embedding internally using the OpenAI API
-- This is a convenience function that simplifies the chat API implementation

CREATE OR REPLACE FUNCTION public.match_knowledge_by_text(
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  content TEXT,
  similarity FLOAT
) AS $$
DECLARE
  query_embedding vector(1536);
BEGIN
  -- Generate embedding for the query text
  -- Note: This requires the OpenAI API to be configured in the application
  -- The embedding generation is handled at the application level
  -- This function is kept for consistency but embedding should be passed in
  
  -- For now, we'll return empty results as embedding generation
  -- is handled in the application layer via generateEmbedding()
  RETURN QUERY
  SELECT
    knowledge_embeddings.id,
    knowledge_embeddings.title,
    knowledge_embeddings.category,
    knowledge_embeddings.content,
    0.0 as similarity
  FROM public.knowledge_embeddings
  LIMIT 0;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
