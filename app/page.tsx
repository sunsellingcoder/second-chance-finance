import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
              Your Fresh Start Begins Here
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              We provide financial education, resources, and support to help recently incarcerated individuals and those seeking to improve their financial literacy build a stronger future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/timeline" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors text-center">
                Get Started Today
              </a>
              <a href="/resources" className="border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-8 py-3 rounded-full font-medium transition-colors text-center">
                Learn More
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 px-6 bg-white dark:bg-zinc-900">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-12 text-center">
              Who We Help
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-zinc-50 dark:bg-zinc-800 p-8 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                  Recently Incarcerated
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Rebuilding your life after incarceration comes with unique financial challenges. We provide the tools and knowledge to help you navigate banking, credit, employment, and financial independence.
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-8 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                  Building Financial Literacy
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Financial education shouldn't be complicated. We break down budgeting, saving, credit building, and smart money management into simple, actionable steps anyone can follow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="resources" className="py-20 px-6 bg-zinc-50 dark:bg-zinc-800">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-12 text-center">
              Our Resources
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Budgeting Basics
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  Learn how to create and stick to a budget that works for your situation.
                </p>
                <a href="/chat" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Ask questions →
                </a>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Credit Building
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  Understand credit scores and how to build credit from scratch or rebuild it.
                </p>
                <a href="/timeline" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Start your timeline →
                </a>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Banking Guide
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  Navigate the banking system, open accounts, and manage your money safely.
                </p>
                <a href="/resources" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Explore banking options →
                </a>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Job Preparation
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  Resources for finding employment and understanding workplace financial benefits.
                </p>
                <a href="/chat" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Get advice →
                </a>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Savings Strategies
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  Practical ways to save money and build an emergency fund.
                </p>
                <a href="/chat" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Learn more →
                </a>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Housing Support
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  Information about housing options and financial assistance programs.
                </p>
                <a href="/resources" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Find resources →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 px-6 bg-white dark:bg-zinc-900">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Ready to Take Control of Your Financial Future?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              Join our community and get access to free resources, workshops, and support.
            </p>
            <a href="/timeline" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-medium transition-colors">
              Start Your Journey
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
