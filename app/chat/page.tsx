'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
}

const preBuiltExplainers = [
  {
    title: 'What is a secured credit card?',
    content: 'A secured credit card is a type of credit card that requires a cash deposit as collateral. This deposit usually becomes your credit limit. For example, if you deposit $200, you can spend up to $200. Secured cards are designed for people looking to build or rebuild credit. Unlike prepaid cards, secured cards report to credit bureaus, so responsible use can help improve your credit score over time.'
  },
  {
    title: 'Restitution vs. Credit Debt',
    content: 'Restitution is court-ordered money you must pay as part of a criminal sentence. It\'s not the same as credit card debt or loans. Restitution doesn\'t typically appear on your credit report or affect your credit score directly. However, if you don\'t pay, it can lead to other legal consequences. Credit debt comes from credit cards, loans, or other financial products. Both are important to address, but they work differently and require different approaches.'
  },
  {
    title: 'How to get your free credit report',
    content: 'You can get your free credit report once a week from each of the three major credit bureaus (Equifax, Experian, and TransUnion) by visiting AnnualCreditReport.com. This is the official website authorized by federal law - be careful of other sites that charge fees. You\'ll need to provide personal information to verify your identity. Review your report carefully for any errors or accounts you don\'t recognize.'
  },
  {
    title: 'How to dispute credit report errors',
    content: 'If you find errors on your credit report, you can dispute them for free. Contact the credit bureau that has the error in writing. Include your name, address, what you\'re disputing, and why. The bureau must investigate within 30 days. If they find the information is wrong, they must remove it. You can also file a dispute directly with the company that provided the incorrect information. Keep copies of everything you send.'
  },
  {
    title: 'Predatory products to avoid',
    content: 'Be careful of: Payday loans - these have extremely high interest rates (often 400%+). Rent-to-own stores - you end up paying 2-3x the item\'s actual cost. High-fee prepaid cards - some charge monthly fees, ATM fees, and per-transaction fees. "Credit repair" companies that promise quick fixes - legitimate credit repair takes time and can often be done yourself for free. Title loans - these use your car as collateral and have very high rates.'
  },
  {
    title: 'ID recovery basics',
    content: 'Getting your ID back after incarceration varies by state. Generally, you\'ll need: Proof of identity (birth certificate or passport), Proof of residency (utility bill, lease, or letter from a shelter), Social Security card, and sometimes a court order or release papers. Many states have reduced fees or expedited processes for formerly incarcerated individuals. Contact your local DMV or a reentry organization for state-specific help.'
  }
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Hi! I\'m here to help explain financial topics in simple terms. What would you like to know about? You can ask me anything, or choose from the topics below.'
    }
  ]);
  const [input, setInput] = useState('');

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword matching for demo purposes
    if (lowerMessage.includes('secured card') || lowerMessage.includes('secured credit card')) {
      return preBuiltExplainers[0].content;
    } else if (lowerMessage.includes('restitution') || lowerMessage.includes('court debt')) {
      return preBuiltExplainers[1].content;
    } else if (lowerMessage.includes('credit report') || lowerMessage.includes('free credit report')) {
      return preBuiltExplainers[2].content;
    } else if (lowerMessage.includes('dispute') || lowerMessage.includes('error')) {
      return preBuiltExplainers[3].content;
    } else if (lowerMessage.includes('predatory') || lowerMessage.includes('payday loan') || lowerMessage.includes('rent to own')) {
      return preBuiltExplainers[4].content;
    } else if (lowerMessage.includes('id') || lowerMessage.includes('identification') || lowerMessage.includes('license')) {
      return preBuiltExplainers[5].content;
    } else if (lowerMessage.includes('credit score') || lowerMessage.includes('build credit')) {
      return 'Building credit takes time but is definitely possible. Key steps include: 1) Pay all bills on time - this is the biggest factor in your score. 2) Keep credit card balances low (under 30% of your limit). 3) Don\'t open too many accounts at once. 4) Keep old accounts open to show a longer credit history. 5) Use a secured card or credit builder loan to establish positive payment history.';
    } else if (lowerMessage.includes('bank account') || lowerMessage.includes('checking account')) {
      return 'Second-chance bank accounts are designed for people who may have had trouble opening accounts before. These accounts have the same basic features as regular checking accounts but may have lower limits or small monthly fees. Look for banks that: Don\'t use ChexSystems or have alternatives, offer a path to upgrade to a regular account, have low or no monthly fees, and provide financial education resources.';
    } else {
      return 'That\'s a great question! I\'m designed to help with topics like credit building, banking, ID recovery, and avoiding predatory products. Could you rephrase your question or try asking about one of these topics? Remember, I provide educational information - for specific legal or financial advice, please consult a professional.';
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
    };

    const assistantMessage: Message = {
      id: messages.length + 2,
      type: 'assistant',
      content: generateResponse(input),
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    handleSend();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              Financial Q&A Assistant
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Ask questions about credit, banking, and financial rebuilding
            </p>
          </div>

          <div className="p-6">
            {!messages.some(m => m.type === 'user') && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Common Questions
                </h2>
                <div className="grid gap-3">
                  {preBuiltExplainers.map((explainer, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(explainer.title)}
                      className="text-left p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <p className="text-zinc-900 dark:text-zinc-50 font-medium">
                        {explainer.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question here..."
                className="flex-1 px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:border-blue-600 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Send
              </button>
            </div>

            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Disclaimer:</strong> This assistant provides educational information only, not financial or legal advice. For specific guidance, please consult a qualified professional.
              </p>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}