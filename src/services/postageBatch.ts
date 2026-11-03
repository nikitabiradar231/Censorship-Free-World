import { getBeeClient } from './swarmClient';
import { PostageBatchInfo } from '../types/swarm';
import { isValidPostageBatchId } from '../utils/validation';

/**
 * Fetches and validates a specific Swarm postage stamp batch.
 */
export async function getPostageBatch(
  batchId: string,
  customBeeUrl?: string
): Promise<PostageBatchInfo> {
  const cleanId = batchId.trim().replace(/^0x/, '');

  if (!isValidPostageBatchId(cleanId)) {
    return {
      batchId: cleanId,
      usable: false,
      utilization: 0,
      depth: 0,
      bucketDepth: 0,
      blockNumber: 0,
      immutable: false,
      exists: false,
      errorMessage: 'Invalid Postage Batch ID format. Must be a 64-character hexadecimal string.',
    };
  }

  try {
    const bee = getBeeClient(customBeeUrl);
    const batch = await bee.stamp.get(cleanId);

    return {
      batchId: cleanId,
      usable: Boolean(batch.usable),
      utilization: typeof batch.utilization === 'number' ? batch.utilization : 0,
      depth: batch.depth ?? 16,
      bucketDepth: batch.bucketDepth ?? 16,
      blockNumber: batch.blockNumber ?? 0,
      immutable: Boolean(batch.immutableFlag),
      duration: (batch as any).duration,
      exists: true,
    };
  } catch (err: any) {
    const message = err.message || 'Failed to fetch postage batch';
    const isNotFound = message.includes('404') || message.toLowerCase().includes('not found');

    return {
      batchId: cleanId,
      usable: false,
      utilization: 0,
      depth: 0,
      bucketDepth: 0,
      blockNumber: 0,
      immutable: false,
      exists: false,
      errorMessage: isNotFound
        ? 'Postage batch not found on the configured Bee node.'
        : `Error checking postage batch: ${message}`,
    };
  }
}

/**
 * Fetches all postage batches available on the connected Bee node.
 */
export async function getAllPostageBatches(customBeeUrl?: string): Promise<PostageBatchInfo[]> {
  try {
    const bee = getBeeClient(customBeeUrl);
    const res = await bee.stamp.getAll();
    const batches = Array.isArray(res) ? res : (res as any).stamps || [];

    return batches.map((b: any) => ({
      batchId: b.batchID?.toHex ? b.batchID.toHex() : String(b.batchID || b.id || ''),
      usable: Boolean(b.usable),
      utilization: typeof b.utilization === 'number' ? b.utilization : 0,
      depth: b.depth ?? 16,
      bucketDepth: b.bucketDepth ?? 16,
      blockNumber: b.blockNumber ?? 0,
      immutable: Boolean(b.immutableFlag),
      duration: b.duration,
      exists: true,
    }));
  } catch {
    return [];
  }
}

