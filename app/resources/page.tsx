'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Resource {
  id: number;
  name: string;
  type: 'banking' | 'credit' | 'loan' | 'counseling';
  description: string;
  states: string[];
  requiresId: boolean;
  requiresAddress: boolean;
  fees: string;
  creditCheck: boolean;
  isRecommended: boolean;
  warning?: string;
}

const resources: Resource[] = [
  {
    id: 1,
    name: 'Bank On Certified Accounts',
    type: 'banking',
    description: 'Bank On certified accounts are designed to be safe, affordable, and transactional. They have no overdraft fees, low minimums, and no hidden costs.',
    states: ['All States'],
    requiresId: true,
    requiresAddress: true,
    fees: '$0-5/month',
    creditCheck: false,
    isRecommended: true,
  },
  {
    id: 2,
    name: 'Capital One Secured Credit Card',
    type: 'credit',
    description: 'No annual fee, no credit check for approval, and deposits as low as $200. Reports to all three credit bureaus.',
    states: ['All States'],
    requiresId: true,
    requiresAddress: true,
    fees: '$0 annual fee',
    creditCheck: false,
    isRecommended: true,
  },
  {
    id: 3,
    name: 'Discover it® Secured Credit Card',
    type: 'credit',
    description: 'No annual fee, 2% cash back at gas stations and restaurants, and 1% on other purchases. Deposit minimum $200.',
    states: ['All States'],
    requiresId: true,
    requiresAddress: true,
    fees: '$0 annual fee',
    creditCheck: false,
    isRecommended: true,
  },
  {
    id: 4,
    name: 'Self Credit Builder Account',
    type: 'loan',
    description: 'A credit builder loan where you make monthly payments and receive the money at the end. Reports to all three credit bureaus.',
    states: ['All States'],
    requiresId: true,
    requiresAddress: true,
    fees: 'Administrative fees vary',
    creditCheck: false,
    isRecommended: true,
  },
  {
    id: 5,
    name: 'Local CDFI Credit Builder Loans',
    type: 'loan',
    description: 'Community Development Financial Institutions offer credit builder loans with personalized support and financial education.',
    states: ['Varies'],
    requiresId: true,
    requiresAddress: true,
    fees: 'Varies by institution',
    creditCheck: true,
    isRecommended: true,
  },
  {
    id: 6,
    name: 'National Foundation for Credit Counseling',
    type: 'counseling',
    description: 'Nonprofit organization providing free and low-cost financial counseling, including credit counseling and housing support.',
    states: ['All States'],
    requiresId: false,
    requiresAddress: false,
    fees: 'Free to low-cost',
    creditCheck: false,
    isRecommended: true,
  },
  {
    id: 7,
    name: 'Chime Second Chance Banking',
    type: 'banking',
    description: 'Online banking with no monthly fees, no minimum balance, and early direct deposit. No ChexSystems check.',
    states: ['All States'],
    requiresId: true,
    requiresAddress: true,
    fees: '$0 monthly',
    creditCheck: false,
    isRecommended: true,
  },
  {
    id: 8,
    name: 'Green Dot Prepaid Card',
    type: 'banking',
    description: 'Prepaid card with direct deposit and mobile banking features. No credit check required.',
    states: ['All States'],
    requiresId: true,
    requiresAddress: false,
    fees: '$7.95/month',
    creditCheck: false,
    isRecommended: false,
    warning: 'High monthly fees compared to bank accounts. Consider second-chance checking accounts first.',
  },
  {
    id: 9,
    name: 'NetSpend Prepaid Card',
    type: 'banking',
    description: 'Prepaid debit card with check writing and bill pay features available.',
    states: ['All States'],
    requiresId: true,
    requiresAddress: false,
    fees: '$5-9.95/month',
    creditCheck: false,
    isRecommended: false,
    warning: 'High fees for basic services. Bank accounts are typically more cost-effective.',
  },
  {
    id: 10,
    name: 'ACE Cash Express',
    type: 'loan',
    description: 'Payday loans and check cashing services with short-term lending options.',
    states: ['Select States'],
    requiresId: true,
    requiresAddress: true,
    fees: 'Very high APR',
    creditCheck: false,
    isRecommended: false,
    warning: 'Predatory lender with extremely high interest rates (300%+ APR). Avoid if possible.',
  },
];

export default function ResourcesPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);

  const filteredResources = resources.filter((resource) => {
    if (filterType !== 'all' && resource.type !== filterType) return false;
    if (filterState !== 'all' && resource.states[0] !== 'All States' && !resource.states.includes(filterState)) return false;
    if (showRecommendedOnly && !resource.isRecommended) return false;
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banking': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'credit': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'loan': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'counseling': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'banking': return 'Banking';
      case 'credit': return 'Credit Card';
      case 'loan': return 'Loan';
      case 'counseling': return 'Counseling';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Second-Chance Financial Resources
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Vetted banking, credit, and support resources for rebuilding your financial future
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Resource Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:border-blue-600 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="banking">Banking</option>
                <option value="credit">Credit Cards</option>
                <option value="loan">Loans</option>
                <option value="counseling">Counseling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                State
              </label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:border-blue-600 focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="NY">New York</option>
                <option value="FL">Florida</option>
                <option value="IL">Illinois</option>
                <option value="PA">Pennsylvania</option>
                <option value="OH">Ohio</option>
                <option value="GA">Georgia</option>
                <option value="NC">North Carolina</option>
                <option value="MI">Michigan</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommended"
                checked={showRecommendedOnly}
                onChange={(e) => setShowRecommendedOnly(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="recommended" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Show recommended only
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterState('all');
                  setShowRecommendedOnly(false);
                }}
                className="w-full px-4 py-2 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className={`bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border-2 transition-all ${
                resource.isRecommended
                  ? 'border-emerald-500 dark:border-emerald-500'
                  : 'border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getTypeColor(resource.type)}`}>
                    {getTypeLabel(resource.type)}
                  </span>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {resource.name}
                  </h3>
                </div>
                {resource.isRecommended && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-medium rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Recommended
                    </span>
                  </div>
                )}
              </div>

              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {resource.description}
              </p>

              {resource.warning && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>⚠️ Warning:</strong> {resource.warning}
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">States:</span>
                  <span className="text-zinc-900 dark:text-zinc-50 font-medium">{resource.states.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">ID Required:</span>
                  <span className="text-zinc-900 dark:text-zinc-50 font-medium">{resource.requiresId ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Address Required:</span>
                  <span className="text-zinc-900 dark:text-zinc-50 font-medium">{resource.requiresAddress ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Fees:</span>
                  <span className="text-zinc-900 dark:text-zinc-50 font-medium">{resource.fees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Credit Check:</span>
                  <span className="text-zinc-900 dark:text-zinc-50 font-medium">{resource.creditCheck ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              No resources match your current filters. Try adjusting your criteria.
            </p>
          </div>
        )}

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            About These Resources
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
            We curate this directory to help you find safe, affordable financial products. Recommended resources have been vetted for fair practices and reasonable fees. Resources marked with warnings may have high costs or predatory terms.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            <strong>Disclaimer:</strong> This is for informational purposes only. We do not receive compensation for these listings. Always review terms and conditions carefully before opening any financial account.
          </p>
        </div>
      </div>
      <Footer />
      </div>
    </div>
  );
}