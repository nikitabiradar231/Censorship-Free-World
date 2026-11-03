import { SwarmConfig } from '../types/swarm';

const STORAGE_KEY = 'freepress_swarm_config';

export const DEFAULT_BEE_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BEE_API_URL) ||
  'http://localhost:1633';

export const DEFAULT_GATEWAY_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GATEWAY_URL) ||
  'http://localhost:1633';

export const DEFAULT_POSTAGE_BATCH_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POSTAGE_BATCH_ID) ||
  '';

export function getSavedSwarmConfig(): SwarmConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        beeApiUrl: (parsed.beeApiUrl || DEFAULT_BEE_API_URL).trim().replace(/\/+$/, ''),
        gatewayUrl: (parsed.gatewayUrl || DEFAULT_GATEWAY_URL).trim().replace(/\/+$/, ''),
        postageBatchId: (parsed.postageBatchId || DEFAULT_POSTAGE_BATCH_ID).trim(),
      };
    }
  } catch {
    // Fallback if localStorage unavailable
  }

  return {
    beeApiUrl: DEFAULT_BEE_API_URL.replace(/\/+$/, ''),
    gatewayUrl: DEFAULT_GATEWAY_URL.replace(/\/+$/, ''),
    postageBatchId: DEFAULT_POSTAGE_BATCH_ID,
  };
}

export function saveSwarmConfig(config: Partial<SwarmConfig>): SwarmConfig {
  const current = getSavedSwarmConfig();
  const updated: SwarmConfig = {
    beeApiUrl: (config.beeApiUrl !== undefined ? config.beeApiUrl : current.beeApiUrl).trim().replace(/\/+$/, ''),
    gatewayUrl: (config.gatewayUrl !== undefined ? config.gatewayUrl : current.gatewayUrl).trim().replace(/\/+$/, ''),
    postageBatchId: (config.postageBatchId !== undefined ? config.postageBatchId : current.postageBatchId).trim(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save Swarm config to localStorage', err);
  }

  return updated;
}

export function resetSwarmConfig(): SwarmConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return {
    beeApiUrl: DEFAULT_BEE_API_URL,
    gatewayUrl: DEFAULT_GATEWAY_URL,
    postageBatchId: DEFAULT_POSTAGE_BATCH_ID,
  };
}
