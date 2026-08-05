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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Add loading message
    const loadingMessage: Message = {
      id: messages.length + 2,
      type: 'assistant',
      content: 'Thinking...',
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Read the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          aiResponse += chunk;
          
          // Update the loading message with the actual response
          setMessages(prev => 
            prev.map(msg => 
              msg.id === loadingMessage.id 
                ? { ...msg, content: aiResponse }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to pre-built responses if API fails
      const fallbackResponse = generateResponse(input);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, content: fallbackResponse }
            : msg
        )
      );
    }
  };

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword matching for demo purposes (fallback)
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

  const handleQuickQuestion = async (question: string) => {
    setInput(question);
    await handleSend();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Financial Q&A Assistant
                </h1>
                <p className="text-blue-100 text-base mt-2">
                  Ask questions about credit, banking, and financial rebuilding
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!messages.some(m => m.type === 'user') && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
                  Common Questions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {preBuiltExplainers.map((explainer, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(explainer.title)}
                      className="text-left p-6 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all hover:shadow-md"
                    >
                      <p className="text-zinc-900 dark:text-zinc-50 font-medium text-base">
                        {explainer.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-6 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    }`}
                  >
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question here..."
                className="flex-1 px-6 py-4 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:border-blue-600 focus:outline-none text-base"
              />
              <button
                onClick={handleSend}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-base flex items-center gap-2"
              >
                <span>Send</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
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