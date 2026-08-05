-- Fix RLS policies for timeline and intake operations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own intake" ON public.intake_responses;
DROP POLICY IF EXISTS "Users view own timelines" ON public.user_timelines;
DROP POLICY IF EXISTS "Users manage own milestones" ON public.timeline_milestones;

-- Intake Responses: Users can insert, update, and select their own data
CREATE POLICY "Users can insert own intake" ON public.intake_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intake" ON public.intake_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own intake" ON public.intake_responses
  FOR SELECT USING (auth.uid() = user_id);

-- User Timelines: Users can insert, update, select, and delete their own timelines
CREATE POLICY "Users can insert own timeline" ON public.user_timelines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline" ON public.user_timelines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own timeline" ON public.user_timelines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline" ON public.user_timelines
  FOR DELETE USING (auth.uid() = user_id);

-- Timeline Milestones: Users can insert, update, select, and delete their own milestones
CREATE POLICY "Users can insert own milestones" ON public.timeline_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_timelines
      WHERE user_timelines.id = timeline_milestones.timeline_id
      AND user_timelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own milestones" ON public.timeline_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_timelines
      WHERE user_timelines.id = timeline_milestones.timeline_id
      AND user_timelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own milestones" ON public.timeline_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_timelines
      WHERE user_timelines.id = timeline_milestones.timeline_id
      AND user_timelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own milestones" ON public.timeline_milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_timelines
      WHERE user_timelines.id = timeline_milestones.timeline_id
      AND user_timelines.user_id = auth.uid()
    )
  );
