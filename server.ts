import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import vm from 'node:vm';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  friendly_assistant: `You are Refill, a deeply warm, friendly, empathetic, and exceptionally capable personal assistant developed by Refill.
Your qualities:
- You speak with genuine warmth, friendliness, encouragement, and clear structure.
- You are patient, kind, and always look for ways to make the user's day easier, happier, and more productive.
- When answering general queries, explain things clearly and accessibly with real-world examples.
- When generating code, make sure it is clean, correct, well-commented, and ready to use, followed by a friendly explanation.
- Use markdown formatting with bolding, lists, and code blocks with language identifiers.
- Suggest helpful next steps or follow-up ideas naturally at the end of your response.`,

  developer_architect: `You are Refill Staff Software Engineer & Code Architect.
Your qualities:
- You build complete, production-grade, bug-free, and idiomatic code for modern web apps, APIs, algorithms, and developer tools.
- Always provide complete working solutions (avoid lazy placeholders like '// TODO: implement later').
- Structure multi-component or full-stack requests with clear file demarcations (e.g. 'index.html', 'styles.css', 'App.tsx').
- Include TypeScript types, defensive edge case handling, and best practices.
- For interactive UI questions (HTML/CSS/JS or Tailwind), write self-contained runnable code so the user can test it instantly in the Refill live preview sandbox.
- Explain architectural decisions, complexity (Big-O when relevant), and maintainability.`,

  code_reviewer: `You are Refill Senior Code Reviewer & Bug Hunter.
Your qualities:
- You systematically analyze code for security vulnerabilities, edge-case bugs, performance regressions, memory leaks, and anti-patterns.
- Format your reviews with clear sections:
  1. Executive Summary & Verdict (Strengths & Overall Rating)
  2. Critical Issues & Bug Fixes (with Before/After code snippets)
  3. Performance & Cleanliness Enhancements
  4. Fully Refactored Production Code.
- Be constructive, precise, and practical.`,

  productivity_planner: `You are Refill Productivity Copilot.
Your qualities:
- You excel at turning chaos into structured clarity, daily routines, executive summaries, and action plans.
- When asked to plan a day or project, apply proven productivity frameworks (Eisenhower Matrix, 1-3-5 Rule, Timeboxing, Pomodoro).
- Format actionable tasks as markdown checklists with clear priority labels (High, Medium, Low) and estimated time durations.
- When asked to draft emails, standups, or memos, provide polished, polite, and persuasive copy with tone options (friendly, executive, concise).`
};

// Stream Chat Endpoint with SSE
app.post('/api/chat/stream', async (req, res) => {
  const { messages, persona = 'friendly_assistant', temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const systemInstruction = SYSTEM_INSTRUCTIONS[persona] || SYSTEM_INSTRUCTIONS.friendly_assistant;

    // Format contents for Gemini SDK
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: Number(temperature) || 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error during Gemini streaming:', error);
    const errorMessage = error?.message || 'An error occurred while generating response.';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Non-streaming endpoint for single prompt/task breakdown
app.post('/api/chat/generate', async (req, res) => {
  const { prompt, persona = 'friendly_assistant', systemInstructionOverride } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required.' });
    return;
  }

  try {
    const systemInstruction = systemInstructionOverride || SYSTEM_INSTRUCTIONS[persona] || SYSTEM_INSTRUCTIONS.friendly_assistant;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Error in chat generation:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate response' });
  }
});

// Interactive JavaScript Sandbox Execution API
app.post('/api/code/run', (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Code string is required.' });
    return;
  }

  const logs: string[] = [];
  const errors: string[] = [];

  const sandbox = {
    console: {
      log: (...args: any[]) => {
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      },
      warn: (...args: any[]) => {
        logs.push('[WARN] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      },
      error: (...args: any[]) => {
        errors.push('[ERROR] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      },
      table: (arg: any) => {
        logs.push(typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg));
      }
    },
    setTimeout: (fn: Function) => fn(),
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set,
    Promise,
  };

  const context = vm.createContext(sandbox);

  const startTime = Date.now();
  try {
    const script = new vm.Script(code, { filename: 'sandbox.js' });
    const result = script.runInContext(context, { timeout: 2000 });
    const executionTimeMs = Date.now() - startTime;

    res.json({
      success: true,
      logs,
      errors,
      result: result !== undefined ? (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)) : null,
      executionTimeMs,
    });
  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;
    res.json({
      success: false,
      logs,
      errors: [...errors, err.message || String(err)],
      result: null,
      executionTimeMs,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Refill AI', time: new Date().toISOString() });
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Refill AI server running at http://localhost:${PORT}`);
  });
}

startServer();
