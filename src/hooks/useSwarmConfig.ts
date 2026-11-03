import { useState, useEffect, useCallback } from 'react';
import { SwarmConfig, HealthStatus, PostageBatchInfo } from '../types/swarm';
import { getSavedSwarmConfig, saveSwarmConfig, resetSwarmConfig } from '../config/swarmConfig';
import { checkBeeHealth, checkGatewayReachable } from '../services/swarmClient';
import { getPostageBatch } from '../services/postageBatch';

export function useSwarmConfig() {
  const [config, setConfig] = useState<SwarmConfig>(getSavedSwarmConfig);
  const [health, setHealth] = useState<HealthStatus>({
    status: 'unreachable',
    isReachable: false,
    checkedAt: 0,
  });
  const [gatewayReachable, setGatewayReachable] = useState<boolean | null>(null);
  const [batchInfo, setBatchInfo] = useState<PostageBatchInfo | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  const checkConnectivity = useCallback(async () => {
    setChecking(true);
    try {
      const [beeHealth, gwOk] = await Promise.all([
        checkBeeHealth(config.beeApiUrl),
        checkGatewayReachable(config.gatewayUrl),
      ]);
      setHealth(beeHealth);
      setGatewayReachable(gwOk);

      if (config.postageBatchId && beeHealth.isReachable) {
        const batch = await getPostageBatch(config.postageBatchId, config.beeApiUrl);
        setBatchInfo(batch);
      } else {
        setBatchInfo(null);
      }
    } finally {
      setChecking(false);
    }
  }, [config.beeApiUrl, config.gatewayUrl, config.postageBatchId]);

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  const updateConfig = (newConfig: Partial<SwarmConfig>) => {
    const saved = saveSwarmConfig(newConfig);
    setConfig(saved);
  };

  const resetToDefault = () => {
    const res = resetSwarmConfig();
    setConfig(res);
  };

  return {
    config,
    health,
    gatewayReachable,
    batchInfo,
    checking,
    checkConnectivity,
    updateConfig,
    resetToDefault,
  };
}

