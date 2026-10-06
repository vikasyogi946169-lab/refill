import React, { useState } from 'react';
import { 
  CheckSquare, 
  Mail, 
  Calendar, 
  Sparkles, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductivityTask } from '../types';

export const ProductivitySuite: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'standup' | 'breakdown' | 'email'>('standup');

  // Standup Generator State
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [standupOutput, setStandupOutput] = useState('');
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false);
  const [copiedStandup, setCopiedStandup] = useState(false);

  // Task Breakdown State
  const [goalInput, setGoalInput] = useState('');
  const [tasks, setTasks] = useState<ProductivityTask[]>([
    { id: '1', title: 'Review pull requests and team standup notes', category: 'Dev', priority: 'high', estimateMin: 20, completed: true },
    { id: '2', title: 'Implement user session token refreshing logic', category: 'Dev', priority: 'high', estimateMin: 45, completed: false },
    { id: '3', title: 'Write integration test coverage for authentication route', category: 'QA', priority: 'medium', estimateMin: 30, completed: false },
    { id: '4', title: 'Draft weekly engineering progress summary for team lead', category: 'Admin', priority: 'low', estimateMin: 15, completed: false },
  ]);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Email Drafter State
  const [recipient, setRecipient] = useState('');
  const [emailGoal, setEmailGoal] = useState('');
  const [emailTone, setEmailTone] = useState<'friendly' | 'executive' | 'concise' | 'persuasive'>('friendly');
  const [emailOutput, setEmailOutput] = useState('');
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Generate Standup with AI
  const handleGenerateStandup = async () => {
    setIsGeneratingStandup(true);
    try {
      const prompt = `Format this into a clean, modern Agile Daily Standup summary for Slack/Discord with bullet points and clear emojis:
Yesterday: ${yesterday || 'Worked on core features, fixed minor bugs, reviewed PRs'}
Today: ${today || 'Continue sprint tickets, build frontend integration, test edge cases'}
Blockers: ${blockers || 'None at the moment'}`;

      const res = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          persona: 'productivity_planner',
        }),
      });
      const data = await res.json();
      setStandupOutput(data.text || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingStandup(false);
    }
  };

  // Generate Task Breakdown with AI
  const handleGenerateBreakdown = async () => {
    if (!goalInput.trim()) return;
    setIsBreakingDown(true);

    try {
      const prompt = `Break down this developer/productivity goal into 4 to 6 concrete, actionable tasks with estimated minutes and priority (high/medium/low).
Goal: "${goalInput}"

Return strictly a JSON array without markdown formatting or code blocks:
[
  { "title": "Specific action item", "category": "Dev/Planning/Testing", "priority": "high"|"medium"|"low", "estimateMin": 30 }
]`;

      const res = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          persona: 'productivity_planner',
          systemInstructionOverride: 'You are a project manager. Return ONLY valid JSON array containing task breakdown objects.',
        }),
      });

      const data = await res.json();
      let text = data.text || '';
      // Clean possible markdown code fences
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        const newTasks: ProductivityTask[] = parsed.map((item: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          title: item.title,
          category: item.category || 'General',
          priority: item.priority || 'medium',
          estimateMin: item.estimateMin || 25,
          completed: false,
        }));
        setTasks(newTasks);
        setGoalInput('');
      }
    } catch (err) {
      console.error('Failed to parse breakdown JSON:', err);
    } finally {
      setIsBreakingDown(false);
    }
  };

  // Toggle Task Completion
  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);

    const completedCount = updated.filter(t => t.completed).length;
    if (completedCount === updated.length && updated.length > 0) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddCustomTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: ProductivityTask = {
      id: String(Date.now()),
      title: newTaskTitle.trim(),
      category: 'General',
      priority: 'medium',
      estimateMin: 25,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  // Generate Email Draft with AI
  const handleDraftEmail = async () => {
    if (!emailGoal.trim()) return;
    setIsDraftingEmail(true);

    try {
      const prompt = `Draft a well-crafted email to "${recipient || 'a colleague/client'}".
Objective / What to convey: "${emailGoal}"
Desired Tone: "${emailTone}" (e.g. friendly and warm, executive polished, concise, or persuasive).

Format the output clearly with:
Subject: [Compelling Subject Line]

[Body of the email]
[Sign-off with placeholder name]`;

      const res = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          persona: 'friendly_assistant',
        }),
      });
      const data = await res.json();
      setEmailOutput(data.text || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDraftingEmail(false);
    }
  };

  const copyToClipboard = async (text: string, setter: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalEstimatedHours = (tasks.reduce((sum, t) => sum + (t.completed ? 0 : t.estimateMin), 0) / 60).toFixed(1);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Daily Productivity Copilot</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Standups, intelligent task breakdowns, and professional communication drafting.
            </p>
          </div>

          {/* Sub-tools Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start">
            <button
              onClick={() => setActiveTool('standup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTool === 'standup' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agile Standup</span>
            </button>

            <button
              onClick={() => setActiveTool('breakdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTool === 'breakdown' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Task Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTool('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTool === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Draft Email</span>
            </button>
          </div>
        </div>

        {/* 1. Agile Standup Generator */}
        {activeTool === 'standup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Quick Standup Inputs
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    What did you accomplish yesterday?
                  </label>
                  <textarea
                    value={yesterday}
                    onChange={(e) => setYesterday(e.target.value)}
                    placeholder="e.g. Fixed cart checkout bug, finished Figma wireframes, merged PR #142..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    What is on your agenda today?
                  </label>
                  <textarea
                    value={today}
                    onChange={(e) => setToday(e.target.value)}
                    placeholder="e.g. Implement webhook handlers, run performance benchmark, team sync at 2pm..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Any blockers or things you need help with?
                  </label>
                  <input
                    type="text"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="e.g. Waiting on API credentials from DevOps, none"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateStandup}
                  disabled={isGeneratingStandup}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingStandup ? 'Drafting Standup...' : 'Generate Polished Standup'}</span>
                </button>
              </div>
            </div>

            {/* Standup Output Panel */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200">Formatted Standup Result</span>
                {standupOutput && (
                  <button
                    onClick={() => copyToClipboard(standupOutput, setCopiedStandup)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    {copiedStandup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStandup ? 'Copied to Clipboard' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 font-mono whitespace-pre-wrap overflow-y-auto leading-relaxed">
                {standupOutput ? (
                  standupOutput
                ) : (
                  <span className="text-slate-600 italic">
                    Fill in your details and click &ldquo;Generate Polished Standup&rdquo; to see a beautifully formatted Slack/Discord summary here.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Smart Task Breakdown & Checklist */}
        {activeTool === 'breakdown' && (
          <div className="space-y-5">
            {/* Input Bar */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                What project or goal do you want to break down into actionable tasks?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateBreakdown()}
                  placeholder="e.g. Build end-to-end user authentication with JWT and password resets"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleGenerateBreakdown}
                  disabled={isBreakingDown || !goalInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBreakingDown ? 'Generating...' : 'Break Down Goal'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Metric Header */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">Checklist Progress:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                    {completedTasks}/{tasks.length} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-48 sm:w-64 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-4">
                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>~{totalEstimatedHours}h remaining</span>
                </div>
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    task.completed 
                      ? 'bg-slate-900/30 border-slate-800/50 opacity-60' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span className={`text-xs text-slate-200 truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                      task.priority === 'high' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : task.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>

                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {task.estimateMin}m
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Task Form */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTask()}
                placeholder="Add a new custom task..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none"
              />
              <button
                onClick={handleAddCustomTask}
                disabled={!newTaskTitle.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Executive Email & Memo Drafter */}
        {activeTool === 'email' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                Message Specifications
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Recipient / Audience
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. Engineering Lead, Enterprise Client, Team Members"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    What is the objective or key update?
                  </label>
                  <textarea
                    value={emailGoal}
                    onChange={(e) => setEmailGoal(e.target.value)}
                    placeholder="e.g. Project milestone 2 is complete, request approval to deploy on Friday, remind them to review staging environment..."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Tone & Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'friendly', label: 'Friendly & Warm' },
                      { id: 'executive', label: 'Executive Polished' },
                      { id: 'concise', label: 'Direct & Concise' },
                      { id: 'persuasive', label: 'Persuasive Pitch' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEmailTone(t.id as any)}
                        className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                          emailTone === t.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDraftEmail}
                  disabled={isDraftingEmail || !emailGoal.trim()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isDraftingEmail ? 'Drafting Message...' : 'Draft Communication'}</span>
                </button>
              </div>
            </div>

            {/* Email Draft Result */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200">Generated Email Draft</span>
                {emailOutput && (
                  <button
                    onClick={() => copyToClipboard(emailOutput, setCopiedEmail)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 whitespace-pre-wrap overflow-y-auto leading-relaxed">
                {emailOutput ? (
                  emailOutput
                ) : (
                  <span className="text-slate-600 italic">
                    Specify the recipient and core objective on the left, then click &ldquo;Draft Communication&rdquo; to generate your ready-to-send draft.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
