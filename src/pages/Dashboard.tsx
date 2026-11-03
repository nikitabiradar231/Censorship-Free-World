import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileEdit,
  PlusCircle,
  BookOpen,
  KeyRound,
  Info,
} from 'lucide-react';
import { PublishedArticleRecord } from '../types/article';
import { BeeStatus } from '../components/BeeStatus';
import { PostageStatus } from '../components/PostageStatus';
import { FeedStatus } from '../components/FeedStatus';
import { ArticleCard } from '../components/ArticleCard';
import { useSwarmConfig } from '../hooks/useSwarmConfig';
import { useSwarmIdentity } from '../hooks/useSwarmIdentity';
import { resolveLatestFeedReference } from '../services/swarmReader';
import { shortenHash } from '../utils/formatters';

interface DashboardProps {
  onOpenKeyModal: () => void;
}

const PUBLISHED_HISTORY_KEY = 'freepress_published_articles';

export const Dashboard: React.FC<DashboardProps> = ({ onOpenKeyModal }) => {
  const { config, health, batchInfo, checking, checkConnectivity } = useSwarmConfig();
  const { identity } = useSwarmIdentity();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<PublishedArticleRecord[]>(() => {
    try {
      const stored = localStorage.getItem(PUBLISHED_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [refreshingTopic, setRefreshingTopic] = useState<string | null>(null);
  const [feedNotification, setFeedNotification] = useState<string | null>(null);

  const handleRefreshArticle = async (record: PublishedArticleRecord) => {
    setRefreshingTopic(record.feedTopic);
    setFeedNotification(null);
    try {
      const latest = await resolveLatestFeedReference(
        record.feedOwner,
        record.feedTopic,
        config.beeApiUrl
      );

      if (latest.reference !== record.swarmReference) {
        const updated = articles.map(item =>
          item.feedTopic === record.feedTopic
            ? { ...item, swarmReference: latest.reference }
            : item
        );
        setArticles(updated);
        localStorage.setItem(PUBLISHED_HISTORY_KEY, JSON.stringify(updated));
        setFeedNotification(
          `Swarm Feed updated! New latest content hash: ${shortenHash(latest.reference, 6, 4)}`
        );
      } else {
        setFeedNotification('Feed is up to date with the latest content chunk on Swarm.');
      }
    } catch (err: any) {
      setFeedNotification(`Could not resolve Swarm Feed: ${err.message}`);
    } finally {
      setRefreshingTopic(null);
      setTimeout(() => setFeedNotification(null), 5000);
    }
  };

  const handleEditArticle = (record: PublishedArticleRecord) => {
    navigate('/publish', { state: { editArticle: record.article } });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Publisher Dashboard
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              Live Swarm State
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your publishing identity, monitor Bee node connectivity, track postage batches, and inspect Swarm Feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/publish"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Article</span>
          </Link>
        </div>
      </div>

      {feedNotification && (
        <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-800 text-xs text-cyan-200 flex items-center gap-2 animate-fade-in">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{feedNotification}</span>
        </div>
      )}

      {/* Top Infrastructure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BeeStatus
          apiUrl={config.beeApiUrl}
          health={health}
          checking={checking}
          onRefresh={checkConnectivity}
          onConfigure={() => navigate('/settings')}
        />

        <PostageStatus
          batchId={config.postageBatchId}
          batchInfo={batchInfo}
          onConfigure={() => navigate('/settings')}
        />

        {identity ? (
          <FeedStatus
            owner={identity.address}
            topic={articles[0]?.feedTopic || 'freepress-default'}
            latestReference={articles[0]?.swarmReference}
            permanentReaderLink={
              articles[0]
                ? `${window.location.origin}${window.location.pathname}#/read?owner=${identity.address}&topic=${articles[0].feedTopic}`
                : undefined
            }
          />
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-200">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Signing Identity</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect or generate your sovereign publisher key to sign feed updates. Private keys are maintained in browser session memory only.
              </p>
            </div>
            <button
              onClick={onOpenKeyModal}
              className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Generate or Import Key
            </button>
          </div>
        )}
      </div>

      {/* Articles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Published Articles &amp; Feeds</h2>
            <span className="text-xs text-slate-400 font-mono">({articles.length})</span>
          </div>

          <Link
            to="/publish"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Create another</span> &rarr;
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <FileEdit className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No articles published yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ready to publish your investigative report? Write and publish your first article to Ethereum Swarm.
              </p>
            </div>
            <div>
              <Link
                to="/publish"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Write First Article</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(record => (
              <ArticleCard
                key={`${record.feedTopic}-${record.swarmReference}`}
                record={record}
                onRefresh={handleRefreshArticle}
                onEdit={handleEditArticle}
                isRefreshing={refreshingTopic === record.feedTopic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
