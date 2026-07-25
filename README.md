# BetterMinds Financial Rebuilding Platform

A Next.js application designed to help recently incarcerated individuals and those with limited financial literacy build a stronger financial future through education, resources, and personalized timelines.

## Tech Stack

- **Frontend**: Next.js 16.2.11 (App Router, RSC, Server Actions)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **AI**: Groq API (Llama 3.3 70B) with RAG implementation
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Database**: PostgreSQL with pgvector extension for vector similarity search

## Features

- **Personalized Financial Timelines**: Deterministic rules engine generates customized rebuilding plans
- **AI-Powered Chat**: RAG-grounded AI assistant for financial education
- **Product Directory**: Vetted second-chance financial products with filtering
- **Secure Authentication**: Magic link authentication via Supabase Auth
- **Document Storage**: Secure file upload and management via Supabase Storage
- **Privacy-First**: Row Level Security (RLS) ensures data isolation

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account (free tier works)
- Groq API key (free tier available)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd second_chance_finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and fill in your credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # Groq API
   GROQ_API_KEY="gsk_..."
   
   # Application
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. **Set up Supabase database**
   
   - Create a new Supabase project
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - (Optional) Run seed data: `supabase/seed.sql`

5. **Configure Supabase Storage**
   
   Create two storage buckets:
   - `user-documents` (private bucket for user uploads)
   - `generated-plans` (public bucket for PDF exports)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
second_chance_finance/
├── app/                          # Next.js app directory
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   └── callback/
│   ├── api/                     # API routes
│   │   └── chat/
│   ├── chat/                    # Chat page
│   ├── timeline/                # Timeline page
│   ├── resources/               # Resources page
│   └── page.tsx                 # Home page
├── actions/                     # Server Actions
│   ├── intake.ts
│   ├── timeline.ts
│   ├── storage.ts
│   └── products.ts
├── components/                  # React components
├── lib/                         # Core libraries
│   ├── engine/                  # Timeline rules engine
│   ├── groq/                    # Groq AI client
│   └── supabase/                # Supabase clients
├── supabase/                    # Database migrations and seeds
│   └── migrations/
├── types/                       # TypeScript definitions
└── middleware.ts               # Next.js middleware
```

## Key Implementation Details

### Deterministic Timeline Engine

The timeline generation uses strict, deterministic rules written in pure TypeScript (`lib/engine/rules.ts`). This ensures:

- **Consistency**: Same inputs always produce same outputs
- **No AI Hallucinations**: Mathematical rules prevent AI errors
- **Transparency**: Clear logic for each milestone

### RAG-Powered AI Chat

The chat system uses:
- **Vector Search**: pgvector for similarity matching
- **Context Injection**: Vetted financial content in system prompts
- **Rate Limiting**: Token bucket algorithm (10 req/min)
- **Educational Guardrails**: Strict system prompts prevent unauthorized advice

### Security Measures

- **Row Level Security**: Database-level access control
- **Input Validation**: Zod schemas on all inputs
- **Rate Limiting**: Protects API quotas
- **Secure Storage**: Presigned URLs for file uploads
- **Auth Middleware**: Route protection for sensitive areas

## Development

### Running the development server

```bash
npm run dev
```

### Building for production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Future Enhancements

- [ ] PDF generation for offline timeline access
- [ ] Case manager dashboard
- [ ] Mobile app (React Native)
- [ ] Additional language support
- [ ] Integration with reentry organizations
- [ ] Financial literacy quizzes and certifications

## Contributing

This project is designed to help individuals rebuild their financial lives. Contributions are welcome, especially:

- Additional timeline rules
- Knowledge base content
- Educational resources
- Bug fixes and improvements

## License

[Specify your license here]

## Support

For issues or questions, please contact [your contact information].

## Disclaimer

This platform provides financial education only, not licensed legal or financial advice. Users should consult qualified professionals for specific guidance on their financial situation.
