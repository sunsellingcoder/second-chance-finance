import { IntakeResponse, TimelineMilestone, TimelineRule } from '@/types/timeline';

/**
 * Deterministic Timeline Rules Engine
 * 
 * This engine uses strict, deterministic rules to generate financial rebuilding timelines.
 * No AI is involved in the timeline generation itself - AI is only used for narration.
 */

const timelineRules: TimelineRule[] = [
  {
    // Rule 1: State ID acquisition (needed for most financial activities)
    condition: (intake) => !intake.has_state_id,
    generateMilestone: (intake, currentMonth) => ({
      title: 'Get Your State ID',
      description: 'Visit your local DMV to obtain a state ID or driver\'s license. This is essential for opening bank accounts and applying for credit. Many states offer reduced fees or expedited processes for formerly incarcerated individuals.',
      target_month: currentMonth,
      step_order: 1,
      is_completed: false,
    }),
  },
  {
    // Rule 2: Social Security Card (required for banking and employment)
    condition: (intake) => !intake.has_ssn_card,
    generateMilestone: (intake, currentMonth) => ({
      title: 'Obtain Social Security Card',
      description: 'Apply for a replacement Social Security card if needed. You\'ll need this for most financial applications and employment. Contact your local Social Security Administration office or apply online if eligible.',
      target_month: currentMonth + (intake.has_state_id ? 0 : 1),
      step_order: 2,
      is_completed: false,
    }),
  },
  {
    // Rule 3: Second-chance bank account (foundation for financial activities)
    condition: (intake) => !intake.has_bank_account,
    generateMilestone: (intake, currentMonth) => ({
      title: 'Open a Second-Chance Bank Account',
      description: 'Open a checking account with a bank that offers second-chance banking. These accounts are designed for people with limited banking history. Look for Bank On certified accounts with no overdraft fees and low minimums.',
      target_month: currentMonth + (intake.has_state_id && intake.has_ssn_card ? 0 : 2),
      step_order: 3,
      is_completed: false,
    }),
  },
  {
    // Rule 4: Credit report review (always needed as baseline)
    condition: () => true, // Always include this step
    generateMilestone: (intake, currentMonth) => ({
      title: 'Get Your Free Credit Report',
      description: 'Request your free credit report from AnnualCreditReport.com. Review it for errors and understand your starting point. You can get free reports weekly from all three major bureaus (Equifax, Experian, TransUnion).',
      target_month: currentMonth + (intake.has_bank_account ? 0 : 1),
      step_order: 4,
      is_completed: false,
    }),
  },
  {
    // Rule 5: Address existing debts (restitution or other debts)
    condition: (intake) => intake.has_restitution_debt || intake.raw_responses?.existing_debts,
    generateMilestone: (intake, currentMonth) => ({
      title: 'Address Existing Debts',
      description: intake.has_restitution_debt
        ? 'Work with your parole officer or a financial counselor to understand your restitution obligations and create a manageable payment plan. Restitution is court-ordered and has legal consequences if not paid.'
        : 'Contact creditors to discuss payment options for existing debts. Many offer hardship programs or payment plans for those facing financial difficulties.',
      target_month: currentMonth + 2,
      step_order: 5,
      is_completed: false,
    }),
  },
  {
    // Rule 6: Secured credit card (for building credit history)
    condition: (intake) => intake.has_bank_account && intake.has_state_id && intake.has_ssn_card,
    generateMilestone: (intake, currentMonth) => ({
      title: 'Apply for a Secured Credit Card',
      description: 'A secured credit card requires a deposit (usually $200-500) that becomes your credit limit. Look for cards with no annual fee, low deposit requirements, and that report to all three credit bureaus. Responsible use builds credit history.',
      target_month: currentMonth + 3,
      step_order: 6,
      is_completed: false,
    }),
  },
  {
    // Rule 7: Credit builder loan (alternative or complement to secured card)
    condition: (intake) => intake.has_bank_account && intake.employment_status !== 'not-seeking',
    generateMilestone: (intake, currentMonth) => ({
      title: 'Consider a Credit Builder Loan',
      description: 'Many credit unions and CDFIs offer credit builder loans. You make payments into a savings account, and once the loan is paid off, you get the money plus built credit. This is a great way to build credit while saving money.',
      target_month: currentMonth + 5,
      step_order: 7,
      is_completed: false,
    }),
  },
  {
    // Rule 8: Credit monitoring and progress tracking
    condition: () => true, // Always include for ongoing progress
    generateMilestone: (intake, currentMonth) => ({
      title: 'Monitor Your Credit Progress',
      description: 'Check your credit score regularly using free services. Continue using your secured card responsibly (keep balances under 30% of limit), pay all bills on time, and monitor your credit report for errors or suspicious activity.',
      target_month: currentMonth + 8,
      step_order: 8,
      is_completed: false,
    }),
  },
  {
    // Rule 9: Explore traditional financial products (for those with established history)
    condition: (intake) => intake.has_bank_account && intake.employment_status === 'employed',
    generateMilestone: (intake, currentMonth) => ({
      title: 'Explore Traditional Financial Products',
      description: 'After 6-12 months of responsible credit use, you may qualify for unsecured credit cards, personal loans, or other traditional financial products. Compare options carefully and avoid predatory lenders with high fees.',
      target_month: currentMonth + 12,
      step_order: 9,
      is_completed: false,
    }),
  },
];

/**
 * Generate timeline milestones based on intake responses
 * This is a deterministic process - same inputs always produce same outputs
 */
export function generateTimeline(intake: IntakeResponse): Omit<TimelineMilestone, 'timeline_id'>[] {
  const milestones: Omit<TimelineMilestone, 'timeline_id'>[] = [];
  let currentMonth = 1;
  let stepOrder = 1;

  for (const rule of timelineRules) {
    if (rule.condition(intake)) {
      const milestone = rule.generateMilestone(intake, currentMonth);
      milestone.step_order = stepOrder++;
      milestones.push(milestone);
      
      // Update current month based on this milestone's target
      currentMonth = Math.max(currentMonth, milestone.target_month + 1);
    }
  }

  return milestones;
}

/**
 * Calculate estimated timeline completion in months
 */
export function calculateTimelineDuration(intake: IntakeResponse): number {
  const milestones = generateTimeline(intake);
  if (milestones.length === 0) return 0;
  
  const maxMonth = Math.max(...milestones.map(m => m.target_month));
  return maxMonth;
}

/**
 * Get next immediate action item based on current progress
 */
export function getNextMilestone(
  intake: IntakeResponse,
  completedMonths: number[] = []
): Omit<TimelineMilestone, 'timeline_id'> | null {
  const milestones = generateTimeline(intake);
  
  // Find first uncompleted milestone
  for (const milestone of milestones) {
    if (!completedMonths.includes(milestone.target_month)) {
      return milestone;
    }
  }
  
  return null;
}

/**
 * Validate intake response data
 */
export function validateIntakeResponse(data: any): IntakeResponse {
  const requiredFields = [
    'has_bank_account',
    'has_state_id', 
    'has_ssn_card',
    'has_restitution_debt',
    'employment_status'
  ];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate employment status
  const validEmploymentStatuses = ['employed', 'part-time', 'seeking', 'not-seeking'];
  if (!validEmploymentStatuses.includes(data.employment_status)) {
    throw new Error(`Invalid employment status: ${data.employment_status}`);
  }
  
  // Validate boolean fields
  const booleanFields = ['has_bank_account', 'has_state_id', 'has_ssn_card', 'has_restitution_debt'];
  for (const field of booleanFields) {
    if (typeof data[field] !== 'boolean') {
      throw new Error(`Field ${field} must be a boolean`);
    }
  }
  
  return data as IntakeResponse;
}
