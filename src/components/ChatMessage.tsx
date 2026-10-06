import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  RotateCcw, 
  Play, 
  Download, 
  Bookmark, 
  FileCode,
  User,
  Sparkles
} from 'lucide-react';
import { Message, SavedSnippet } from '../types';
import { renderMarkdown, extractCodeBlocks } from '../utils/markdown';
import { speakText, stopSpeaking } from '../utils/speech';
import { PERSONAS } from '../utils/personas';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  onRunInSandbox: (code: string, language: string) => void;
  onSaveSnippet: (snippet: Omit<SavedSnippet, 'id' | 'createdAt'>) => void;
  onLike?: (id: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast,
  onRegenerate,
  onRunInSandbox,
  onSaveSnippet,
  onLike,
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [liked, setLiked] = useState<boolean | undefined>(message.liked);

  const isAssistant = message.role === 'assistant';
  const personaConfig = PERSONAS[message.persona || 'friendly_assistant'];

  // Copy full message text
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Speak message
  const handleToggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(message.text, () => {
        setSpeaking(false);
      });
    }
  };

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    if (onLike) onLike(message.id);
  };

  // Format timestamp (e.g. 10:45 AM)
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Extract code blocks from the message
  const codeBlocks = extractCodeBlocks(message.text);

  return (
    <div className={`py-5 px-4 sm:px-6 transition-colors ${isAssistant ? 'bg-slate-900/40 border-y border-slate-800/40' : ''}`}>
      <div className="max-w-4xl mx-auto flex gap-3.5 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-indigo-500/30 bg-slate-800 shadow-sm flex items-center justify-center">
              <img
                src="/src/assets/images/devpulse_avatar_1791214590456.jpg"
                alt="Refill Assistant"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-700/80 ring-1 ring-slate-600/50 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-200">
              {isAssistant ? 'Refill' : 'You'}
            </span>
            {isAssistant && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${personaConfig.badgeBg} font-medium`}>
                {personaConfig.name}
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-mono">
              {formattedTime}
            </span>
          </div>

          {/* User Text */}
          {!isAssistant ? (
            <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {message.text}
            </div>
          ) : (
            /* Assistant Markdown Rendering with Code Blocks */
            <div>
              <div 
                className="prose-assistant text-sm text-slate-200 leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
              />

              {/* Streaming pulse cursor */}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse rounded-xs align-middle" />
              )}

              {/* Extracted Code Blocks Quick Bar if any exist */}
              {codeBlocks.length > 0 && !message.isStreaming && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      Detected Code Artifacts ({codeBlocks.length})
                    </span>
                  </div>

                  {codeBlocks.map((block, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden"
                    >
                      {/* Code Block Header */}
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-300 font-semibold uppercase text-[11px]">
                            {block.language || 'code'}
                          </span>
                          {block.filename && (
                            <span className="text-slate-500 font-mono text-[11px]">
                              {block.filename}
                            </span>
                          )}
                          <span className="text-slate-600 text-[11px] font-mono">
                            {block.code.split('\n').length} lines
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Run in Sandbox Button */}
                          {['html', 'javascript', 'js', 'jsx', 'tsx', 'css', 'react'].includes(block.language) && (
                            <button
                              onClick={() => onRunInSandbox(block.code, block.language)}
                              className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-medium transition-colors"
                              title="Run and live-preview in Interactive Sandbox"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Live Preview</span>
                            </button>
                          )}

                          {/* Save Snippet */}
                          <button
                            onClick={() => onSaveSnippet({
                              title: block.filename || `${block.language} snippet from Refill`,
                              language: block.language,
                              code: block.code,
                            })}
                            className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                            title="Save to your bookmarks"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>

                          {/* Download as file */}
                          <button
                            onClick={() => {
                              const ext = getExtension(block.language);
                              const blob = new Blob([block.code], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = block.filename || `refill-code.${ext}`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Code */}
                          <CopyCodeButton code={block.code} />
                        </div>
                      </div>

                      {/* Code preview snippet (first 10 lines) */}
                      <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed selection:bg-indigo-500/30">
                        <code>{block.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Footer Actions */}
              {!message.isStreaming && (
                <div className="flex items-center gap-2 mt-3 pt-2 text-xs text-slate-400">
                  <button
                    onClick={handleCopyMessage}
                    className="flex items-center gap-1 px-2 py-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Copy full response"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleToggleSpeak}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      speaking ? 'text-indigo-400 bg-indigo-500/10' : 'hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title={speaking ? 'Stop speech' : 'Read aloud with AI voice'}
                  >
                    {speaking ? <VolumeX className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{speaking ? 'Stop Voice' : 'Read Aloud'}</span>
                  </button>

                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      liked ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>

                  {isLast && onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="flex items-center gap-1 px-2 py-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors ml-auto"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-0.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-[11px] transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function getExtension(language: string): string {
  switch (language.toLowerCase()) {
    case 'typescript':
    case 'ts':
      return 'ts';
    case 'tsx':
      return 'tsx';
    case 'javascript':
    case 'js':
      return 'js';
    case 'jsx':
      return 'jsx';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'python':
    case 'py':
      return 'py';
    case 'json':
      return 'json';
    case 'sql':
      return 'sql';
    default:
      return 'txt';
  }
}
