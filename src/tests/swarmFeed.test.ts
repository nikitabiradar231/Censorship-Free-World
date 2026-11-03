import { describe, it, expect, vi } from 'vitest';
import { deriveTopic, generatePermanentFeedLinks, updateSwarmFeed } from '../services/swarmFeed';
import { createNewPublisherIdentity } from '../services/swarmWallet';
import * as clientModule from '../services/swarmClient';

describe('TEST 2 & TEST 7: Swarm Feeds & Permanent Link Resolution', () => {
  it('generates consistent deterministic topics from string identifiers', () => {
    const topic1 = deriveTopic('divya-water-investigation');
    const topic2 = deriveTopic('divya-water-investigation');

    expect(topic1.toHex()).toBe(topic2.toHex());
    expect(topic1.toHex()).toHaveLength(64);
  });

  it('accepts exact 64-hex topics without re-hashing', () => {
    const exactHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const topic = deriveTopic(exactHex);

    expect(topic.toHex()).toBe(exactHex);
  });

  it('generates permanent feed-based links independent of database IDs or server redirects (TEST 7)', () => {
    const owner = '0x1234567890abcdef1234567890abcdef12345678';
    const topicHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const links = generatePermanentFeedLinks(owner, topicHex, 'http://localhost:1633');

    expect(links.permanentReaderLink).toContain('owner=0x1234567890abcdef1234567890abcdef12345678');
    expect(links.permanentReaderLink).toContain(`topic=0x${topicHex}`);
    expect(links.swarmProtocolLink).toBe(`bzz://1234567890abcdef1234567890abcdef12345678/${topicHex}`);
    expect(links.gatewayFeedLink).toContain(`/bzz-feed/1234567890abcdef1234567890abcdef12345678/${topicHex}/`);
  });

  it('signs feed updates on the client device using publisher private key (TEST 3)', async () => {
    const identity = createNewPublisherIdentity();
    const mockRef = 'ab'.repeat(32);
    const mockBatch = 'cd'.repeat(32);

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

    const res = await updateSwarmFeed({
      topicInput: 'divya-water-scandal',
      privateKey: identity.privateKey,
      postageBatchId: mockBatch,
      referenceHex: mockRef,
      customBeeUrl: 'http://localhost:1633',
    });

    expect(res.owner.toLowerCase()).toBe(identity.address.toLowerCase());
    expect(res.reference).toBe(mockRef);
    expect(mockBee.feed.makeWriter).toHaveBeenCalled();
    expect(mockWriter.uploadReference).toHaveBeenCalled();
  });
});
