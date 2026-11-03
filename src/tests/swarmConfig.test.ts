import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedSwarmConfig,
  saveSwarmConfig,
  resetSwarmConfig,
  DEFAULT_BEE_API_URL,
} from '../config/swarmConfig';
import { getBeeClient } from '../services/swarmClient';

describe('TEST 5: Configurable Bee Node & Gateway URL', () => {
  beforeEach(() => {
    resetSwarmConfig();
  });

  it('provides default development configuration when unconfigured', () => {
    const config = getSavedSwarmConfig();
    expect(config.beeApiUrl).toBe(DEFAULT_BEE_API_URL);
    expect(config.gatewayUrl).toBe('http://localhost:1633');
  });

  it('allows user to customize and persist Bee API and Gateway URLs', () => {
    const customBee = 'http://192.168.1.50:1633';
    const customGw = 'https://custom-gateway.ethswarm.org';
    const customBatch = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    saveSwarmConfig({
      beeApiUrl: customBee,
      gatewayUrl: customGw,
      postageBatchId: customBatch,
    });

    const updated = getSavedSwarmConfig();
    expect(updated.beeApiUrl).toBe(customBee);
    expect(updated.gatewayUrl).toBe(customGw);
    expect(updated.postageBatchId).toBe(customBatch);
  });

  it('constructs Bee clients dynamically using configurable target URLs', () => {
    const customUrl = 'http://remote-bee-node:1633';
    const client = getBeeClient(customUrl);

    expect(client).toBeDefined();
    expect(client.url).toBe(customUrl);
  });

  it('never hardcodes unchangeable Bee hosts across operations', () => {
    const client1 = getBeeClient('http://node-alpha:1633');
    const client2 = getBeeClient('http://node-beta:1633');

    expect(client1.url).toBe('http://node-alpha:1633');
    expect(client2.url).toBe('http://node-beta:1633');
  });
});

