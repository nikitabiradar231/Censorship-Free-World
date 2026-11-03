import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  RefreshCw,
  Tag,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  Radio,
  Search,
  Loader2,
} from 'lucide-react';
import { Article } from '../types/article';
import { resolveAndFetchArticleFromFeed, fetchArticleFromSwarm } from '../services/swarmReader';
import { useSwarmConfig } from '../hooks/useSwarmConfig';
import { formatDate, shortenHash } from '../utils/formatters';
import { CopyLinkButton } from '../components/CopyLinkButton';

export const Reader: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { config } = useSwarmConfig();

  const ownerParam = searchParams.get('owner') || '';
  const topicParam = searchParams.get('topic') || '';
  const refParam = searchParams.get('ref') || '';

  const [inputOwner, setInputOwner] = useState(ownerParam);
  const [inputTopic, setInputTopic] = useState(topicParam);
  const [inputRef, setInputRef] = useState(refParam);

  const [article, setArticle] = useState<Article | null>(null);
  const [swarmReference, setSwarmReference] = useState<string>('');
  const [contentSource, setContentSource] = useState<'swarm-bee' | 'swarm-gateway'>('swarm-bee');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadArticle = useCallback(async () => {
    setError(null);
    if (!ownerParam && !topicParam && !refParam) {
      setArticle(null);
      return;
    }

    setLoading(true);

    try {
      if (ownerParam && topicParam) {
        const res = await resolveAndFetchArticleFromFeed(
          ownerParam,
          topicParam,
          config.beeApiUrl
        );
        setArticle(res.article);
        setSwarmReference(res.reference);
        setContentSource(res.source);
      } else if (refParam) {
        const res = await fetchArticleFromSwarm(refParam, config.beeApiUrl);
        setArticle(res.article);
        setSwarmReference(refParam);
        setContentSource(res.source);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve article from Ethereum Swarm');
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [ownerParam, topicParam, refParam, config.beeApiUrl]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOwner && inputTopic) {
      setSearchParams({ owner: inputOwner.trim(), topic: inputTopic.trim() });
    } else if (inputRef) {
      setSearchParams({ ref: inputRef.trim() });
    }
  };

  const currentPermanentUrl = window.location.href;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Reader Lookup Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Swarm Feed Reader (Zero Wallet Connection Required)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Direct Swarm Resolution
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Feed Owner (Ethereum Address):
              </label>
              <input
                type="text"
                value={inputOwner}
                onChange={e => setInputOwner(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Feed Topic Identifier / Hex:
              </label>
              <input
                type="text"
                value={inputTopic}
                onChange={e => setInputTopic(e.target.value)}
                placeholder="e.g. divya-water-investigation or 0x..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 text-xs">Or direct hash:</span>
              <input
                type="text"
                value={inputRef}
                onChange={e => setInputRef(e.target.value)}
                placeholder="Swarm Reference (64 hex)"
                className="w-full sm:w-64 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Resolve Swarm Content</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Resolving Swarm Feed...</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Retrieving latest Single Owner Chunk from Ethereum Swarm neighborhood and downloading article bytes...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-900/80 text-rose-300 space-y-3">
          <div className="flex items-center gap-2 font-bold text-rose-200 text-base">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Unable to Resolve Swarm Content</span>
          </div>
          <p className="text-xs leading-relaxed">{error}</p>
          <div className="pt-2 text-xs text-rose-400/90 leading-relaxed space-y-1">
            <p>&bull; Verify that your configured Bee node ({config.beeApiUrl}) is running and reachable.</p>
            <p>&bull; Confirm the publisher's owner address and topic are correct.</p>
            <p>&bull; You can update the Bee URL or Gateway in <Link to="/settings" className="underline font-semibold text-rose-200">Settings</Link>.</p>
          </div>
        </div>
      )}

      {/* No Article Selected State */}
      {!loading && !error && !article && (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Article Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Open a FreePress permanent link or enter a publisher's Feed Owner address and Topic identifier above to read reporting directly from Ethereum Swarm.
          </p>
        </div>
      )}

      {/* Article Render View */}
      {!loading && article && (
        <article className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-semibold text-xs">
                  <Tag className="w-3 h-3" /> {article.category}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Version {article.version}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadArticle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                  title="Check Swarm Feed for latest version"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Refresh Feed</span>
                </button>
                <CopyLinkButton text={currentPermanentUrl} label="Share Link" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="text-base sm:text-lg text-slate-300 font-serif italic leading-relaxed">
                  {article.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>By {article.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Published: {formatDate(article.publishedAt)}</span>
              </div>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <span className="text-cyan-400/80">
                  (Updated: {formatDate(article.updatedAt)})
                </span>
              )}
            </div>

            {/* Swarm Provenance Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ethereum Swarm Provenance
                </span>
                <span>Source: {contentSource === 'swarm-bee' ? 'Configured Bee Node' : 'Swarm Gateway'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex justify-between items-center bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
                  <span className="text-slate-500">Content Reference:</span>
                  <span className="text-cyan-300 truncate max-w-[160px]" title={swarmReference}>
                    {shortenHash(swarmReference, 8, 6)}
                  </span>
                </div>
                {ownerParam && (
                  <div className="flex justify-between items-center bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
                    <span className="text-slate-500">Feed Owner:</span>
                    <span className="text-slate-300 truncate max-w-[160px]" title={ownerParam}>
                      {shortenHash(ownerParam, 8, 6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-xl backdrop-blur-sm">
            {article.coverImage && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-800 max-h-96">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line font-serif">
              {article.content}
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
