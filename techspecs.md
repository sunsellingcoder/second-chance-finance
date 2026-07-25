# Technical Specification Document: BetterMinds Financial Rebuilding Platform

**Author:** Senior Principal Software Architect

**Project:** BetterMinds — Second-Chance Financial Rebuilding Assistant

**Stack:** Next.js (App Router, RSC, Server Actions), Supabase (Postgres, RLS, Storage, Auth), Groq API, TypeScript, Tailwind CSS

---

## Architectural Assumptions & Decisions

Prior to delving into the technical breakdown, the following architectural assumptions address ambiguities in the product requirements:

1. **Deterministic Rules Engine vs. AI Narration:** Timeline generation uses a strict, deterministic rule set written in pure TypeScript. The Groq LLM handles message narration and answering queries based on RAG context, preventing AI math hallucinations.


2. **Privacy-First Minimal Auth:** To accommodate users lacking permanent addresses, phone numbers, or official state IDs, sign-up supports minimal-friction credentials (email magic link or anonymous session conversion).


3. **Low-Bandwidth & Offline Capabilities:** Printable PDF plans are rendered server-side using React PDF to minimize client-side bundle size on older mobile devices.


4. **Vector Search Implementation:** Vector storage and similarity searches utilize the `pgvector` extension natively within Supabase, avoiding the latency and overhead of third-party vector databases.

---

## 1. System Architecture Overview

The platform uses a modern decoupled architecture where Next.js acts as both the frontend presenter (via React Server Components) and the lightweight backend orchestration layer (via Server Actions and API Route Handlers).

```
                      +---------------------------------------+
                      |         Client Browser / PWA          |
                      |   (Low-bandwidth, Mobile-first UI)    |
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / WebSockets
                                          v
                      +---------------------------------------+
                      |         Next.js App Router            |
                      |   - Edge / Node Middleware (Auth)     |
                      |   - Server Actions (Business Logic)   |
                      |   - Deterministic Timeline Engine     |
                      +---------+-------------------+---------+
                                |                   |
                 Direct SDK /   |                   | Groq SDK /
                 @supabase/ssr  |                   | OpenAI Proxy
                                v                   v
          +-----------------------+               +-----------------------+
          |     Supabase BaaS     |               |       Groq API        |
          | - Postgres + pgvector |               | - Llama 3.3 70B Engine|
          | - Auth Services       |               | - Low-latency Stream  |
          | - Row Level Security  |               +-----------------------+
          | - Object Storage      |
          +-----------------------+

```

### Key Subsystems & Data Flow

1. **Intake & Timeline Generation Flow:** Client submits intake responses $\rightarrow$ Next.js Server Action executes the **Deterministic Rules Engine** $\rightarrow$ Milestone records are saved in Supabase Postgres $\rightarrow$ Groq API synthesizes a plain-language summary for narration.


2. **RAG-Grounded AI Chat Flow:** User inputs query $\rightarrow$ Server Action fetches vector embedding $\rightarrow$ Queries `pgvector` in Supabase via Cosine Distance ($1 - \text{similarity}$) $\rightarrow$ Top matching vetted content is injected into Groq system prompt $\rightarrow$ Streamed response returned to client UI.



---

## 2. Database Schema & Data Model

### PostgreSQL Schema & Vector Support

```sql
-- Enable Vector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'case_manager', 'admin');
CREATE TYPE product_type AS ENUM ('checking', 'secured_card', 'credit_builder_loan', 'counseling_org');

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'user' NOT NULL,
  reading_level TEXT DEFAULT '8th_grade' NOT NULL,
  state_code VARCHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. User Intake Responses
CREATE TABLE public.intake_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  has_bank_account BOOLEAN NOT NULL,
  has_state_id BOOLEAN NOT NULL,
  has_ssn_card BOOLEAN NOT NULL,
  has_restitution_debt BOOLEAN NOT NULL,
  employment_status TEXT NOT NULL,
  raw_responses JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Personalized Timelines
CREATE TABLE public.user_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_month_step INT DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Timeline Milestones
CREATE TABLE public.timeline_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id UUID NOT NULL REFERENCES public.user_timelines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_month INT NOT NULL,
  step_order INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Second-Chance Product Directory
CREATE TABLE public.product_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  type product_type NOT NULL,
  supported_states TEXT[] DEFAULT '{}', -- Empty array implies nationwide
  requires_permanent_address BOOLEAN DEFAULT TRUE NOT NULL,
  requires_credit_check BOOLEAN DEFAULT FALSE NOT NULL,
  monthly_fee NUMERIC(6, 2) DEFAULT 0.00 NOT NULL,
  affiliate_link TEXT,
  red_flags TEXT[],
  is_vetted BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. RAG Knowledge Base & Embeddings
CREATE TABLE public.knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'restitution', 'id_recovery', 'credit_reports'
  content TEXT NOT NULL,
  embedding vector(1536), -- Dimension based on embedding model choice
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_intake_user ON public.intake_responses(user_id);
CREATE INDEX idx_milestones_timeline ON public.timeline_milestones(timeline_id);
CREATE INDEX idx_products_vetted ON public.product_directory(is_vetted, type);
CREATE INDEX idx_knowledge_embedding ON public.knowledge_embeddings USING hnsw (embedding vector_cosine_ops);

```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_directory ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Intake Responses: Isolated access
CREATE POLICY "Users can manage own intake" ON public.intake_responses
  FOR ALL USING (auth.uid() = user_id);

-- Timelines & Milestones: User ownership checks
CREATE POLICY "Users view own timelines" ON public.user_timelines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own milestones" ON public.timeline_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_timelines
      WHERE user_timelines.id = timeline_milestones.timeline_id
      AND user_timelines.user_id = auth.uid()
    )
  );

-- Product Directory: Read-only for authenticated and anonymous users
CREATE POLICY "Anyone can view vetted products" ON public.product_directory
  FOR SELECT USING (is_vetted = TRUE);

```

---

## 3. Authentication & Authorization Flow

Auth is powered by `@supabase/ssr` to ensure server-side auth token handling across Next.js Server Components, Server Actions, and Route Handlers.

```
       +--------------+                    +--------------------+                    +------------------+
       | Browser/User |                    | Next.js Middleware |                    |  Supabase Auth   |
       +-------+------+                    +---------+----------+                    +--------+---------+
               |                                     |                                        |
               | ---- Access /dashboard -----------> |                                        |
               |                                     | ---- Get Auth Cookie / Session ------> |
               |                                     | <--- Return Session Active ----------- |
               |                                     |                                        |
               | <--- Render Dashboard Page -------- |                                        |
               |      (If Session Invalid: Redirect) |                                        |

```

### Next.js Middleware Implementation (`middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Guard protected routes
  const protectedRoutes = ['/dashboard', '/timeline', '/chat'];
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

```

---

## 4. Groq API Integration Architecture

The AI layer relies on Groq's high-speed inference engine using the `llama-3.3-70b-versatile` model. Streaming responses are handled using the Vercel AI SDK or native ReadableStreams via Next.js Server Actions.

```
+--------------------+        +---------------------+        +--------------------+        +-------------------+
|  User Asks Chat    | -----> | Fetch RAG Context   | -----> | Construct Prompt   | -----> | Stream Response   |
|  "What is a card?" |        | (Supabase Vector)   |        | (Strict System Rules)|      | (Groq Inference)  |
+--------------------+        +---------------------+        +--------------------+        +-------------------+

```

### Groq Streaming Route Handler (`app/api/chat/route.ts`)

```typescript
import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const supabase = await createClient();

    // 1. Fetch RAG Context (Similarity search using RPC)
    const { data: contextDocuments } = await supabase.rpc('match_knowledge', {
      query_text: message,
      match_threshold: 0.7,
      match_count: 3,
    });

    const contextText = contextDocuments?.map((doc: any) => doc.content).join('\n---\n') || '';

    // 2. System Instructions for Plain-Language & Financial Educational Guardrails
    const systemPrompt = `
      You are BetterMinds, a supportive, empathetic financial education assistant for individuals re-entering society post-incarceration.
      Follow these constraints strictly:
      1. Explain concepts simply using 6th-to-8th grade reading level phrasing.
      2. Keep sentences short and clear.
      3. DISCLAIMER: State clearly that you provide financial education, NOT licensed legal or financial advice.
      4. Avoid freely calculating credit scores or loan interest rates; stick to the provided context.
      
      Vetted Educational Context:
      ${contextText}
    `;

    // 3. Groq Streaming Request
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.2,
      stream: true,
    });

    // 4. Stream Response Setup
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI chat query' }, { status: 500 });
  }
}

```

---

## 5. Storage Architecture

Supabase Storage manages user document copies (e.g., ID applications, court restitution records) and cached, static PDF exports.

### Bucket Allocation & Policies

1. **`user-documents` (Private Bucket):** Stores sensitive client-uploaded materials.


2. **`generated-plans` (Public/Signed Access Bucket):** Stores generated static action plans for offline printing.



### Direct Client-Side Upload via Presigned Signed URLs

To keep heavy network streams off Next.js server instances, uploads generate server-authorized presigned URLs.

```typescript
// app/actions/storage.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUploadPresignedUrl(fileName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const filePath = `${user.id}/${Date.now()}-${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('user-documents')
    .createSignedUploadUrl(filePath);

  if (error) throw new Error(error.message);

  return { signedUrl: data.signedUrl, path: filePath };
}

```

---

## 6. Next.js Project Structure

```text
betterminds/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── callback/route.ts
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── timeline/page.tsx
│   │   ├── directory/page.tsx
│   │   └── chat/page.tsx
│   ├── api/
│   │   ├── chat/route.ts
│   │   └── pdf/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/               # Primary components (Buttons, Cards, Badges)
│   ├── chat/             # Chat interface, streaming response components
│   ├── timeline/         # Interactive timeline checklist & milestone components
│   └── directory/        # Filterable second-chance product listings
├── lib/
│   ├── engine/           # Deterministic credit timeline logic
│   │   └── rules.ts
│   ├── supabase/         # Client, Server, and Middleware browser instances
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── groq/             # Client configuration & rate-limit wrappers
│       └── client.ts
├── actions/              # Next.js Server Actions (Intake, Progress updates)
│   ├── intake.ts
│   └── timeline.ts
├── types/                # System-wide TypeScript definitions
│   ├── database.types.ts
│   └── timeline.ts
├── middleware.ts
└── tailwind.config.js

```

---

## 7. Environment Variables & Security

### `.env.local` Requirements

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Groq API
GROQ_API_KEY="gsk_..."

# Application Limits & Settings
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

```

### Security Measures & Defensive Code Practices

1. **Input Validation:** All input payloads (intake choices, chat messages) must pass strict schema validation using `Zod` prior to state mutations.
2. **API Rate Limiting Algorithm:** The chat system protects downstream Groq quotas using an In-Memory Token Bucket implementation. Rate limit evaluation follows:

$$Token\_Bucket = \min\left(Capacity, \; Current + \Delta t \cdot Rate\right)$$

```typescript
// Simple Token-Bucket Abstraction for API endpoints
const capacity = 10;
const fillRatePerSec = 1;
let tokens = capacity;
let lastCheck = Date.now();

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

```

3. **Prominent Educational Disclaimers:** UI elements display sticky disclaimers clarifying that the output is purely educational and not licensed legal/financial advice.



---

## 8. Implementation Roadmap

```
+-----------------------------------------------------------------------------------+
|  PHASE 1: Core System & MVP Setup                                                 |
|  - Postgres schema initialization, RLS execution, & Auth routing                  |
|  - Deterministic timeline rules engine development & unit testing                 |
|  - Basic Groq streaming chat route with RAG integration                           |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|  PHASE 2: V1 Feature Expansion                                                    |
|  - Interactive milestone checklist UI with dynamic timeline recalculation         |
|  - Server-side PDF plan compilation for print/offline access                      |
|  - Directory filtration system with explicit red-flag warnings                    |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|  PHASE 3: Production Readiness & Enterprise Features                              |
|  - Case Manager Dashboard tier (Consented client progress oversight)              |
|  - System audits (Accessibility testing, Low-bandwidth performance tuning)       |
|  - Automated integration testing and deployment to Vercel/Supabase Edge           |
+-----------------------------------------------------------------------------------+

```