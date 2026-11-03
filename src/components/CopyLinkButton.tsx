import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  text: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  text,
  label = 'Copy',
  className = '',
  iconOnly = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
        copied
          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
      } ${className}`}
      title={text}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {!iconOnly && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  );
};

