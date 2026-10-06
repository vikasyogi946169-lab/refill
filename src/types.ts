export type PersonaId = 
  | 'friendly_assistant' 
  | 'developer_architect' 
  | 'code_reviewer' 
  | 'productivity_planner';

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  placeholderText: string;
  quickSuggestions: string[];
}

export interface ExtractedCodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  persona: PersonaId;
  liked?: boolean;
  isStreaming?: boolean;
  codeBlocks?: ExtractedCodeBlock[];
}

export interface ChatSession {
  id: string;
  title: string;
  persona: PersonaId;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface SavedSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: number;
}

export interface ProductivityTask {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimateMin: number;
  completed: boolean;
}

export type ActiveTab = 'chat' | 'sandbox' | 'productivity' | 'prompts';
