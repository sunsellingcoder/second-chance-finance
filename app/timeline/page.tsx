'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getUserTimeline, completeMilestone, uncompleteMilestone, resetTimeline } from '@/actions/timeline';
import { submitIntakeResponse, getUserIntake } from '@/actions/intake';

interface FinancialStatus {
  hasBankAccount: boolean;
  hasStateId: boolean;
  hasSSN: boolean;
  existingDebts: boolean;
  hasRestitution: boolean;
  employmentStatus: string;
  hasCreditScore: boolean;
}

interface TimelineStep {
  id?: string;
  month: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function TimelinePage() {
  const [step, setStep] = useState<'intake' | 'timeline' | 'loading'>('loading');
  const [financialStatus, setFinancialStatus] = useState<FinancialStatus>({
    hasBankAccount: false,
    hasStateId: false,
    hasSSN: false,
    existingDebts: false,
    hasRestitution: false,
    employmentStatus: 'seeking',
    hasCreditScore: false,
  });
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing timeline and intake data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Check for existing timeline
        const existingTimeline = await getUserTimeline();
        
        if (existingTimeline && existingTimeline.timeline_milestones) {
          // Load existing timeline
          const timelineSteps: TimelineStep[] = existingTimeline.timeline_milestones
            .sort((a: any, b: any) => a.step_order - b.step_order)
            .map((milestone: any) => ({
              id: milestone.id,
              month: milestone.target_month,
              title: milestone.title,
              description: milestone.description,
              completed: milestone.is_completed,
            }));
          
          setTimeline(timelineSteps);
          setStep('timeline');
        } else {
          // Check for existing intake data
          const existingIntake = await getUserIntake();
          if (existingIntake) {
            setFinancialStatus({
              hasBankAccount: existingIntake.has_bank_account,
              hasStateId: existingIntake.has_state_id,
              hasSSN: existingIntake.has_ssn_card,
              existingDebts: existingIntake.raw_responses?.existing_debts || false,
              hasRestitution: existingIntake.has_restitution_debt,
              employmentStatus: existingIntake.employment_status,
              hasCreditScore: false, // Not stored in current schema
            });
          }
          setStep('intake');
        }
      } catch (err) {
        console.error('Error loading timeline data:', err);
        setError('Failed to load your timeline. Please try again.');
        setStep('intake');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const generateTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData for the server action
      const formData = new FormData();
      formData.append('has_bank_account', financialStatus.hasBankAccount.toString());
      formData.append('has_state_id', financialStatus.hasStateId.toString());
      formData.append('has_ssn_card', financialStatus.hasSSN.toString());
      formData.append('has_restitution_debt', financialStatus.hasRestitution.toString());
      formData.append('employment_status', financialStatus.employmentStatus);
      formData.append('existing_debts', financialStatus.existingDebts.toString());
      
      const result = await submitIntakeResponse(formData);
      
      if (result.success) {
        // Load the newly created timeline
        const newTimeline = await getUserTimeline();
        if (newTimeline && newTimeline.timeline_milestones) {
          const timelineSteps: TimelineStep[] = newTimeline.timeline_milestones
            .sort((a: any, b: any) => a.step_order - b.step_order)
            .map((milestone: any) => ({
              id: milestone.id,
              month: milestone.target_month,
              title: milestone.title,
              description: milestone.description,
              completed: milestone.is_completed,
            }));
          
          setTimeline(timelineSteps);
          setStep('timeline');
        }
      }
    } catch (err) {
      console.error('Error generating timeline:', err);
      setError('Failed to generate timeline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStepComplete = async (index: number) => {
    const stepToToggle = timeline[index];
    if (!stepToToggle.id) return;
    
    try {
      setLoading(true);
      
      if (stepToToggle.completed) {
        await uncompleteMilestone(stepToToggle.id);
      } else {
        await completeMilestone(stepToToggle.id);
      }
      
      // Reload timeline to get updated state
      const updatedTimeline = await getUserTimeline();
      if (updatedTimeline && updatedTimeline.timeline_milestones) {
        const timelineSteps: TimelineStep[] = updatedTimeline.timeline_milestones
          .sort((a: any, b: any) => a.step_order - b.step_order)
          .map((milestone: any) => ({
            id: milestone.id,
            month: milestone.target_month,
            title: milestone.title,
            description: milestone.description,
            completed: milestone.is_completed,
          }));
        
        setTimeline(timelineSteps);
      }
    } catch (err) {
      console.error('Error toggling milestone:', err);
      setError('Failed to update milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetTimeline = async () => {
    try {
      setLoading(true);
      await resetTimeline();
      setStep('intake');
      setTimeline([]);
    } catch (err) {
      console.error('Error resetting timeline:', err);
      setError('Failed to reset timeline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mt-4">Loading your timeline...</p>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (step === 'intake') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Create Your Personalized Timeline
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              Answer a few questions about your current financial situation, and we'll create a customized plan to help you rebuild.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Do you currently have a bank account?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasBankAccount: true})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      financialStatus.hasBankAccount
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasBankAccount: false})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      !financialStatus.hasBankAccount
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Do you have a valid state ID or driver's license?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasStateId: true})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      financialStatus.hasStateId
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasStateId: false})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      !financialStatus.hasStateId
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Do you have your Social Security card?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasSSN: true})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      financialStatus.hasSSN
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasSSN: false})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      !financialStatus.hasSSN
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Do you have any existing debts (credit cards, loans, etc.)?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, existingDebts: true})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      financialStatus.existingDebts
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, existingDebts: false})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      !financialStatus.existingDebts
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Do you have court-ordered restitution or fines?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasRestitution: true})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      financialStatus.hasRestitution
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasRestitution: false})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      !financialStatus.hasRestitution
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  What is your current employment status?
                </label>
                <select
                  value={financialStatus.employmentStatus || 'seeking'}
                  onChange={(e) => setFinancialStatus({...financialStatus, employmentStatus: e.target.value})}
                  className="w-full py-3 px-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Select an option</option>
                  <option value="employed">Employed full-time</option>
                  <option value="part-time">Employed part-time</option>
                  <option value="seeking">Actively seeking work</option>
                  <option value="not-seeking">Not currently seeking work</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Do you know your current credit score?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasCreditScore: true})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      financialStatus.hasCreditScore
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFinancialStatus({...financialStatus, hasCreditScore: false})}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      !financialStatus.hasCreditScore
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <button
                onClick={generateTimeline}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Generating Timeline...' : 'Generate My Timeline'}
              </button>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Your Financial Rebuilding Timeline
            </h1>
            <button
              onClick={handleResetTimeline}
              disabled={loading}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              Start Over
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {timeline.map((step, index) => (
              <div
                key={step.id || index}
                className={`border-2 rounded-xl p-6 transition-all ${
                  step.completed
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStepComplete(index)}
                    disabled={loading}
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      step.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-400'
                    } disabled:opacity-50`}
                  >
                    {step.completed && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Month {step.month}
                      </span>
                      {step.completed && (
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Tips for Success
            </h3>
            <ul className="text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>• Complete each step at your own pace - there's no rush</li>
              <li>• Reach out to local reentry organizations for support</li>
              <li>• Keep records of all your financial documents</li>
              <li>• Celebrate each milestone you achieve!</li>
            </ul>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}