import React, { useState } from 'react';
import { 
  Code2, 
  ShieldAlert, 
  CheckSquare, 
  Sparkles, 
  ArrowRight, 
  Search,
  Zap
} from 'lucide-react';
import { PersonaId } from '../types';

interface PromptLibraryProps {
  onUsePrompt: (promptText: string, persona: PersonaId) => void;
}

interface PromptItem {
  id: string;
  category: 'dev' | 'review' | 'productivity' | 'assistant';
  persona: PersonaId;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
}

const PROMPT_DATABASE: PromptItem[] = [
  // Developer
  {
    id: 'dev-1',
    category: 'dev',
    persona: 'developer_architect',
    title: 'Interactive Stopwatch & Lap Counter',
    description: 'Build a complete, standalone responsive web app in single-file HTML & Tailwind CSS.',
    prompt: 'Build a complete, modern, and stylish Stopwatch web app with start, pause, lap times, and reset buttons in single-file HTML, Tailwind CSS, and vanilla JavaScript so I can run it directly in the live sandbox.',
    tags: ['Frontend', 'JavaScript', 'Tailwind'],
  },
  {
    id: 'dev-2',
    category: 'dev',
    persona: 'developer_architect',
    title: 'Production React useDebounce Hook',
    description: 'TypeScript hook with generic types, cancel method, and test cases.',
    prompt: 'Write a battle-tested TypeScript React custom hook `useDebounce` that accepts any value or function and delay in milliseconds, includes a cancel/flush method, and includes sample Jest tests.',
    tags: ['React', 'TypeScript', 'Hooks'],
  },
  {
    id: 'dev-3',
    category: 'dev',
    persona: 'developer_architect',
    title: 'PostgreSQL Schema for SaaS Multi-Tenant',
    description: 'Organizations, users, roles, subscriptions, and row-level security (RLS).',
    prompt: 'Design a clean, normalized PostgreSQL database schema for a B2B SaaS application featuring multi-tenant organization workspaces, user memberships with RBAC roles, subscription plans, and indexes for high throughput.',
    tags: ['SQL', 'Database', 'Backend'],
  },
  {
    id: 'dev-4',
    category: 'dev',
    persona: 'developer_architect',
    title: 'Express JWT Auth Middleware',
    description: 'Token validation, token expiry, refresh token rotation, and error handling.',
    prompt: 'Write a secure Node.js / Express authentication middleware using JSON Web Tokens (JWT) with bearer token extraction, graceful expired token handling, and role verification.',
    tags: ['Node.js', 'Express', 'Security'],
  },

  // Review
  {
    id: 'rev-1',
    category: 'review',
    persona: 'code_reviewer',
    title: 'Memory Leak & useEffect Audit',
    description: 'Find uncleaned subscriptions, event listeners, and missing dependencies.',
    prompt: 'Review the following React component for missing useEffect cleanup functions, stale closures, unnecessary re-renders, and memory leaks with refactored before/after code:\n\n',
    tags: ['React', 'Performance', 'Memory'],
  },
  {
    id: 'rev-2',
    category: 'review',
    persona: 'code_reviewer',
    title: 'Algorithm Time Complexity O(n²) to O(n)',
    description: 'Transform slow nested loops using hash maps, sets, or two pointers.',
    prompt: 'Analyze this algorithm for time and space complexity bottlenecks. Refactor it to achieve optimal O(n) runtime complexity and explain the mathematical tradeoff:\n\n',
    tags: ['Algorithms', 'Big-O', 'Refactor'],
  },

  // Productivity
  {
    id: 'prod-1',
    category: 'productivity',
    persona: 'productivity_planner',
    title: 'Agile 3-Part Daily Standup',
    description: 'Turn scattered notes into a crisp Slack summary for engineering managers.',
    prompt: 'Turn my rough developer notes into a structured, executive-ready Agile Standup with Yesterday, Today, and Blockers sections.',
    tags: ['Standup', 'Agile', 'Team'],
  },
  {
    id: 'prod-2',
    category: 'productivity',
    persona: 'productivity_planner',
    title: 'Eisenhower Priority Matrix Planner',
    description: 'Categorize your overwhelming task list into Urgent vs Important quadrants.',
    prompt: 'Here is a brain dump of my 10 projects and tasks for this week. Help me organize them into the Eisenhower Matrix (Do, Schedule, Delegate, Eliminate) with estimated hours.',
    tags: ['Planning', 'Timebox', 'Organization'],
  },
  {
    id: 'prod-3',
    category: 'productivity',
    persona: 'productivity_planner',
    title: 'Polite Follow-Up Email to Client',
    description: 'Courteous reminder for overdue feedback without sounding pushy.',
    prompt: 'Draft a polite, professional, and warm follow-up email to a client who has not responded to our project submission for 5 days. Keep it concise with a clear call-to-action.',
    tags: ['Email', 'Communication', 'Client'],
  },

  // Assistant
  {
    id: 'ast-1',
    category: 'assistant',
    persona: 'friendly_assistant',
    title: 'Explain Complex Tech Simply',
    description: 'Learn any complex computing concept using intuitive, friendly analogies.',
    prompt: 'Explain how distributed caching and Redis work under the hood using an intuitive, real-world analogy that anyone can easily understand.',
    tags: ['Learning', 'Concepts', 'Friendly'],
  },
  {
    id: 'ast-2',
    category: 'assistant',
    persona: 'friendly_assistant',
    title: 'Balanced Decision Matrix',
    description: 'Evaluate pros, cons, long-term impact, and hidden risks for any choice.',
    prompt: 'Help me make a well-reasoned decision: evaluate the pros, cons, 1-year impact, and hidden tradeoffs between choosing a monolithic framework vs microservices for a new product.',
    tags: ['Decisions', 'Strategy', 'Advice'],
  },
];

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ onUsePrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredPrompts = PROMPT_DATABASE.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Curated Prompts & Developer Recipes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hand-tuned prompt blueprints for coding, architecture, productivity, and everyday personal assistance.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Prompts' },
              { id: 'dev', label: 'Engineering & Code' },
              { id: 'review', label: 'Audits & Bugs' },
              { id: 'productivity', label: 'Productivity' },
              { id: 'assistant', label: 'Personal & Learning' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompt templates..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.map((item) => (
            <div
              key={item.id}
              onClick={() => onUsePrompt(item.prompt, item.persona)}
              className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {item.category === 'dev' && <Code2 className="w-4 h-4 text-emerald-400" />}
                    {item.category === 'review' && <ShieldAlert className="w-4 h-4 text-amber-400" />}
                    {item.category === 'productivity' && <CheckSquare className="w-4 h-4 text-cyan-400" />}
                    {item.category === 'assistant' && <Sparkles className="w-4 h-4 text-indigo-400" />}
                    <h2 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {item.title}
                    </h2>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-indigo-400 font-medium group-hover:underline">
                  Use in Chat &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
