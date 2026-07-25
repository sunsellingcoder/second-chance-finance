# BetterMinds Financial Rebuilding Platform - Development Guide

## Project Overview

This is a Next.js 16.2.11 application designed to help recently incarcerated individuals and those with limited financial literacy build a stronger financial future through education, resources, and personalized timelines.

## Tech Stack

- **Frontend**: Next.js 16.2.11 (App Router, RSC, Server Actions)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **AI**: Groq API (Llama 3.3 70B) with RAG implementation
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Database**: PostgreSQL with pgvector extension

## Key Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

### Database Setup
```bash
# Run migrations in Supabase SQL editor
supabase/migrations/001_initial_schema.sql

# Optional: Seed data
supabase/seed.sql
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `GROQ_API_KEY` - Groq API key for AI chat
- `NEXT_PUBLIC_SITE_URL` - Application URL (e.g., http://localhost:3000)

## Architecture

### Deterministic Timeline Engine
- Location: `lib/engine/rules.ts`
- Uses strict TypeScript rules for timeline generation
- No AI involved in timeline generation (prevents hallucinations)
- AI only used for narration via Groq API

### AI Chat with RAG
- Location: `app/api/chat/route.ts`
- Uses Groq API with Llama 3.3 70B model
- RAG implementation with pgvector for similarity search
- Rate limiting: Token bucket algorithm (10 requests, 1 refill/second)
- Educational guardrails in system prompts

### Authentication
- Magic link authentication via Supabase Auth
- Routes: `app/(auth)/login/page.tsx`, `app/(auth)/callback/route.ts`
- Middleware: `middleware.ts` for route protection
- Currently allows demo access to timeline/chat for testing

### Database Schema
- Tables: profiles, intake_responses, user_timelines, timeline_milestones, product_directory, knowledge_embeddings
- Row Level Security (RLS) enabled on all tables
- Vector extension (pgvector) for RAG similarity search

## Project Structure

```
app/
├── (auth)/              # Authentication routes
│   ├── login/          # Magic link login
│   ├── callback/       # OAuth callback handler
│   └── auth-code-error/ # Error page for auth failures
├── api/
│   └── chat/           # AI chat API route with streaming
├── chat/               # Chat interface page
├── timeline/           # Timeline generation and tracking
├── resources/          # Product directory
└── page.tsx            # Home page

actions/                # Server Actions
├── intake.ts          # Intake form processing
├── timeline.ts        # Timeline milestone management
├── storage.ts        # File upload/download operations
└── products.ts        # Product directory queries

lib/
├── engine/
│   └── rules.ts      # Deterministic timeline rules
├── groq/
│   └── client.ts     # Groq API client with rate limiting
└── supabase/
    ├── client.ts      # Browser Supabase client
    ├── server.ts      # Server Supabase client
    ├── middleware.ts  # Middleware Supabase client
    └── embeddings.ts  # Vector embedding operations

supabase/
├── migrations/
│   └── 001_initial_schema.sql  # Database schema
└── seed.sql          # Sample data for products and knowledge base

types/
├── database.types.ts # TypeScript database types
└── timeline.ts       # Timeline-specific types
```

## Important Notes

### Embedding Generation
- Currently using placeholder embeddings (zero vectors)
- Production implementation requires embedding API (e.g., OpenAI text-embedding-3-small)
- Update `lib/supabase/embeddings.ts` `generateEmbedding()` function

### Storage Buckets
- Must create manually in Supabase:
  - `user-documents` (private bucket)
  - `generated-plans` (public bucket)

### Rate Limiting
- Token bucket algorithm implemented in `lib/groq/client.ts`
- 10 requests capacity, 1 refill per second
- Check rate limit status before making Groq API calls

### Security
- All Server Actions include user authentication checks
- RLS policies ensure users can only access their own data
- Input validation using Zod schemas
- File operations verify user ownership via path prefixes

## Development Workflow

1. **Feature Development**: Create feature branch, implement changes
2. **Testing**: Test locally with `npm run dev`
3. **Database Changes**: Create new migration file in `supabase/migrations/`
4. **Type Safety**: Update TypeScript types in `types/` as needed
5. **Build Verification**: Run `npm run build` to check for errors

## Known Issues / TODOs

- [ ] Implement actual embedding generation (currently placeholder)
- [ ] Enable strict route protection in middleware (currently demo mode)
- [ ] Add comprehensive error handling and logging
- [ ] Implement PDF generation for offline timeline access
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline

## Deployment

1. **Vercel**: Recommended for Next.js deployment
2. **Environment Variables**: Must be set in deployment platform
3. **Database**: Run migrations in Supabase production project
4. **Storage**: Create storage buckets in production Supabase

## Additional Resources

- Next.js 16 Documentation: Check `node_modules/next/dist/docs/` for latest API info
- Supabase Docs: https://supabase.com/docs
- Groq API: https://console.groq.com/docs
- Tailwind CSS 4: Latest version has breaking changes from v3
