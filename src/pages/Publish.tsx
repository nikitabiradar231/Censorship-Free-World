import React from 'react';
import { useLocation } from 'react-router-dom';
import { PublishForm } from '../components/PublishForm';
import { useSwarmConfig } from '../hooks/useSwarmConfig';
import { useSwarmIdentity } from '../hooks/useSwarmIdentity';
import { PublishedArticleRecord, Article } from '../types/article';

interface PublishPageProps {
  onOpenKeyModal: () => void;
}

const PUBLISHED_HISTORY_KEY = 'freepress_published_articles';

export const Publish: React.FC<PublishPageProps> = ({ onOpenKeyModal }) => {
  const { config } = useSwarmConfig();
  const { identity } = useSwarmIdentity();
  const location = useLocation();

  const editArticle = (location.state as any)?.editArticle as Partial<Article> | undefined;

  const handlePublishSuccess = (record: PublishedArticleRecord) => {
    try {
      const stored = localStorage.getItem(PUBLISHED_HISTORY_KEY);
      let list: PublishedArticleRecord[] = stored ? JSON.parse(stored) : [];

      const existingIndex = list.findIndex(item => item.feedTopic === record.feedTopic);
      if (existingIndex >= 0) {
        list[existingIndex] = record;
      } else {
        list = [record, ...list];
      }

      localStorage.setItem(PUBLISHED_HISTORY_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PublishForm
        initialArticle={editArticle}
        activePrivateKey={identity?.privateKey}
        activeAddress={identity?.address}
        postageBatchId={config.postageBatchId}
        beeApiUrl={config.beeApiUrl}
        onPublishSuccess={handlePublishSuccess}
        onRequestKeySetup={onOpenKeyModal}
        isUpdating={Boolean(editArticle)}
      />
    </div>
  );
};
