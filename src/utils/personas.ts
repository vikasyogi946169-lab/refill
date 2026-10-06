import { PersonaConfig, PersonaId } from '../types';

export const PERSONAS: Record<PersonaId, PersonaConfig> = {
  friendly_assistant: {
    id: 'friendly_assistant',
    name: 'Friendly Assistant',
    tagline: 'Warm, supportive, everyday help & productivity',
    description: 'A thoughtful personal companion for questions, brainstorms, planning, and everyday clarity.',
    iconName: 'Sparkles',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    placeholderText: 'Ask me anything! I am here to help you brainstorm, plan, or solve problems...',
    quickSuggestions: [
      'Help me plan my day with 3 key priority goals',
      'Explain how WebSockets work simply with real examples',
      'Give me 5 practical habits to avoid developer burnout',
      'Draft a warm, polite email asking for project feedback'
    ]
  },
  developer_architect: {
    id: 'developer_architect',
    name: 'Code Architect',
    tagline: 'Full-stack software engineering & web apps',
    description: 'Senior engineer specialized in building clean, scalable frontend/backend code, algorithms, and tests.',
    iconName: 'Code2',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    placeholderText: 'Describe an app, component, or algorithm you want me to write...',
    quickSuggestions: [
      'Build an interactive Stopwatch app with lap records in HTML & Tailwind',
      'Write a reusable TypeScript useDebounce hook with tests',
      'Create a modern animated pricing card component in React',
      'Write an optimized SQL schema and indexing strategy for a SaaS app'
    ]
  },
  code_reviewer: {
    id: 'code_reviewer',
    name: 'Code Reviewer',
    tagline: 'Security audits, performance & bug hunting',
    description: 'Systematic reviewer that detects race conditions, memory leaks, security flaws, and refactors cleanly.',
    iconName: 'ShieldAlert',
    accentColor: 'amber',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    placeholderText: 'Paste any code here to audit for bugs, edge cases, or performance...',
    quickSuggestions: [
      'Review my React useEffect dependencies and identify memory leaks',
      'Audit this API authentication middleware for security vulnerabilities',
      'Optimize this nested loop algorithm from O(n²) to O(n)',
      'Convert this messy callback code into clean async/await with error boundaries'
    ]
  },
  productivity_planner: {
    id: 'productivity_planner',
    name: 'Productivity Copilot',
    tagline: 'Standups, executive briefs & task timeboxing',
    description: 'Master of organization, Pomodoro planning, agile standups, and crisp workplace communication.',
    iconName: 'CheckSquare',
    accentColor: 'cyan',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    placeholderText: 'Tell me about your projects or chaotic to-do list to organize it...',
    quickSuggestions: [
      'Generate a crisp 3-part Agile Standup for today based on my notes',
      'Break down building user authentication into a 3-day step-by-step checklist',
      'Draft a polite follow-up email to a client who has not replied in 4 days',
      'Create a 90-minute deep-work timebox schedule for a software sprint'
    ]
  }
};
