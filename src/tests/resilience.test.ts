import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePermanentFeedLinks, deriveTopic } from '../services/swarmFeed';
import { fetchArticleFromSwarm } from '../services/swarmReader';
import { saveSwarmConfig, resetSwarmConfig } from '../config/swarmConfig';
import * as clientModule from '../services/swarmClient';
import { Article } from '../types/article';

describe('PHASE 4: Critical Censorship Resilience & Gateway Failover', () => {
  beforeEach(() => {
    resetSwarmConfig();
    vi.restoreAllMocks();
  });

  const sampleArticle: Article = {
    id: 'divya-water-report',
    title: 'District Water Supply Contamination Investigation',
    subtitle: 'Municipal runoff confirmed across 14 wards',
    author: 'Divya',
    category: 'Investigative',
    content: 'Full immutable report hosted on Swarm.',
    publishedAt: new Date().toISOString(),
    version: 1,
    feedTopic: '0x' + '11'.repeat(32),
    feedOwner: '0x' + '22'.repeat(20),
  };

  it('proves permanent feed identity is mathematical and completely independent of any developer domain', () => {
    const owner = '0xfcad0b19bb29d4674531d6f115237e16afce377c';
    const topic = 'divya-water-investigation';
    const derivedTopic = deriveTopic(topic);

    // Feed identity on Host A (e.g. dev-host.com)
    const hostALinks = generatePermanentFeedLinks(owner, derivedTopic.toHex(), 'http://node-a:1633');

    // Feed identity on Host B (e.g. community-mirror.eth or localhost)
    const hostBLinks = generatePermanentFeedLinks(owner, derivedTopic.toHex(), 'http://node-b:1633');

    // The Swarm protocol address and query parameters must be IDENTICAL regardless of the hosting domain
    expect(hostALinks.swarmProtocolLink).toBe(hostBLinks.swarmProtocolLink);
    expect(hostALinks.swarmProtocolLink).toBe(`bzz://${owner.replace('0x', '')}/${derivedTopic.toHex()}`);
    expect(hostALinks.permanentReaderLink).toContain(owner);
    expect(hostBLinks.permanentReaderLink).toContain(owner);
  });

  it('fails over to public Swarm Gateway when primary Bee node is blocked or suspended (Gateway Failover)', async () => {
    const mockRef = 'aa'.repeat(32);

    // Primary Bee node fails (e.g. network partition or ISP blocking)
    const mockFailingBee = {
      data: {
        download: vi.fn().mockRejectedValue(new Error('Bee node unreachable / ISP firewall active')),
      },
    };
    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockFailingBee as any);

    // Gateway fallback fetch mock
    const mockGatewayResponse = {
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify(sampleArticle)),
    };
    const globalFetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockGatewayResponse as any);

    saveSwarmConfig({
      beeApiUrl: 'http://blocked-node:1633',
      gatewayUrl: 'https://gateway.ethswarm.org',
    });

    const result = await fetchArticleFromSwarm(mockRef, 'http://blocked-node:1633');

    expect(result.source).toBe('swarm-gateway');
    expect(result.article.title).toBe(sampleArticle.title);
    expect(globalFetchSpy).toHaveBeenCalledWith(
      `https://gateway.ethswarm.org/bzz/${mockRef}/`,
      expect.anything()
    );
  });

  it('ensures zero builder-operated domain dependencies in resolution paths', async () => {
    const mockRef = 'bb'.repeat(32);
    const mockBee = {
      data: {
        download: vi.fn().mockResolvedValue({
          toUtf8: () => JSON.stringify(sampleArticle),
        }),
      },
    };
    vi.spyOn(clientModule, 'getBeeClient').mockReturnValue(mockBee as any);

    const result = await fetchArticleFromSwarm(mockRef, 'http://localhost:1633');

    // Content retrieved directly via local Bee node
    expect(result.source).toBe('swarm-bee');
    expect(result.article.title).toBe(sampleArticle.title);
  });
});
