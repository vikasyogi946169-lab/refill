import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  Play, 
  FileCode 
} from 'lucide-react';
import { SavedSnippet } from '../types';

interface SavedSnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: SavedSnippet[];
  onDeleteSnippet: (id: string) => void;
  onRunInSandbox: (code: string, language: string) => void;
}

export const SavedSnippetsModal: React.FC<SavedSnippetsModalProps> = ({
  isOpen,
  onClose,
  snippets,
  onDeleteSnippet,
  onRunInSandbox,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Saved Code Snippets ({snippets.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snippets List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {snippets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No saved snippets yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Click the bookmark icon on any code block in the chat to save it here!
              </p>
            </div>
          ) : (
            snippets.map((snip) => (
              <div
                key={snip.id}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden"
              >
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-200 truncate">
                      {snip.title}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-medium">
                      {snip.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={() => {
                        onRunInSandbox(snip.code, snip.language);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] transition-colors"
                      title="Run in live sandbox"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Sandbox</span>
                    </button>

                    <button
                      onClick={() => handleCopy(snip.id, snip.code)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded"
                      title="Copy code"
                    >
                      {copiedId === snip.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteSnippet(snip.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded"
                      title="Delete snippet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <pre className="p-3 text-xs font-mono text-slate-300 max-h-48 overflow-x-auto leading-relaxed select-text">
                  <code>{snip.code}</code>
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
