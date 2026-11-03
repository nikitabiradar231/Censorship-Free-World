import { describe, it, expect, vi } from 'vitest';
import { uploadArticleToSwarm } from '../services/swarmUpload';
import { Article } from '../types/article';
import * as clientModule from '../services/swarmClient';

describe('TEST 6: Swarm Content Upload', () => {
  const sampleArticle: Article = {
    id: 'divya-water-report',
    title: 'Water Contamination Investigation',
    author: 'Divya',
    category: 'Investigative',
    content: 'Lab findings confirm toxic runoff in the municipal reservoir.',
    publishedAt: new Date().toISOString(),
    version: 1,
    feedTopic: '0x' + '11'.repeat(32),
    feedOwner: '0x' + '22'.repeat(20),
  };

  it('rejects upload when postage batch ID is missing', async () => {
    await expect(
      uploadArticleToSwarm(sampleArticle, '')
    ).rejects.toThrow('Postage Batch ID is required');
  });

  it('rejects upload when postage batch ID format is invalid', async () => {
    await expect(
      uploadArticleToSwarm(sampleArticle, 'invalid-batch-id')
    ).rejects.toThrow('Invalid Postage Batch ID format');
  });

  it('uploads serialized article data to Swarm and returns valid Swarm Reference', async () => {
    const validBatch = '0123456789abcdef'.repeat(4);
    const mockRefHex = 'abcdef0123456789'.repeat(4);

    // Mock Bee client upload
    const mockBee = {
      data: {
        upload: vi.fn().mockResolvedValue({
          reference: {
            toHex: () => mockRefHex,
          },
        }),
      },
    };

    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const result = await uploadArticleToSwarm(sampleArticle, validBatch, 'http://localhost:1633');

    expect(result.swarmReference).toBe(mockRefHex);
    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(mockBee.data.upload).toHaveBeenCalledTimes(1);
  });
});

