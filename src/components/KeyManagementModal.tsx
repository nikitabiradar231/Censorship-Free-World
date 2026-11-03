import React, { useState } from 'react';
import { KeyRound, ShieldAlert, X, Eye, EyeOff, PlusCircle, Check, Copy, AlertTriangle } from 'lucide-react';
import { PublisherIdentity } from '../types/swarm';

interface KeyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeIdentity: PublisherIdentity | null;
  onGenerateNew: () => PublisherIdentity;
  onImportKey: (rawKey: string) => PublisherIdentity;
}

export const KeyManagementModal: React.FC<KeyManagementModalProps> = ({
  isOpen,
  onClose,
  activeIdentity,
  onGenerateNew,
  onImportKey,
}) => {
  const [importedKeyInput, setImportedKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    try {
      setError(null);
      onGenerateNew();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!importedKeyInput.trim()) {
        setError('Please enter a 32-byte hexadecimal private key.');
        return;
      }
      onImportKey(importedKeyInput.trim());
      setImportedKeyInput('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopyKey = async () => {
    if (!activeIdentity?.privateKey) return;
    try {
      await navigator.clipboard.writeText(activeIdentity.privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">Publisher Signing Identity</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert Banner */}
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
            <ShieldAlert className="w-4 h-4" /> Client-Side Sovereign Signing
          </div>
          <p className="text-[11px] leading-relaxed text-cyan-200/90">
            Your private key is kept strictly in your local browser session memory. It is never transmitted to any external server or saved in source code.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-900 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Identity Details */}
        {activeIdentity ? (
          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Publisher Ethereum Address (Feed Owner):</span>
              <span className="font-mono text-cyan-400 font-semibold break-all select-all">
                {activeIdentity.address}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">Private Key (Session Backup):</span>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showKey ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={activeIdentity.privateKey}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 select-all"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-400">
            No signing key is currently active in memory. Create one or import your existing key below.
          </div>
        )}

        {/* Action: Generate or Import */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Sovereign Key Pair</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase">Or Import Existing</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleImport} className="space-y-2">
            <input
              type="password"
              value={importedKeyInput}
              onChange={e => setImportedKeyInput(e.target.value)}
              placeholder="Paste 32-byte hex private key (0x...)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Import Private Key
            </button>
          </form>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

