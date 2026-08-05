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

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, reading_level)
  VALUES (NEW.id, 'user', '8th_grade');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for RAG similarity search (takes embedding vector directly)
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
