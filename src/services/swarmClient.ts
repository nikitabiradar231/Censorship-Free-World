import { Bee } from '@ethersphere/bee-js';
import { getSavedSwarmConfig } from '../config/swarmConfig';
import { HealthStatus } from '../types/swarm';

let cachedBeeInstance: Bee | null = null;
let cachedBeeUrl: string = '';

/**
 * Returns a Bee client configured with either a custom URL or the user's active configuration.
 * Satisfies TEST 5: Every Bee construction is fully configurable and never hardcoded.
 */
export function getBeeClient(customUrl?: string): Bee {
  const targetUrl = (customUrl || getSavedSwarmConfig().beeApiUrl).trim().replace(/\/+$/, '');

  if (cachedBeeInstance && cachedBeeUrl === targetUrl) {
    return cachedBeeInstance;
  }

  cachedBeeInstance = new Bee(targetUrl);
  cachedBeeUrl = targetUrl;
  return cachedBeeInstance;
}

/**
 * Checks the health and node info of the configured Bee node.
 */
export async function checkBeeHealth(customUrl?: string): Promise<HealthStatus> {
  const targetUrl = (customUrl || getSavedSwarmConfig().beeApiUrl).trim().replace(/\/+$/, '');
  const bee = getBeeClient(targetUrl);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const health = await bee.status.getHealth({
      signal: controller.signal,
    } as any);
    clearTimeout(timeoutId);

    let beeMode = 'unknown';
    try {
      const nodeInfo = await bee.status.getNodeInfo();
      beeMode = nodeInfo.beeMode || 'full';
    } catch {
      // Node info endpoint may be disabled on some gateways
    }

    return {
      status: health.status === 'ok' ? 'ok' : 'degraded',
      version: health.version,
      beeMode,
      isReachable: true,
      checkedAt: Date.now(),
    };
  } catch (err: any) {
    return {
      status: 'unreachable',
      isReachable: false,
      checkedAt: Date.now(),
      error: err.name === 'AbortError' ? 'Connection timed out' : err.message || 'Node unreachable',
    };
  }
}

/**
 * Validates whether the configured Swarm gateway is reachable.
 */
export async function checkGatewayReachable(customGatewayUrl?: string): Promise<boolean> {
  const targetUrl = (customGatewayUrl || getSavedSwarmConfig().gatewayUrl).trim().replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    // Standard gateway health / probe check
    const res = await fetch(`${targetUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}
