import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Search, 
  Bookmark, 
  Sparkles, 
  Code2, 
  ShieldAlert, 
  CheckSquare,
  ChevronDown
} from 'lucide-react';
import { ChatSession, PersonaId } from '../types';
import { PERSONAS } from '../utils/personas';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: (persona?: PersonaId) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  activePersona: PersonaId;
  onChangePersona: (persona: PersonaId) => void;
  savedSnippetsCount: number;
  onOpenSnippets: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  activePersona,
  onChangePersona,
  savedSnippetsCount,
  onOpenSnippets,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  const todaySessions = filteredSessions.filter(s => now - s.updatedAt < ONE_DAY);
  const yesterdaySessions = filteredSessions.filter(s => now - s.updatedAt >= ONE_DAY && now - s.updatedAt < 2 * ONE_DAY);
  const olderSessions = filteredSessions.filter(s => now - s.updatedAt >= 2 * ONE_DAY);

  const startEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'friendly_assistant':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'developer_architect':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'code_reviewer':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'productivity_planner':
        return <CheckSquare className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-72 bg-slate-900/95 border-r border-slate-800/80
        flex flex-col h-full transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-indigo-500/30 shadow-sm shrink-0 bg-slate-800 flex items-center justify-center">
              <img 
                src="/src/assets/images/devpulse_avatar_1791214590456.jpg" 
                alt="Refill Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-bold text-slate-100 tracking-tight text-base block">Refill</span>
              <span className="text-[11px] text-slate-400 block font-medium">Assistant & Dev Studio</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Persona Mode Switcher Dropdown */}
        <div className="px-3 pb-2">
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded bg-slate-900 shrink-0">
                  {getPersonaIcon(activePersona)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {PERSONAS[activePersona].name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {PERSONAS[activePersona].tagline}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Persona menu popover */}
            {showPersonaMenu && (
              <div className="absolute top-full mt-1.5 inset-x-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-30 py-1 overflow-hidden">
                {(Object.keys(PERSONAS) as PersonaId[]).map((pId) => {
                  const p = PERSONAS[pId];
                  const isSelected = activePersona === pId;
                  return (
                    <button
                      key={pId}
                      onClick={() => {
                        onChangePersona(pId);
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                        isSelected 
                          ? 'bg-indigo-600/15 text-indigo-300 font-medium' 
                          : 'text-slate-300 hover:bg-slate-750 hover:text-white'
                      }`}
                    >
                      <div className="p-1 rounded bg-slate-900/80 shrink-0">
                        {getPersonaIcon(pId)}
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.tagline}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-950/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 px-4">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Start by typing your question or project prompt!</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            <>
              {todaySessions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Today
                  </div>
                  <div className="space-y-0.5">
                    {todaySessions.map(renderSessionItem)}
                  </div>
                </div>
              )}

              {yesterdaySessions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Yesterday
                  </div>
                  <div className="space-y-0.5">
                    {yesterdaySessions.map(renderSessionItem)}
                  </div>
                </div>
              )}

              {olderSessions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Previous
                  </div>
                  <div className="space-y-0.5">
                    {olderSessions.map(renderSessionItem)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts & Snippets count */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <button
            onClick={onOpenSnippets}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saved Snippets</span>
            </div>
            <span className="font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
              {savedSnippetsCount}
            </span>
          </button>

          <div className="text-[11px] text-slate-500 text-center flex items-center justify-between px-1">
            <span>Powered by Gemini 3.8</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );

  function renderSessionItem(session: ChatSession) {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          if (window.innerWidth < 1024) onClose();
        }}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
          isActive 
            ? 'bg-slate-800 text-slate-100 font-medium' 
            : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEditing(session.id, e as any);
                if (e.key === 'Escape') cancelEditing(e as any);
              }}
              autoFocus
              className="bg-slate-900 border border-indigo-500 text-xs text-white px-1.5 py-0.5 rounded w-full outline-none"
            />
          ) : (
            <span className="truncate text-xs">{session.title}</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {isEditing ? (
            <>
              <button
                onClick={(e) => saveEditing(session.id, e)}
                className="p-1 hover:text-emerald-400"
                title="Save"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={cancelEditing}
                className="p-1 hover:text-rose-400"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className={`flex items-center gap-0.5 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
              <button
                onClick={(e) => startEditing(session, e)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
                title="Rename"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-400 rounded"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
};
