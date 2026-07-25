'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Get user's active timeline with milestones
 */
export async function getUserTimeline() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: timeline, error: timelineError } = await supabase
    .from('user_timelines')
    .select(`
      *,
      timeline_milestones (*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (timelineError) {
    if (timelineError.code === 'PGRST116') { // No active timeline
      return null;
    }
    throw timelineError;
  }

  return timeline;
}

/**
 * Mark a milestone as completed
 */
export async function completeMilestone(milestoneId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify user owns this milestone
  const { data: milestone, error: milestoneError } = await supabase
    .from('timeline_milestones')
    .select(`
      *,
      user_timelines!inner (
        user_id
      )
    `)
    .eq('id', milestoneId)
    .single();

  if (milestoneError || !milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.user_timelines.user_id !== user.id) {
    throw new Error('Unauthorized: You do not own this milestone');
  }

  // Update milestone as completed
  const { error: updateError } = await supabase
    .from('timeline_milestones')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', milestoneId);

  if (updateError) throw updateError;

  // Update timeline progress
  const { data: timeline } = await supabase
    .from('user_timelines')
    .select('current_month_step')
    .eq('id', milestone.timeline_id)
    .single();

  if (timeline && milestone.target_month >= timeline.current_month_step) {
    await supabase
      .from('user_timelines')
      .update({
        current_month_step: milestone.target_month + 1,
      })
      .eq('id', milestone.timeline_id);
  }

  revalidatePath('/timeline');
  
  return { success: true };
}

/**
 * Unmark a milestone as completed
 */
export async function uncompleteMilestone(milestoneId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify user owns this milestone
  const { data: milestone, error: milestoneError } = await supabase
    .from('timeline_milestones')
    .select(`
      *,
      user_timelines!inner (
        user_id
      )
    `)
    .eq('id', milestoneId)
    .single();

  if (milestoneError || !milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.user_timelines.user_id !== user.id) {
    throw new Error('Unauthorized: You do not own this milestone');
  }

  // Update milestone as not completed
  const { error: updateError } = await supabase
    .from('timeline_milestones')
    .update({
      is_completed: false,
      completed_at: null,
    })
    .eq('id', milestoneId);

  if (updateError) throw updateError;

  revalidatePath('/timeline');
  
  return { success: true };
}

/**
 * Get timeline progress statistics
 */
export async function getTimelineProgress() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: timeline, error: timelineError } = await supabase
    .from('user_timelines')
    .select(`
      current_month_step,
      timeline_milestones (
        id,
        is_completed,
        target_month
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (timelineError || !timeline) {
    return null;
  }

  const totalMilestones = timeline.timeline_milestones.length;
  const completedMilestones = timeline.timeline_milestones.filter(
    (m: any) => m.is_completed
  ).length;
  const progressPercentage = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  return {
    totalMilestones,
    completedMilestones,
    progressPercentage,
    currentMonthStep: timeline.current_month_step,
  };
}

/**
 * Reset timeline (create new one based on current intake)
 */
export async function resetTimeline() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Deactivate current timeline
  const { error: deactivateError } = await supabase
    .from('user_timelines')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (deactivateError && deactivateError.code !== 'PGRST116') {
    throw deactivateError;
  }

  revalidatePath('/timeline');
  
  return { success: true };
}
