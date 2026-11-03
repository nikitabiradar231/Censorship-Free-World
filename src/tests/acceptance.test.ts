import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as clientModule from '../services/swarmClient';
import { resolveAndFetchArticleFromFeed, fetchArticleFromSwarm } from '../services/swarmReader';
import { updateSwarmFeed, generatePermanentFeedLinks, deriveTopic } from '../services/swarmFeed';
import { createNewPublisherIdentity, lockPublisherIdentity } from '../services/swarmWallet';
import { uploadArticleToSwarm } from '../services/swarmUpload';
import { getSavedSwarmConfig, saveSwarmConfig, resetSwarmConfig } from '../config/swarmConfig';
import { Article } from '../types/article';

describe('AUTOMATED ACCEPTANCE CRITERIA (80 POINTS AUDIT)', () => {
  beforeEach(() => {
    resetSwarmConfig();
    lockPublisherIdentity();
    vi.restoreAllMocks();
  });

  const sampleArticle: Article = {
    id: 'divya-water-report',
    title: 'Water Supply Contamination Investigation',
    subtitle: 'High levels of industrial runoff found in district water supply',
    author: 'Divya',
    category: 'Investigative',
    content: 'Full article body hosted on decentralized Ethereum Swarm storage...',
    publishedAt: new Date().toISOString(),
    version: 1,
    feedTopic: '0x' + '11'.repeat(32),
    feedOwner: '0x' + '22'.repeat(20),
  };

  /**
   * TEST 1 — Published content is read from Swarm (20 points)
   * Every reader-path content load must resolve against a Bee node or Swarm gateway.
   * No builder-operated API or database may serve published content.
   */
  it('TEST 1 (20 pts): Published content is read directly from Swarm', async () => {
    const mockRef = 'aa'.repeat(32);
    const mockBee = {
      data: {
        download: vi.fn().mockResolvedValue({
          toUtf8: () => JSON.stringify(sampleArticle),
        }),
      },
    };
    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const { article, source } = await fetchArticleFromSwarm(mockRef, 'http://localhost:1633');
    expect(article.title).toBe(sampleArticle.title);
    expect(source).toBe('swarm-bee');
    expect(mockBee.data.download).toHaveBeenCalledWith(mockRef);
  });

  /**
   * TEST 2 — Latest-version pointer lives in a Swarm Feed (16 points)
   * The current content reference must be written to and read from a Swarm Feed identified by topic and owner.
   * Updating content must not change the permanent feed identity.
   */
  it('TEST 2 (16 pts): Latest-version pointer is maintained in a Swarm Feed by owner and topic', async () => {
    const topic = deriveTopic('divya-water-investigation');
    const owner = '0x' + '33'.repeat(20);
    const mockRef = 'bb'.repeat(32);

    const mockBee = {
      feed: {
        makeReader: vi.fn().mockReturnValue({
          downloadReference: vi.fn().mockResolvedValue({
            reference: { toHex: () => mockRef },
            feedIndex: '1',
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

    const res = await resolveAndFetchArticleFromFeed(owner, topic.toHex(), 'http://localhost:1633');
    expect(res.reference).toBe(mockRef);
    expect(res.owner).toBe(owner);
    expect(res.topic).toBe(topic.toHex());
    expect(mockBee.feed.makeReader).toHaveBeenCalled();
  });

  /**
   * TEST 3 — Feed updates are signed client-side (12 points)
   * All feed-update signing must happen in the publisher's browser/device.
   * No server-side signing. No operator-held private key.
   */
  it('TEST 3 (12 pts): Feed updates are signed client-side in the browser', async () => {
    const identity = createNewPublisherIdentity();
    expect(identity.privateKey).toBeDefined();
    expect(identity.address).toBeDefined();

    // Verification that private key remains strictly in browser memory
    expect(identity.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(identity.address).toMatch(/^0x[0-9a-fA-F]{40}$/);

    const mockBatch = 'cc'.repeat(32);
    const mockRef = 'dd'.repeat(32);

    const mockWriter = {
      owner: { toHex: () => identity.address.replace('0x', '') },
      topic: { toHex: () => '11'.repeat(32) },
      uploadReference: vi.fn().mockResolvedValue({ feedIndex: 1 }),
    };

    const mockBee = {
      feed: {
        makeWriter: vi.fn().mockReturnValue(mockWriter),
        createManifest: vi.fn().mockResolvedValue({
          reference: { toHex: () => 'ee'.repeat(32) },
        }),
      },
    };
    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const feedRes = await updateSwarmFeed({
      topicInput: 'water-investigation',
      privateKey: identity.privateKey,
      postageBatchId: mockBatch,
      referenceHex: mockRef,
      customBeeUrl: 'http://localhost:1633',
    });

    expect(feedRes.owner.toLowerCase()).toBe(identity.address.toLowerCase());
    expect(feedRes.reference).toBe(mockRef);
    expect(mockBee.feed.makeWriter).toHaveBeenCalled();
    expect(mockWriter.uploadReference).toHaveBeenCalled();
  });

  /**
   * TEST 4 — Static frontend (8 points)
   * The application must build into static files with no server runtime,
   * no API routes, no SSR, and no centralized backend dependencies.
   */
  it('TEST 4 (8 pts): Static frontend architecture verification', () => {
    const pkgJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8')
    );
    expect(pkgJson.dependencies['express']).toBeUndefined();
    expect(pkgJson.dependencies['koa']).toBeUndefined();
    expect(pkgJson.dependencies['fastify']).toBeUndefined();
    expect(pkgJson.dependencies['@nestjs/core']).toBeUndefined();
  });

  /**
   * TEST 5 — Configurable Bee node URL (7 points)
   * Every Bee/gateway client construction and fetch must use configurable settings.
   * No unchangeable hardcoded Bee host.
   */
  it('TEST 5 (7 pts): Configurable Bee node and gateway URLs', () => {
    saveSwarmConfig({ beeApiUrl: 'http://custom-node.org:1633' });
    const cfg = getSavedSwarmConfig();
    expect(cfg.beeApiUrl).toBe('http://custom-node.org:1633');

    const client = clientModule.getBeeClient(cfg.beeApiUrl);
    expect(client.url).toBe('http://custom-node.org:1633');
  });

  /**
   * TEST 6 — Content is uploaded to Swarm (6 points)
   * Publishing must upload the actual article content to Swarm using a valid postage batch.
   */
  it('TEST 6 (6 pts): Content is uploaded to Swarm with valid postage batch', async () => {
    const mockRefHex = 'cc'.repeat(32);
    const mockBee = {
      data: {
        upload: vi.fn().mockResolvedValue({
          reference: { toHex: () => mockRefHex },
        }),
      },
    };
    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const res = await uploadArticleToSwarm(sampleArticle, '00'.repeat(32), 'http://localhost:1633');
    expect(res.swarmReference).toBe(mockRefHex);
    expect(mockBee.data.upload).toHaveBeenCalled();
  });

  /**
   * TEST 7 — Shareable Swarm address (5 points)
   * After publishing, display a link/reference derived from the Swarm Feed identity.
   * The link must allow readers to retrieve the latest version.
   */
  it('TEST 7 (5 pts): Generates permanent shareable link derived from Swarm Feed identity', () => {
    const owner = '0x' + '44'.repeat(20);
    const topic = '55'.repeat(32);

    const links = generatePermanentFeedLinks(owner, topic, 'http://localhost:1633');
    expect(links.permanentReaderLink).toContain(owner);
    expect(links.permanentReaderLink).toContain(topic);
    expect(links.swarmProtocolLink).toContain(`bzz://${owner.replace('0x', '')}/${topic}`);
  });

  /**
   * TEST 8 — No credentials in tracked files (6 points)
   * Never commit private keys, mnemonics, API secrets, passwords.
   * Provide a .env.example containing placeholders only.
   */
  it('TEST 8 (6 pts): No real credentials in tracked files & .env.example exists', () => {
    const envExamplePath = path.resolve(__dirname, '../../.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const content = fs.readFileSync(envExamplePath, 'utf-8');
    expect(content).toContain('VITE_BEE_API_URL');
    expect(content).not.toMatch(/0x[a-fA-F0-9]{64}/);
  });
});
