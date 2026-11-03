import React from 'react';
import { Radio, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { HealthStatus } from '../types/swarm';

interface BeeStatusProps {
  apiUrl: string;
  health: HealthStatus;
  checking: boolean;
  onRefresh: () => void;
  onConfigure?: () => void;
  compact?: boolean;
}

export const BeeStatus: React.FC<BeeStatusProps> = ({
  apiUrl,
  health,
  checking,
  onRefresh,
  onConfigure,
  compact = false,
}) => {
  const isOk = health.isReachable && health.status === 'ok';

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
        <span
          className={`w-2 h-2 rounded-full ${
            isOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
          }`}
        />
        <span className="font-mono text-slate-400 truncate max-w-[140px]">{apiUrl}</span>
        <button
          onClick={onRefresh}
          disabled={checking}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Ethereum Swarm Bee Node</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            disabled={checking}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Check node health"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium ml-2 cursor-pointer"
            >
              Configure
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
          <span className="text-slate-400">Endpoint:</span>
          <span className="font-mono text-slate-300 truncate max-w-[220px]" title={apiUrl}>
            {apiUrl}
          </span>
        </div>
        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
          <span className="text-slate-400">Health:</span>
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              isOk ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOk ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Reachable (v{health.version || 'unknown'})
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                {health.error || 'Unreachable'}
              </>
            )}
          </span>
        </div>
        {health.beeMode && (
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-400">Node Mode:</span>
            <span className="font-mono text-cyan-300 uppercase text-[11px]">
              {health.beeMode}
            </span>
          </div>
        )}
      </div>

      {!isOk && (
        <div className="mt-3 p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 leading-relaxed">
          Bee node at <code className="text-rose-200">{apiUrl}</code> is offline. Run your local Bee node or configure a reachable gateway URL in Settings.
        </div>
      )}
    </div>
  );
};
