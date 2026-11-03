import React from 'react';
import { Stamp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { PostageBatchInfo } from '../types/swarm';
import { shortenHash } from '../utils/formatters';
import { CopyLinkButton } from './CopyLinkButton';

interface PostageStatusProps {
  batchId: string;
  batchInfo: PostageBatchInfo | null;
  onConfigure?: () => void;
  compact?: boolean;
}

export const PostageStatus: React.FC<PostageStatusProps> = ({
  batchId,
  batchInfo,
  onConfigure,
  compact = false,
}) => {
  const hasBatch = Boolean(batchId && batchId.trim().length > 0);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
        <Stamp className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400">Postage:</span>
        {hasBatch ? (
          <span className="font-mono text-cyan-300">{shortenHash(batchId, 4, 4)}</span>
        ) : (
          <span className="text-amber-400 font-medium">None Set</span>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Stamp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Swarm Postage Stamp Batch</h3>
        </div>
        {onConfigure && (
          <button
            onClick={onConfigure}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            Change
          </button>
        )}
      </div>

      {!hasBatch ? (
        <div className="mt-2 p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-amber-200">
            <AlertTriangle className="w-4 h-4" /> No Postage Batch Configured
          </div>
          <p className="text-amber-300/90 text-[11px] leading-relaxed">
            Uploading content to Ethereum Swarm requires a funded postage stamp batch. Storage in Swarm is incentivized and not free. Without a postage batch, new uploads and feed updates will fail.
          </p>
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="mt-1 inline-block text-xs font-semibold underline text-amber-200 hover:text-white cursor-pointer"
            >
              Add a Batch ID in Settings &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
            <span className="text-slate-400">Batch ID:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-slate-300" title={batchId}>
                {shortenHash(batchId, 8, 6)}
              </span>
              <CopyLinkButton text={batchId} label="Copy" iconOnly />
            </div>
          </div>

          {batchInfo && (
            <>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                <span className="text-slate-400">Usability:</span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    batchInfo.usable ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {batchInfo.usable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Usable for uploads
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Not Usable / Expired
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
                <span className="text-slate-400">Storage Depth:</span>
                <span className="font-mono text-slate-300">
                  {batchInfo.depth} (Bucket Depth: {batchInfo.bucketDepth})
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Batch Utilization:</span>
                  <span>{Math.round(batchInfo.utilization * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      batchInfo.utilization > 0.9
                        ? 'bg-rose-500'
                        : batchInfo.utilization > 0.7
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, batchInfo.utilization * 100))}%` }}
                  />
                </div>
              </div>

              {batchInfo.errorMessage && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300">
                  {batchInfo.errorMessage}
                </div>
              )}
            </>
          )}

          <p className="text-[11px] text-slate-500 italic mt-1">
            Batch guarantees your chunks are prioritized and persisted across the Swarm storage neighborhood.
          </p>
        </div>
      )}
    </div>
  );
};
