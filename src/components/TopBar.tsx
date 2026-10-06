import React from 'react';
import { 
  Menu, 
  Volume2, 
  VolumeX, 
  Download, 
  Trash2, 
  MessageSquare, 
  Code, 
  CheckSquare, 
  BookOpen
} from 'lucide-react';
import { ActiveTab, PersonaId } from '../types';
import { PERSONAS } from '../utils/personas';

interface TopBarProps {
  title: string;
  persona: PersonaId;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSidebar: () => void;
  isSpeechEnabled: boolean;
  onToggleSpeech: () => void;
  onClearChat: () => void;
  onExportMarkdown: () => void;
  hasMessages: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  persona,
  activeTab,
  onSelectTab,
  onOpenSidebar,
  isSpeechEnabled,
  onToggleSpeech,
  onClearChat,
  onExportMarkdown,
  hasMessages,
}) => {
  const personaConfig = PERSONAS[persona];

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
      {/* Zone 1: Contextual Title & Persona Marker */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-slate-100 truncate">
            {title || 'Refill AI'}
          </span>
          <span className={`hidden sm:inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border ${personaConfig.badgeBg} font-medium shrink-0`}>
            {personaConfig.name}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Tabs */}
      <nav className="flex items-center gap-1 p-1 bg-slate-950/60 border border-slate-800/80 rounded-lg">
        <button
          onClick={() => onSelectTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => onSelectTab('sandbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'sandbox'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Code</span> Sandbox
        </button>

        <button
          onClick={() => onSelectTab('productivity')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'productivity'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Daily</span> Tasks
        </button>

        <button
          onClick={() => onSelectTab('prompts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'prompts'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Prompts</span>
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Voice Toggle */}
        <button
          onClick={onToggleSpeech}
          className={`p-2 rounded-lg text-xs transition-colors ${
            isSpeechEnabled
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={isSpeechEnabled ? 'Voice readout enabled (click to mute)' : 'Enable assistant voice readout'}
          aria-label={isSpeechEnabled ? 'Mute voice' : 'Enable voice readout'}
        >
          {isSpeechEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Export Markdown */}
        {hasMessages && (
          <button
            onClick={onExportMarkdown}
            className="hidden sm:flex items-center gap-1.5 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs transition-colors"
            title="Export conversation as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Clear Messages */}
        {hasMessages && (
          <button
            onClick={onClearChat}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs transition-colors"
            title="Clear chat messages"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
