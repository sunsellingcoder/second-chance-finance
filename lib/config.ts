/**
 * Environment Configuration and Validation
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key',
  GROQ_API_KEY: 'Groq API key for AI chat',
  NEXT_PUBLIC_SITE_URL: 'Application URL',
} as const;

const optionalEnvVars = {
  OPENAI_API_KEY: 'OpenAI API key for embeddings (required for RAG functionality)',
} as const;

export function validateEnvVars() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missing.push(`${key} (${description})`);
    }
  }

  // Check optional environment variables
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`${key} (${description})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(m => `- ${m}`).join('\n')}\n\n` +
      `Please create a .env.local file with the required variables. See .env.local.example for reference.`
    );
  }

  if (warnings.length > 0) {
    console.warn(
      `Warning: Missing optional environment variables:\n${warnings.map(w => `- ${w}`).join('\n')}\n\n` +
      `Some features may not work correctly without these variables.`
    );
  }

  return {
    valid: true,
    warnings,
  };
}

export function getEnvVar(key: keyof typeof requiredEnvVars): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnvVar(key: keyof typeof optionalEnvVars): string | undefined {
  return process.env[key];
}