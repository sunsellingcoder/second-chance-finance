import { createClient } from './server';

/**
 * Gets embedding for text using OpenAI API
 * Uses text-embedding-3-small model for cost-effective generation
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, using placeholder embeddings. Please configure OPENAI_API_KEY for production.');
    return new Array(1536).fill(0);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    // Fallback to zero vector on error
    return new Array(1536).fill(0);
  }
}

/**
 * Adds knowledge content to the RAG knowledge base
 */
export async function addKnowledgeContent(data: {
  title: string;
  category: string;
  content: string;
}) {
  const supabase = await createClient();
  
  const embedding = await generateEmbedding(data.content);
  
  const { error } = await supabase
    .from('knowledge_embeddings')
    .insert({
      title: data.title,
      category: data.category,
      content: data.content,
      embedding: embedding,
    });
  
  if (error) throw error;
}

/**
 * Searches knowledge base using vector similarity
 */
export async function searchKnowledge(queryEmbedding: number[], threshold = 0.7, count = 3) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: count,
  });
  
  if (error) throw error;
  return data;
}

/**
 * Searches knowledge base using text query (generates embedding internally)
 * This is a convenience function that combines embedding generation and search
 */
export async function searchKnowledgeByText(queryText: string, threshold = 0.7, count = 3) {
  const queryEmbedding = await generateEmbedding(queryText);
  return searchKnowledge(queryEmbedding, threshold, count);
}
