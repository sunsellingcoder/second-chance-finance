import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Token bucket rate limiting
const capacity = 10;
const fillRatePerSec = 1;
let tokens = capacity;
let lastCheck = Date.now();

/**
 * Check rate limit using token bucket algorithm
 * Token_Bucket = min(Capacity, Current + Δt × Rate)
 */
export function checkRateLimit(): boolean {
  const now = Date.now();
  const delta = (now - lastCheck) / 1000;
  lastCheck = now;
  tokens = Math.min(capacity, tokens + delta * fillRatePerSec);

  if (tokens >= 1) {
    tokens -= 1;
    return true;
  }
  return false;
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus() {
  const now = Date.now();
  const delta = (now - lastCheck) / 1000;
  const currentTokens = Math.min(capacity, tokens + delta * fillRatePerSec);
  
  return {
    tokens: currentTokens,
    capacity,
    canRequest: currentTokens >= 1,
  };
}

/**
 * Stream chat completion with Groq
 */
export async function streamChatCompletion(options: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}) {
  // Check rate limit before making request
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: options.messages as any,
    temperature: options.temperature || 0.2,
    max_tokens: options.maxTokens || 1024,
    stream: true,
  });

  return completion;
}

/**
 * Non-streaming chat completion with Groq
 */
export async function chatCompletion(options: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}) {
  // Check rate limit before making request
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: options.messages as any,
    temperature: options.temperature || 0.2,
    max_tokens: options.maxTokens || 1024,
    stream: false,
  });

  return completion;
}

export default groq;
