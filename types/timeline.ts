export interface IntakeResponse {
  has_bank_account: boolean;
  has_state_id: boolean;
  has_ssn_card: boolean;
  has_restitution_debt: boolean;
  employment_status: string;
  raw_responses?: Record<string, any>;
}

export interface TimelineMilestone {
  id?: string;
  timeline_id: string;
  title: string;
  description: string;
  target_month: number;
  step_order: number;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface UserTimeline {
  id?: string;
  user_id: string;
  current_month_step: number;
  is_active: boolean;
  milestones?: TimelineMilestone[];
}

export interface TimelineRule {
  condition: (intake: IntakeResponse) => boolean;
  generateMilestone: (intake: IntakeResponse, currentMonth: number) => Omit<TimelineMilestone, 'timeline_id'>;
}
