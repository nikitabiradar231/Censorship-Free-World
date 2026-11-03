import React from 'react';
import { ExternalLink, RefreshCw, Clock, Tag } from 'lucide-react';
import { PublishedArticleRecord } from '../types/article';
import { formatDate, shortenHash } from '../utils/formatters';
import { CopyLinkButton } from './CopyLinkButton';
import { generatePermanentFeedLinks } from '../services/swarmFeed';

interface ArticleCardProps {
  record: PublishedArticleRecord;
  onRefresh?: (record: PublishedArticleRecord) => void;
  onEdit?: (record: PublishedArticleRecord) => void;
  isRefreshing?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  record,
  onRefresh,
  onEdit,
  isRefreshing = false,
}) => {
  const { article, swarmReference, feedTopic, feedOwner, publishedAt } = record;
  const links = generatePermanentFeedLinks(feedOwner, feedTopic);

  return (
    <article className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-lg hover:shadow-cyan-950/20 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 font-medium">
              <Tag className="w-3 h-3" /> {article.category || 'General'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              v{article.version || 1}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(publishedAt || article.publishedAt)}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1 hover:text-cyan-300 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {article.subtitle && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-2 font-serif italic">
            {article.subtitle}
          </p>
        )}

        <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed font-sans">
          {article.content}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Swarm Content Ref:</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-cyan-400" title={swarmReference}>
              {shortenHash(swarmReference, 6, 4)}
            </span>
            <CopyLinkButton text={swarmReference} iconOnly />
          </div>
        </div>

        <div className="flex justify-between items-center text-slate-400">
          <span>Feed Topic:</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-slate-300" title={feedTopic}>
              {shortenHash(feedTopic, 6, 4)}
            </span>
            <CopyLinkButton text={feedTopic} iconOnly />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <CopyLinkButton
              text={links.permanentReaderLink}
              label="Copy Permanent Link"
              className="text-xs w-full justify-center"
            />
          </div>

          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={() => onRefresh(record)}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Verify and fetch latest version from Swarm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(record)}
                className="px-2.5 py-1 rounded-lg border border-cyan-800 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Update Article
              </button>
            )}

            <a
              href={links.permanentReaderLink}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Open Reader"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
