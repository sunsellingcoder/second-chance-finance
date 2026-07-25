'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
  month: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function TimelinePage() {
  const [step, setStep] = useState<'intake' | 'timeline'>('intake');
  const [financialStatus, setFinancialStatus] = useState<FinancialStatus>({
    hasBankAccount: false,
    hasStateId: false,
    hasSSN: false,
    existingDebts: false,
    hasRestitution: false,
    employmentStatus: '',
    hasCreditScore: false,
  });
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);

  const generateTimeline = () => {
    const steps: TimelineStep[] = [];
    let currentMonth = 1;

    // Month 1: Basics
    if (!financialStatus.hasStateId) {
      steps.push({
        month: currentMonth,
        title: 'Get Your State ID',
        description: 'Visit your local DMV to obtain a state ID or driver\'s license. This is essential for opening bank accounts and applying for credit.',
        completed: false,
      });
      currentMonth++;
    }

    if (!financialStatus.hasSSN) {
      steps.push({
        month: currentMonth,
        title: 'Obtain Social Security Card',
        description: 'Apply for a replacement Social Security card if needed. You\'ll need this for most financial applications.',
        completed: false,
      });
      currentMonth++;
    }

    // Month 1-2: Banking
    if (!financialStatus.hasBankAccount) {
      steps.push({
        month: currentMonth,
        title: 'Open a Second-Chance Bank Account',
        description: 'Open a checking account with a bank that offers second-chance banking. These accounts are designed for people with limited banking history.',
        completed: false,
      });
      currentMonth++;
    }

    // Month 2-3: Credit Report
    steps.push({
      month: currentMonth,
      title: 'Get Your Free Credit Report',
      description: 'Request your free credit report from AnnualCreditReport.com. Review it for errors and understand your starting point.',
      completed: false,
    });
    currentMonth++;

    // Month 3-4: Address Debts
    if (financialStatus.existingDebts || financialStatus.hasRestitution) {
      steps.push({
        month: currentMonth,
        title: 'Address Existing Debts',
        description: financialStatus.hasRestitution 
          ? 'Work with your parole officer or a financial counselor to understand your restitution obligations and create a payment plan.'
          : 'Contact creditors to discuss payment options for existing debts. Many offer hardship programs.',
        completed: false,
      });
      currentMonth++;
    }

    // Month 4-6: Secured Card
    if (!financialStatus.hasCreditScore || financialStatus.hasCreditScore) {
      steps.push({
        month: currentMonth,
        title: 'Apply for a Secured Credit Card',
        description: 'A secured credit card requires a deposit but helps build credit. Look for cards with no annual fee and that report to all three credit bureaus.',
        completed: false,
      });
      currentMonth += 2;
    }

    // Month 6-9: Credit Builder Loan
    steps.push({
      month: currentMonth,
      title: 'Consider a Credit Builder Loan',
      description: 'Many credit unions and CDFIs offer credit builder loans. You make payments into a savings account, and once the loan is paid off, you get the money plus built credit.',
      completed: false,
    });
    currentMonth += 3;

    // Month 9-12: Monitor Progress
    steps.push({
      month: currentMonth,
      title: 'Monitor Your Credit Progress',
      description: 'Check your credit score regularly. Continue using your secured card responsibly and pay all bills on time.',
      completed: false,
    });

    setTimeline(steps);
    setStep('timeline');
  };

  const toggleStepComplete = (index: number) => {
    const newTimeline = [...timeline];
    newTimeline[index].completed = !newTimeline[index].completed;
    setTimeline(newTimeline);
  };

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
                  value={financialStatus.employmentStatus}
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-medium transition-colors"
              >
                Generate My Timeline
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
              onClick={() => setStep('intake')}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Start Over
            </button>
          </div>

          <div className="space-y-6">
            {timeline.map((step, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-6 transition-all ${
                  step.completed
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStepComplete(index)}
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      step.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-400'
                    }`}
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