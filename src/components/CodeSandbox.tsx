import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Code, 
  Terminal, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodeSandboxProps {
  initialCode?: string;
  initialLanguage?: string;
}

const DEFAULT_WEB_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive App</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-white tracking-tight">Stopwatch & Timer</h1>
      <span class="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-mono font-medium">LIVE</span>
    </div>

    <!-- Timer Display -->
    <div class="text-center py-6 bg-slate-950/60 rounded-xl border border-slate-800 mb-6">
      <div id="display" class="text-4xl font-mono font-bold tracking-wider text-emerald-400">00:00.00</div>
    </div>

    <!-- Controls -->
    <div class="flex gap-3 mb-6">
      <button id="startBtn" onclick="toggleTimer()" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">Start</button>
      <button id="lapBtn" onclick="recordLap()" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 font-semibold rounded-lg transition-colors">Lap</button>
      <button id="resetBtn" onclick="resetTimer()" class="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-400 rounded-lg transition-colors">Reset</button>
    </div>

    <!-- Laps List -->
    <div class="border-t border-slate-700/60 pt-4">
      <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recorded Laps</div>
      <div id="lapsList" class="space-y-1.5 max-h-36 overflow-y-auto text-xs font-mono text-slate-300">
        <div class="text-slate-500 italic">No laps recorded yet.</div>
      </div>
    </div>
  </div>

  <script>
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let laps = [];

    function formatTime(ms) {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const centis = Math.floor((ms % 1000) / 10);
      return String(minutes).padStart(2, '0') + ':' + 
             String(seconds).padStart(2, '0') + '.' + 
             String(centis).padStart(2, '0');
    }

    function toggleTimer() {
      const btn = document.getElementById('startBtn');
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.innerText = 'Resume';
        btn.className = 'flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg';
      } else {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
          elapsedTime = Date.now() - startTime;
          document.getElementById('display').innerText = formatTime(elapsedTime);
        }, 10);
        btn.innerText = 'Pause';
        btn.className = 'flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg';
      }
    }

    function recordLap() {
      if (elapsedTime === 0) return;
      laps.unshift(elapsedTime);
      renderLaps();
    }

    function renderLaps() {
      const list = document.getElementById('lapsList');
      if (laps.length === 0) {
        list.innerHTML = '<div class="text-slate-500 italic">No laps recorded yet.</div>';
        return;
      }
      list.innerHTML = laps.map((lap, i) => \`
        <div class="flex justify-between py-1 px-2 rounded bg-slate-900/60 border border-slate-800">
          <span class="text-slate-400">Lap #\${laps.length - i}</span>
          <span class="text-emerald-400 font-bold">\${formatTime(lap)}</span>
        </div>
      \`).join('');
    }

    function resetTimer() {
      clearInterval(timerInterval);
      timerInterval = null;
      elapsedTime = 0;
      laps = [];
      document.getElementById('display').innerText = '00:00.00';
      const btn = document.getElementById('startBtn');
      btn.innerText = 'Start';
      btn.className = 'flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg';
      renderLaps();
    }
  </script>
</body>
</html>`;

const JS_ALGORITHM_TEMPLATE = `// Refill Logic & Algorithm Benchmark Runner
console.log("Starting performance benchmark...");

function fibonacciMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
}

const numbers = [10, 20, 30, 40, 45];
console.log("Calculating Fibonacci sequence with memoization:");

numbers.forEach(num => {
  const start = Date.now();
  const val = fibonacciMemo(num);
  const time = Date.now() - start;
  console.log(\`fib(\${num}) = \${val.toLocaleString()} [computed in \${time}ms]\`);
});

// Example Data Transformation
const users = [
  { id: 1, name: "Alice", role: "Frontend", score: 98 },
  { id: 2, name: "Bob", role: "Backend", score: 95 },
  { id: 3, name: "Charlie", role: "DevOps", score: 99 },
];

console.log("Filtered High Performers (score >= 98):");
console.log(users.filter(u => u.score >= 98));

// Return summary
({ status: "Benchmark complete", totalTested: numbers.length, topUser: users[2].name });
`;

export const CodeSandbox: React.FC<CodeSandboxProps> = ({
  initialCode,
  initialLanguage = 'html',
}) => {
  const [sandboxMode, setSandboxMode] = useState<'preview' | 'console'>(
    initialLanguage === 'javascript' || initialLanguage === 'js' ? 'console' : 'preview'
  );
  const [code, setCode] = useState(
    initialCode || (sandboxMode === 'console' ? JS_ALGORITHM_TEMPLATE : DEFAULT_WEB_TEMPLATE)
  );
  const [viewport, setViewport] = useState<'full' | 'tablet' | 'mobile'>('full');
  const [copied, setCopied] = useState(false);
  
  // Console runner state
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{
    logs: string[];
    errors: string[];
    result: string | null;
    executionTimeMs: number;
  }>({
    logs: ['Click "Run Code" to execute this script.'],
    errors: [],
    result: null,
    executionTimeMs: 0,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // If initialCode changes from outside (e.g. clicking "Run in Sandbox" on a chat message)
  useEffect(() => {
    if (initialCode) {
      // Check if it's full html or needs wrapping
      let processedCode = initialCode;
      if (initialLanguage === 'html' || initialLanguage === 'xml') {
        if (!initialCode.includes('<!DOCTYPE html>') && !initialCode.includes('<html')) {
          processedCode = wrapSnippetInHtml(initialCode);
        }
        setSandboxMode('preview');
      } else if (initialLanguage === 'javascript' || initialLanguage === 'js') {
        setSandboxMode('console');
      } else {
        // Default to preview with wrapper
        processedCode = wrapSnippetInHtml(initialCode);
        setSandboxMode('preview');
      }
      setCode(processedCode);
    }
  }, [initialCode, initialLanguage]);

  // Update iframe preview
  const refreshPreview = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(code);
      doc.close();
    }
  };

  useEffect(() => {
    if (sandboxMode === 'preview') {
      const timer = setTimeout(refreshPreview, 150);
      return () => clearTimeout(timer);
    }
  }, [code, sandboxMode]);

  // Run code via server VM endpoint
  const handleRunConsole = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setConsoleOutput({
        logs: data.logs || [],
        errors: data.errors || [],
        result: data.result,
        executionTimeMs: data.executionTimeMs || 0,
      });

      if (data.success && (!data.errors || data.errors.length === 0)) {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
        });
      }
    } catch (err: any) {
      setConsoleOutput({
        logs: [],
        errors: [err.message || 'Execution failed'],
        result: null,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    const ext = sandboxMode === 'preview' ? 'html' : 'js';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refill-app.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Sandbox Sub-Header Controls */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => {
                setSandboxMode('preview');
                if (code === JS_ALGORITHM_TEMPLATE) setCode(DEFAULT_WEB_TEMPLATE);
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                sandboxMode === 'preview'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live App Preview</span>
            </button>

            <button
              onClick={() => {
                setSandboxMode('console');
                if (code === DEFAULT_WEB_TEMPLATE) setCode(JS_ALGORITHM_TEMPLATE);
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                sandboxMode === 'console'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>JS Runner & Console</span>
            </button>
          </div>

          {/* Quick Presets Dropdown */}
          <button
            onClick={() => {
              if (sandboxMode === 'preview') {
                setCode(DEFAULT_WEB_TEMPLATE);
              } else {
                setCode(JS_ALGORITHM_TEMPLATE);
              }
            }}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 hover:bg-slate-850 rounded-lg transition-colors"
            title="Load default starter template"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Load Demo</span>
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {sandboxMode === 'preview' && (
            <div className="hidden sm:flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setViewport('full')}
                className={`p-1.5 rounded transition-colors ${viewport === 'full' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Full desktop width"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded transition-colors ${viewport === 'tablet' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Tablet width (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded transition-colors ${viewport === 'mobile' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                title="Mobile width (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {sandboxMode === 'console' && (
            <button
              onClick={handleRunConsole}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          )}

          {sandboxMode === 'preview' && (
            <button
              onClick={refreshPreview}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh preview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Editor, Right Preview/Console */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Code Editor Pane */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950">
          <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-slate-300 font-medium">Source Editor</span>
            <span className="font-mono text-[11px] text-slate-500">
              {code.split('\n').length} lines &middot; {code.length} chars
            </span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed resize-none outline-none selection:bg-indigo-500/30 overflow-auto"
          />
        </div>

        {/* Right: Live Preview Frame or Terminal Output */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-slate-900/60 overflow-hidden">
          {sandboxMode === 'preview' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">Live Isolated Sandbox</span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Sandboxed & Safe
                </span>
              </div>

              <div className="flex-1 p-3 bg-slate-950/80 flex items-center justify-center overflow-auto">
                <div className={`h-full ${getViewportWidth()} bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-200`}>
                  <iframe
                    ref={iframeRef}
                    title="Live App Sandbox"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                    className="w-full h-full border-0 bg-slate-950"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Console Execution Output */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-slate-300 font-medium">Console Output</span>
                {consoleOutput.executionTimeMs > 0 && (
                  <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
                    Executed in {consoleOutput.executionTimeMs}ms
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 select-text">
                {consoleOutput.logs.map((log, i) => (
                  <div key={i} className="text-slate-300 whitespace-pre-wrap leading-relaxed border-l-2 border-slate-700 pl-2">
                    {log}
                  </div>
                ))}

                {consoleOutput.errors.map((err, i) => (
                  <div key={`err-${i}`} className="text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 whitespace-pre-wrap">
                    {err}
                  </div>
                ))}

                {consoleOutput.result !== null && (
                  <div className="mt-3 pt-2 border-t border-slate-800">
                    <span className="text-indigo-400 font-semibold block text-[11px] uppercase tracking-wider mb-1">
                      Return Value:
                    </span>
                    <pre className="bg-slate-900 p-2.5 rounded text-indigo-200 overflow-x-auto">
                      {consoleOutput.result}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function wrapSnippetInHtml(snippet: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refill Preview</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-6">
  ${snippet}
</body>
</html>`;
}
