import { describe, it, expect, vi } from 'vitest';
import {
  resolveLatestFeedReference,
  fetchArticleFromSwarm,
  resolveAndFetchArticleFromFeed,
} from '../services/swarmReader';
import * as clientModule from '../services/swarmClient';
import { Article } from '../types/article';

describe('TEST 1 & TEST 2: Swarm Content Reader & Feed Resolution', () => {
  const sampleArticle: Article = {
    id: 'divya-water-report',
    title: 'Water Scandal Part 2',
    author: 'Divya',
    category: 'Investigative',
    content: 'Follow-up reporting after local threats.',
    publishedAt: new Date().toISOString(),
    version: 2,
    feedTopic: '0x' + '11'.repeat(32),
    feedOwner: '0x' + '22'.repeat(20),
  };

  it('resolves latest content reference directly from Swarm Feed (TEST 2)', async () => {
    const owner = '0x' + 'aa'.repeat(20);
    const topic = '0x' + 'bb'.repeat(32);
    const mockRefHex = 'cc'.repeat(32);

    const mockBee = {
      feed: {
        makeReader: vi.fn().mockReturnValue({
          downloadReference: vi.fn().mockResolvedValue({
            reference: { toHex: () => mockRefHex },
            feedIndex: '5',
          }),
        }),
      },
    };

    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const result = await resolveLatestFeedReference(owner, topic, 'http://localhost:1633');

    expect(result.reference).toBe(mockRefHex);
    expect(result.feedIndex).toBe('5');
    expect(mockBee.feed.makeReader).toHaveBeenCalledTimes(1);
  });

  it('downloads published content directly from Swarm via Reference (TEST 1)', async () => {
    const mockRefHex = 'dd'.repeat(32);

    const mockBee = {
      data: {
        download: vi.fn().mockResolvedValue({
          toUtf8: () => JSON.stringify(sampleArticle),
        }),
      },
    };

    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const { article, source } = await fetchArticleFromSwarm(mockRefHex, 'http://localhost:1633');

    expect(article.title).toBe(sampleArticle.title);
    expect(article.author).toBe('Divya');
    expect(source).toBe('swarm-bee');
  });

  it('performs end-to-end reader resolution: Feed -> Reference -> Article Content', async () => {
    const owner = '0x' + 'ee'.repeat(20);
    const topic = 'divya-water-scandal';
    const mockRefHex = 'ff'.repeat(32);

    const mockBee = {
      feed: {
        makeReader: vi.fn().mockReturnValue({
          downloadReference: vi.fn().mockResolvedValue({
            reference: { toHex: () => mockRefHex },
            feedIndex: '3',
          }),
        }),
      },
      data: {
        download: vi.fn().mockResolvedValue({
          toUtf8: () => JSON.stringify(sampleArticle),
        }),
      },
    };

    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const res = await resolveAndFetchArticleFromFeed(owner, topic, 'http://localhost:1633');

    expect(res.article.title).toBe(sampleArticle.title);
    expect(res.reference).toBe(mockRefHex);
    expect(res.feedIndex).toBe('3');
  });
});

