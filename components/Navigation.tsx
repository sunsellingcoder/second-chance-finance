import Link from 'next/link';

export default function Navigation() {
  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Second Chance Finance
        </Link>
        <nav className="flex gap-6">
          <Link href="/timeline" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Timeline
          </Link>
          <Link href="/chat" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Ask Questions
          </Link>
          <Link href="/resources" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Resources
          </Link>
          <a href="/#about" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            About
          </a>
        </nav>
      </div>
    </header>
  );
}