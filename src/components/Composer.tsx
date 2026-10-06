import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Mic, 
  MicOff, 
  Code, 
  CheckSquare, 
  Sparkles, 
  ShieldAlert
} from 'lucide-react';
import { PersonaId } from '../types';
import { PERSONAS } from '../utils/personas';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speech';

interface ComposerProps {
  onSendMessage: (text: string) => void;
  onStopStreaming: () => void;
  isStreaming: boolean;
  activePersona: PersonaId;
  onChangePersona: (persona: PersonaId) => void;
  initialText?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  activePersona,
  onChangePersona,
  initialText = '',
}) => {
  const [text, setText] = useState(initialText);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognizerRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
      textareaRef.current?.focus();
    }
  }, [initialText]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Handle Speech-to-Text toggle
  const handleToggleVoice = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
    } else {
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (error) => {
          console.warn('Speech error:', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || isStreaming) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
    }
  };

  const currentPersona = PERSONAS[activePersona];

  return (
    <div className="border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md p-3 sm:p-4 shrink-0">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Prompt Pill Shortcuts */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-500 font-medium shrink-0 mr-1">Quick:</span>
          
          <button
            onClick={() => {
              onChangePersona('developer_architect');
              setText('Build an interactive responsive dashboard component in React with Tailwind CSS');
              textareaRef.current?.focus();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700/60 whitespace-nowrap transition-colors"
          >
            <Code className="w-3 h-3 text-emerald-400" />
            <span>Build React Component</span>
          </button>

          <button
            onClick={() => {
              onChangePersona('productivity_planner');
              setText('Generate a 3-part Agile daily standup summary for my engineering team');
              textareaRef.current?.focus();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700/60 whitespace-nowrap transition-colors"
          >
            <CheckSquare className="w-3 h-3 text-cyan-400" />
            <span>Daily Standup</span>
          </button>

          <button
            onClick={() => {
              onChangePersona('code_reviewer');
              setText('Review this code for edge cases, memory leaks, and performance:\n\n');
              textareaRef.current?.focus();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700/60 whitespace-nowrap transition-colors"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Audit Code</span>
          </button>

          <button
            onClick={() => {
              onChangePersona('friendly_assistant');
              setText('Help me plan today with the Eisenhower matrix and 3 main goals');
              textareaRef.current?.focus();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700/60 whitespace-nowrap transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Plan My Day</span>
          </button>
        </div>

        {/* Input box */}
        <div className="relative bg-slate-950/70 border border-slate-700/70 focus-within:border-indigo-500 rounded-xl p-2 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening to your voice...' : currentPersona.placeholderText}
            rows={1}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none max-h-48 px-2 py-1 leading-relaxed selection:bg-indigo-500/30"
          />

          {/* Action Row inside bottom of composer */}
          <div className="flex items-center justify-between pt-1 px-1 border-t border-slate-800/60 mt-1">
            <div className="flex items-center gap-2">
              {/* Persona tag */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>Mode: <strong className="text-slate-300 font-semibold">{currentPersona.name}</strong></span>
              </div>

              {/* Voice recognition status */}
              {isListening && (
                <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium animate-pulse ml-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Recording Voice
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Speech-to-Text Button */}
              {isSpeechRecognitionSupported() && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak into microphone'}
                  aria-label="Toggle voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {/* Stop Streaming or Send Button */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopStreaming}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors"
                  title="Send message (Enter)"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Shift + Enter for new line</span>
          <span>Refill AI Assistant &middot; Ready</span>
        </div>
      </div>
    </div>
  );
};
