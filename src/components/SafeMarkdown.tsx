import React from 'react';

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Escapes raw HTML to prevent XSS attacks from untrusted article content.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safely validates URLs to block `javascript:`, `data:`, or `vbscript:` vectors.
 */
function isSafeUrl(url: string): boolean {
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('bzz://') ||
    clean.startsWith('#/') ||
    clean.startsWith('/')
  );
}

/**
 * Parses inline formatting (bold, italic, code, safe links) safely.
 */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Tokenize bold (**text**), code (`code`), links ([text](url)), italic (*text*)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index} className="font-bold text-white">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const linkText = token.slice(1, token.indexOf(']('));
      const linkUrl = token.slice(token.indexOf('](') + 2, -1);
      if (isSafeUrl(linkUrl)) {
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
          >
            {linkText}
          </a>
        );
      } else {
        parts.push(escapeHtml(linkText));
      }
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index} className="italic text-slate-300">{token.slice(1, -1)}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/**
 * A safe, XSS-resilient Markdown renderer designed for FreePress investigative articles.
 * Strictly prevents arbitrary HTML or script injection while supporting rich editorial markup.
 */
export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: number) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-3 text-slate-300">
          {listBuffer.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    // Handle fenced code blocks (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto my-4"
          >
            <code>{codeBlockBuffer.join('\n')}</code>
          </pre>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        flushList(index);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    // Empty lines
    if (!trimmed) {
      flushList(index);
      return;
    }

    // List item (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    } else {
      flushList(index);
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-lg font-bold text-white mt-6 mb-2">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl md:text-2xl font-bold text-white mt-8 mb-3 pb-1 border-b border-slate-800">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-2xl md:text-3xl font-extrabold text-white mt-8 mb-4">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith('> ')) {
      // Blockquote
      elements.push(
        <blockquote
          key={index}
          className="border-l-4 border-cyan-500/80 pl-4 py-1 my-4 italic text-slate-300 bg-slate-900/40 rounded-r-lg"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
    } else {
      // Regular paragraph
      elements.push(
        <p key={index} className="leading-relaxed text-slate-200 my-3">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div className={`space-y-1 font-serif text-base ${className}`}>{elements}</div>;
};
