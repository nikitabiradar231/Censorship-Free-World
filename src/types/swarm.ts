export interface SwarmConfig {
  beeApiUrl: string;
  gatewayUrl: string;
  postageBatchId: string;
}

export interface PostageBatchInfo {
  batchId: string;
  usable: boolean;
  utilization: number;
  depth: number;
  bucketDepth: number;
  blockNumber: number;
  immutable: boolean;
  duration?: number;
  exists: boolean;
  errorMessage?: string;
}

export interface PublisherIdentity {
  address: string;
  privateKey: string;
  isUnlocked: boolean;
}

export interface FeedResolutionResult {
  reference: string;
  feedIndex?: string;
  feedIndexNext?: string;
  owner: string;
  topic: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'unreachable';
  version?: string;
  beeMode?: string;
  isReachable: boolean;
  checkedAt: number;
  error?: string;
}
