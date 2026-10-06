/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatMessage } from './components/ChatMessage';
import { Composer } from './components/Composer';
import { CodeSandbox } from './components/CodeSandbox';
import { ProductivitySuite } from './components/ProductivitySuite';
import { PromptLibrary } from './components/PromptLibrary';
import { SavedSnippetsModal } from './components/SavedSnippetsModal';
import { 
  ChatSession, 
  Message, 
  PersonaId, 
  ActiveTab, 
  SavedSnippet 
} from './types';
import { PERSONAS } from './utils/personas';
import { speakText, stopSpeaking } from './utils/speech';
import { Sparkles, Code2, ShieldAlert, CheckSquare } from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'refill_sessions_v1';
const STORAGE_KEY_SNIPPETS = 'refill_snippets_v1';
const STORAGE_KEY_SPEECH = 'refill_speech_enabled';

export default function App() {
  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }

    // Default initial session
    const initialId = String(Date.now());
    return [
      {
        id: initialId,
        title: 'Welcome to Refill',
        persona: 'friendly_assistant',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: 'welcome-msg',
            role: 'assistant',
            text: `👋 **Hello and welcome! I am Refill**, your personal assistant and developer companion!

I am here to help you accomplish your daily goals with a friendly, supportive touch, and build high-quality software like a senior engineer.

### 🌟 What we can do together:
1. **Friendly Personal Assistant**: Ask me anything, brainstorm ideas, get everyday explanations, and stay motivated.
2. **Software & Web Developer**: I can craft complete apps, clean React components, backend APIs, and SQL schemas. You can run web code directly in our built-in **Live Sandbox**!
3. **Code Reviewer & Bug Hunter**: Paste any code to find subtle memory leaks, performance bottlenecks, or security issues.
4. **Daily Productivity Copilot**: Generate Agile standups, draft polished emails, and break down complex tasks into manageable checklists.

Feel free to pick one of the suggestions below or just ask me anything!`,
            timestamp: Date.now(),
            persona: 'friendly_assistant',
          }
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || String(Date.now());
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_SPEECH) === 'true';
  });

  // Saved Snippets State
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SNIPPETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'sample-snip-1',
        title: 'Modern Stopwatch App in Single-File HTML',
        language: 'html',
        code: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-900 text-white flex items-center justify-center min-h-screen">
  <div class="p-6 bg-slate-800 rounded-xl text-center">
    <h1 class="text-2xl font-bold mb-4">Refill Quick Counter</h1>
    <div id="count" class="text-5xl font-mono mb-4 text-emerald-400">0</div>
    <button onclick="document.getElementById('count').innerText++" class="px-4 py-2 bg-emerald-600 rounded-lg">Increment</button>
  </div>
</body>
</html>`,
        createdAt: Date.now(),
      }
    ];
  });
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState(false);

  // Sandbox prefill state
  const [sandboxCode, setSandboxCode] = useState<string | undefined>();
  const [sandboxLang, setSandboxLang] = useState<string | undefined>();

  // Composer prefill text from Prompt Library
  const [composerInitialText, setComposerInitialText] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SNIPPETS, JSON.stringify(savedSnippets));
    } catch (e) {
      console.error(e);
    }
  }, [savedSnippets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SPEECH, String(isSpeechEnabled));
  }, [isSpeechEnabled]);

  // Current session object
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activePersona = currentSession?.persona || 'friendly_assistant';

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, isStreaming, activeTab]);

  // New Chat
  const handleNewSession = (persona: PersonaId = 'friendly_assistant') => {
    stopSpeaking();
    const newId = String(Date.now());
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      persona,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setActiveTab('chat');
  };

  // Delete Chat
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewSession();
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // Rename Chat
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };

  // Change Persona for Active Session
  const handleChangePersona = (persona: PersonaId) => {
    setSessions(
      sessions.map((s) => (s.id === activeSessionId ? { ...s, persona } : s))
    );
  };

  // Send message and stream response from server-side Gemini API
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Create User Message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
      persona: activePersona,
    };

    // Placeholder Assistant Message for Streaming
    const assistantMessageId = `assist-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      persona: activePersona,
      isStreaming: true,
    };

    // Auto-update title if it's the first message
    const updatedMessages = [...(currentSession?.messages || []), userMessage, assistantMessage];
    const isFirstUserMessage = (currentSession?.messages || []).filter((m) => m.role === 'user').length === 0;
    const newTitle = isFirstUserMessage 
      ? text.slice(0, 30) + (text.length > 30 ? '...' : '') 
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: s.title === 'New Conversation' ? newTitle : s.title,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    try {
      // Build messages history payload
      const historyPayload = (currentSession?.messages || [])
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: historyPayload,
          persona: activePersona,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable stream received.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                accumulatedText += `\n\n*Error: ${parsed.error}*`;
              } else if (parsed.text) {
                accumulatedText += parsed.text;
              }

              // Update assistant message text in state
              setSessions((prev) =>
                prev.map((s) =>
                  s.id === activeSessionId
                    ? {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, text: accumulatedText }
                            : m
                        ),
                      }
                    : s
                )
              );
            } catch (err) {
              console.warn('Could not parse SSE chunk:', err);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
        accumulatedText += `\n\n*(Could not connect to Gemini API. Please verify network or API keys.)*`;
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;

      // Finalize assistant message
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, text: accumulatedText || 'I am ready to help you!', isStreaming: false }
                    : m
                ),
              }
            : s
        )
      );

      // Read aloud if enabled
      if (isSpeechEnabled && accumulatedText) {
        speakText(accumulatedText);
      }
    }
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  // Clear messages in current session
  const handleClearChat = () => {
    stopSpeaking();
    setSessions(
      sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [] } : s
      )
    );
  };

  // Export current session as Markdown file
  const handleExportMarkdown = () => {
    if (!currentSession || currentSession.messages.length === 0) return;

    let md = `# ${currentSession.title}\n\n`;
    md += `*Exported from Refill on ${new Date().toLocaleString()}*\n\n---\n\n`;

    for (const msg of currentSession.messages) {
      const sender = msg.role === 'user' ? 'You' : `Refill (${PERSONAS[msg.persona]?.name || 'Assistant'})`;
      md += `### ${sender}\n\n${msg.text}\n\n---\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Run code block in Interactive Sandbox
  const handleRunInSandbox = (code: string, language: string) => {
    setSandboxCode(code);
    setSandboxLang(language);
    setActiveTab('sandbox');
  };

  // Save code snippet
  const handleSaveSnippet = (snippet: Omit<SavedSnippet, 'id' | 'createdAt'>) => {
    const newSnip: SavedSnippet = {
      ...snippet,
      id: String(Date.now()),
      createdAt: Date.now(),
    };
    setSavedSnippets([newSnip, ...savedSnippets]);
    setIsSnippetsModalOpen(true);
  };

  const handleDeleteSnippet = (id: string) => {
    setSavedSnippets(savedSnippets.filter((s) => s.id !== id));
  };

  // Handle prompt selected from Prompt Library
  const handleUsePrompt = (promptText: string, persona: PersonaId) => {
    handleChangePersona(persona);
    setComposerInitialText(promptText);
    setActiveTab('chat');
  };

  const personaConfig = PERSONAS[activePersona];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          stopSpeaking();
          setActiveSessionId(id);
          setActiveTab('chat');
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        activePersona={activePersona}
        onChangePersona={handleChangePersona}
        savedSnippetsCount={savedSnippets.length}
        onOpenSnippets={() => setIsSnippetsModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Bar Contract */}
        <TopBar
          title={currentSession?.title || 'Refill AI'}
          persona={activePersona}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            stopSpeaking();
            setActiveTab(tab);
          }}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isSpeechEnabled={isSpeechEnabled}
          onToggleSpeech={() => {
            const next = !isSpeechEnabled;
            setIsSpeechEnabled(next);
            if (!next) stopSpeaking();
          }}
          onClearChat={handleClearChat}
          onExportMarkdown={handleExportMarkdown}
          hasMessages={(currentSession?.messages || []).length > 0}
        />

        {/* View 1: Chat View */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto">
              {(currentSession?.messages || []).length === 0 ? (
                /* Empty Chat Welcome State */
                <div className="max-w-3xl mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-indigo-500/40 shadow-xl mb-4 bg-slate-800 flex items-center justify-center">
                    <img
                      src="/src/assets/images/devpulse_avatar_1791214590456.jpg"
                      alt="Refill Logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    How can I assist you today?
                  </h1>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                    {personaConfig.description}
                  </p>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full text-left">
                    {personaConfig.quickSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(suggestion)}
                        className="group p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition-all text-xs text-slate-300 hover:text-white flex items-start justify-between gap-3 shadow-xs"
                      >
                        <span className="leading-relaxed line-clamp-2">{suggestion}</span>
                        <span className="text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          &rarr;
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Quick Feature Markers */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Friendly Assistant
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      Full-Stack & Sandbox
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      Code Audits
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                      Daily Tasks & Standups
                    </span>
                  </div>
                </div>
              ) : (
                /* Render Chat Messages */
                <div className="divide-y divide-slate-850/50 pb-6">
                  {currentSession.messages.map((msg, index) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isLast={index === currentSession.messages.length - 1}
                      onRegenerate={() => {
                        const lastUserMsg = [...currentSession.messages]
                          .reverse()
                          .find((m) => m.role === 'user');
                        if (lastUserMsg) {
                          handleSendMessage(lastUserMsg.text);
                        }
                      }}
                      onRunInSandbox={handleRunInSandbox}
                      onSaveSnippet={handleSaveSnippet}
                    />
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>

            {/* Bottom Composer */}
            <Composer
              onSendMessage={handleSendMessage}
              onStopStreaming={handleStopStreaming}
              isStreaming={isStreaming}
              activePersona={activePersona}
              onChangePersona={handleChangePersona}
              initialText={composerInitialText}
            />
          </div>
        )}

        {/* View 2: Live Code Sandbox & Logic Runner */}
        {activeTab === 'sandbox' && (
          <CodeSandbox
            initialCode={sandboxCode}
            initialLanguage={sandboxLang}
          />
        )}

        {/* View 3: Daily Productivity Suite */}
        {activeTab === 'productivity' && (
          <ProductivitySuite />
        )}

        {/* View 4: Prompt Library */}
        {activeTab === 'prompts' && (
          <PromptLibrary onUsePrompt={handleUsePrompt} />
        )}
      </div>

      {/* Saved Code Snippets Modal */}
      <SavedSnippetsModal
        isOpen={isSnippetsModalOpen}
        onClose={() => setIsSnippetsModalOpen(false)}
        snippets={savedSnippets}
        onDeleteSnippet={handleDeleteSnippet}
        onRunInSandbox={handleRunInSandbox}
      />
    </div>
  );
}
