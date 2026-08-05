-- Security fixes migration for existing database
-- This updates functions to use SECURITY INVOKER instead of SECURITY DEFINER
-- and removes the security-invasive view if it exists

-- Drop the security-invasive view if it was created
DROP VIEW IF EXISTS public.knowledge_base_view;

-- Update the match_knowledge function to use SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(1536),
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
BEGIN
  RETURN QUERY
  SELECT
    knowledge_embeddings.id,
    knowledge_embeddings.title,
    knowledge_embeddings.category,
    knowledge_embeddings.content,
    1 - (knowledge_embeddings.embedding <=> query_embedding) as similarity
  FROM public.knowledge_embeddings
  WHERE 1 - (knowledge_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Update the match_knowledge_by_text function to use SECURITY INVOKER
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

-- Update the handle_new_user function to use SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, reading_level)
  VALUES (NEW.id, 'user', '8th_grade');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;