import { streamChatCompletion, getRateLimitStatus } from '@/lib/groq/client';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/supabase/embeddings';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check rate limit status
    const rateLimitStatus = getRateLimitStatus();
    if (!rateLimitStatus.canRequest) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((1 - rateLimitStatus.tokens) * 1) // seconds
        }, 
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Generate embedding for the user's message
    let contextText = '';
    try {
      const queryEmbedding = await generateEmbedding(message);
      
      // Fetch RAG Context (Similarity search using RPC)
      const { data: contextDocuments } = await supabase.rpc('match_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 3,
      });

      if (contextDocuments && contextDocuments.length > 0) {
        contextText = contextDocuments.map((doc: any) => doc.content).join('\n---\n');
      }
    } catch (embeddingError) {
      console.warn('Embedding generation failed, proceeding without RAG context:', embeddingError);
      // Continue without RAG context if embedding fails
    }

    // System Instructions for Plain-Language & Financial Educational Guardrails
    const systemPrompt = `
      You are BetterMinds, a supportive, empathetic financial education assistant for individuals re-entering society post-incarceration.
      Follow these constraints strictly:
      1. Explain concepts simply using 6th-to-8th grade reading level phrasing.
      2. Keep sentences short and clear.
      3. DISCLAIMER: State clearly that you provide financial education, NOT licensed legal or financial advice.
      4. Avoid freely calculating credit scores or loan interest rates; stick to the provided context.
      5. Be encouraging and supportive - acknowledge that rebuilding finances takes time and effort.
      6. If you don't know something specific, say so and suggest where they might find help.
      
      ${contextText ? `Vetted Educational Context:\n${contextText}\n\nUse this context to inform your answers, but always explain in simple terms.` : ''}
    `;

    // Groq Streaming Request
    const completion = await streamChatCompletion({
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: message },
      ],
      temperature: 0.2,
    });

    // Stream Response Setup
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Remaining': rateLimitStatus.tokens.toString(),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI chat query' }, 
      { status: 500 }
    );
  }
}
