import React from 'react';
import { Rss, ExternalLink, RefreshCw } from 'lucide-react';
import { CopyLinkButton } from './CopyLinkButton';
import { shortenHash } from '../utils/formatters';

interface FeedStatusProps {
  owner: string;
  topic: string;
  latestReference?: string;
  permanentReaderLink?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const FeedStatus: React.FC<FeedStatusProps> = ({
  owner,
  topic,
  latestReference,
  permanentReaderLink,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rss className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Swarm Feed Identity</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Resolve latest feed update"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Check Feed</span>
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Feed Owner:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-slate-300" title={owner}>
              {shortenHash(owner, 8, 6)}
            </span>
            <CopyLinkButton text={owner} label="Copy" iconOnly />
          </div>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Feed Topic:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-slate-300" title={topic}>
              {shortenHash(topic, 8, 6)}
            </span>
            <CopyLinkButton text={topic} label="Copy" iconOnly />
          </div>
        </div>

        {latestReference && (
          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Latest Content Hash:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-cyan-300" title={latestReference}>
                {shortenHash(latestReference, 8, 6)}
              </span>
              <CopyLinkButton text={latestReference} label="Copy" iconOnly />
            </div>
          </div>
        )}

        {permanentReaderLink && (
          <div className="pt-2">
            <span className="block text-slate-400 mb-1">Permanent Reader URL:</span>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="font-mono text-[11px] text-cyan-400 truncate flex-1">
                {permanentReaderLink}
              </span>
              <CopyLinkButton text={permanentReaderLink} label="Copy Link" />
              <a
                href={permanentReaderLink}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Open Reader in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

