import { describe, it, expect } from 'vitest';
import {
  isValidSwarmReference,
  isValidPostageBatchId,
  isValidEthAddress,
  isValidUrl,
  validateArticle,
  serializeArticle,
  deserializeArticle,
} from '../utils/validation';
import { Article } from '../types/article';

describe('Validation & Serialization Utilities', () => {
  const validArticle: Article = {
    id: 'divya-water-report',
    title: 'District Water Supply Contamination Investigation',
    subtitle: '14 municipal wards show chemical levels exceeding safety limits',
    author: 'Divya',
    category: 'Investigative',
    content: 'Full investigative article text on Swarm storage...',
    publishedAt: new Date().toISOString(),
    version: 1,
    feedTopic: '0x' + '11'.repeat(32),
    feedOwner: '0x' + '22'.repeat(20),
  };

  it('validates correct article payloads', () => {
    const errors = validateArticle(validArticle);
    expect(errors).toHaveLength(0);
  });

  it('flags missing required fields', () => {
    const errors = validateArticle({
      title: '',
      author: '',
      content: '',
      category: '',
    });
    expect(errors.length).toBeGreaterThanOrEqual(4);
    expect(errors.some(e => e.field === 'title')).toBe(true);
    expect(errors.some(e => e.field === 'author')).toBe(true);
    expect(errors.some(e => e.field === 'content')).toBe(true);
    expect(errors.some(e => e.field === 'category')).toBe(true);
  });

  it('serializes and deserializes articles accurately', () => {
    const json = serializeArticle(validArticle);
    expect(typeof json).toBe('string');
    const parsed = deserializeArticle(json);
    expect(parsed.title).toBe(validArticle.title);
    expect(parsed.content).toBe(validArticle.content);
    expect(parsed.author).toBe(validArticle.author);
  });

  it('validates 64-character and 128-character Swarm references', () => {
    const valid64 = 'a'.repeat(64);
    const valid128 = 'f'.repeat(128);
    const invalidShort = 'a'.repeat(63);
    const invalidChars = 'g'.repeat(64);

    expect(isValidSwarmReference(valid64)).toBe(true);
    expect(isValidSwarmReference(`0x${valid64}`)).toBe(true);
    expect(isValidSwarmReference(valid128)).toBe(true);
    expect(isValidSwarmReference(invalidShort)).toBe(false);
    expect(isValidSwarmReference(invalidChars)).toBe(false);
    expect(isValidSwarmReference(null)).toBe(false);
  });

  it('validates 64-character postage batch identifiers', () => {
    const validBatch = '0123456789abcdef'.repeat(4);
    const invalidBatch = '0123456789abcdef';

    expect(isValidPostageBatchId(validBatch)).toBe(true);
    expect(isValidPostageBatchId(`0x${validBatch}`)).toBe(true);
    expect(isValidPostageBatchId(invalidBatch)).toBe(false);
    expect(isValidPostageBatchId('')).toBe(false);
  });

  it('validates Ethereum addresses', () => {
    const validAddr = '0x' + 'ab'.repeat(20);
    const validNoPrefix = 'ab'.repeat(20);
    const invalidAddr = '0x123';

    expect(isValidEthAddress(validAddr)).toBe(true);
    expect(isValidEthAddress(validNoPrefix)).toBe(true);
    expect(isValidEthAddress(invalidAddr)).toBe(false);
  });

  it('validates HTTP and HTTPS URLs', () => {
    expect(isValidUrl('http://localhost:1633')).toBe(true);
    expect(isValidUrl('https://gateway.ethswarm.org')).toBe(true);
    expect(isValidUrl('ftp://localhost:1633')).toBe(false);
    expect(isValidUrl('invalid-url')).toBe(false);
  });
});
