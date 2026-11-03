import { describe, it, expect } from 'vitest';
import { checkBeeHealth } from '../services/swarmClient';
import { Bee } from '@ethersphere/bee-js';

const TEST_BEE_URL = process.env.VITE_BEE_API_URL || 'http://localhost:1633';

describe('REAL BEE NODE INTEGRATION (Live Network Audit)', () => {
  it('probes live Bee node environment and documents actual reachability status honestly', async () => {
    const health = await checkBeeHealth(TEST_BEE_URL);

    if (health.isReachable) {
      // Real Bee node is online: verify API version and mode
      expect(health.status).toBe('ok');
      expect(health.version).toBeDefined();

      const bee = new Bee(TEST_BEE_URL);
      const stamps = await bee.stamp.getAll();
      expect(Array.isArray(stamps)).toBe(true);
    } else {
      // Live Bee node is not running on local machine
      // Requirement: Do not fabricate a successful connection or fake reference.
      expect(health.status).toBe('unreachable');
      expect(health.error).toBeDefined();
    }
  });
});
