import { marked } from 'marked';
import { ExtractedCodeBlock } from '../types';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Extracts all code blocks with backtick fences from raw markdown text
 */
export function extractCodeBlocks(markdown: string): ExtractedCodeBlock[] {
  const codeBlocks: ExtractedCodeBlock[] = [];
  const regex = /```([a-zA-Z0-9_\-+]*)\s*(?:[^\n]*\b(?:file|filename|title)=["']?([^"'\n]+)["']?)?\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const rawLang = match[1]?.trim().toLowerCase() || 'text';
    const filename = match[2]?.trim();
    const code = match[3]?.replace(/\n$/, '');

    codeBlocks.push({
      language: rawLang,
      code,
      filename,
    });
  }

  return codeBlocks;
}

/**
 * Render markdown safely to HTML
 */
export function renderMarkdown(markdown: string): string {
  try {
    return marked.parse(markdown) as string;
  } catch (err) {
    console.error('Markdown parse error:', err);
    return markdown;
  }
}
