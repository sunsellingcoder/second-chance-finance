'use server';

import { createClient } from '@/lib/supabase/server';
import { generateTimeline, validateIntakeResponse } from '@/lib/engine/rules';
import { IntakeResponse } from '@/types/timeline';
import { z } from 'zod';

// Zod schema for intake validation
const IntakeSchema = z.object({
  has_bank_account: z.boolean(),
  has_state_id: z.boolean(),
  has_ssn_card: z.boolean(),
  has_restitution_debt: z.boolean(),
  employment_status: z.enum(['employed', 'part-time', 'seeking', 'not-seeking']),
  existing_debts: z.boolean().optional(),
});

/**
 * Submit intake response and generate timeline
 */
export async function submitIntakeResponse(formData: FormData) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized: Please log in to submit intake responses');
  }

  // Extract and validate form data
  const rawData = {
    has_bank_account: formData.get('has_bank_account') === 'true',
    has_state_id: formData.get('has_state_id') === 'true',
    has_ssn_card: formData.get('has_ssn_card') === 'true',
    has_restitution_debt: formData.get('has_restitution_debt') === 'true',
    employment_status: formData.get('employment_status') as string,
    existing_debts: formData.get('existing_debts') === 'true',
  };

  // Validate with Zod
  const validatedData = IntakeSchema.parse(rawData);
  
  // Convert to IntakeResponse format
  const intakeResponse: IntakeResponse = {
    has_bank_account: validatedData.has_bank_account,
    has_state_id: validatedData.has_state_id,
    has_ssn_card: validatedData.has_ssn_card,
    has_restitution_debt: validatedData.has_restitution_debt,
    employment_status: validatedData.employment_status,
    raw_responses: rawData,
  };

  // Additional validation
  validateIntakeResponse(intakeResponse);

  // Check if user already has an intake response
  const { data: existingIntake } = await supabase
    .from('intake_responses')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let intakeId: string;

  if (existingIntake) {
    // Update existing intake response
    const { data: updatedIntake, error: updateError } = await supabase
      .from('intake_responses')
      .update({
        has_bank_account: intakeResponse.has_bank_account,
        has_state_id: intakeResponse.has_state_id,
        has_ssn_card: intakeResponse.has_ssn_card,
        has_restitution_debt: intakeResponse.has_restitution_debt,
        employment_status: intakeResponse.employment_status,
        raw_responses: intakeResponse.raw_responses,
      })
      .eq('user_id', user.id)
      .select('id')
      .single();

    if (updateError) throw updateError;
    intakeId = updatedIntake.id;
  } else {
    // Create new intake response
    const { data: newIntake, error: insertError } = await supabase
      .from('intake_responses')
      .insert({
        user_id: user.id,
        has_bank_account: intakeResponse.has_bank_account,
        has_state_id: intakeResponse.has_state_id,
        has_ssn_card: intakeResponse.has_ssn_card,
        has_restitution_debt: intakeResponse.has_restitution_debt,
        employment_status: intakeResponse.employment_status,
        raw_responses: intakeResponse.raw_responses,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;
    intakeId = newIntake.id;
  }

  // Generate timeline milestones
  const milestones = generateTimeline(intakeResponse);

  // Create or update user timeline
  const { data: existingTimeline } = await supabase
    .from('user_timelines')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  let timelineId: string;

  if (existingTimeline) {
    // Deactivate old timeline and create new one
    await supabase
      .from('user_timelines')
      .update({ is_active: false })
      .eq('id', existingTimeline.id);

    // Create new timeline
    const { data: newTimeline, error: timelineError } = await supabase
      .from('user_timelines')
      .insert({
        user_id: user.id,
        current_month_step: 1,
        is_active: true,
      })
      .select('id')
      .single();

    if (timelineError) throw timelineError;
    timelineId = newTimeline.id;
  } else {
    // Create new timeline
    const { data: newTimeline, error: timelineError } = await supabase
      .from('user_timelines')
      .insert({
        user_id: user.id,
        current_month_step: 1,
        is_active: true,
      })
      .select('id')
      .single();

    if (timelineError) throw timelineError;
    timelineId = newTimeline.id;
  }

  // Insert milestones
  const milestonesToInsert = milestones.map((milestone, index) => ({
    timeline_id: timelineId,
    title: milestone.title,
    description: milestone.description,
    target_month: milestone.target_month,
    step_order: milestone.step_order,
    is_completed: false,
  }));

  const { error: milestonesError } = await supabase
    .from('timeline_milestones')
    .insert(milestonesToInsert);

  if (milestonesError) throw milestonesError;

  return {
    success: true,
    timelineId,
    milestoneCount: milestones.length,
  };
}

/**
 * Get user's current intake response
 */
export async function getUserIntake() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('intake_responses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }

  return data;
}
