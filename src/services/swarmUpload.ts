import { getBeeClient } from './swarmClient';
import { Article } from '../types/article';
import { serializeArticle, isValidPostageBatchId, isValidSwarmReference, validateArticle } from '../utils/validation';
import { getSavedSwarmConfig } from '../config/swarmConfig';

export interface UploadResult {
  swarmReference: string;
  article: Article;
  sizeBytes: number;
  uploadedAt: string;
}

/**
 * Uploads an article JSON payload directly to Ethereum Swarm using the configured Bee node.
 * Satisfies TEST 6: Content is uploaded to Swarm with a valid postage batch.
 */
export async function uploadArticleToSwarm(
  article: Article,
  postageBatchId?: string,
  customBeeUrl?: string
): Promise<UploadResult> {
  const config = getSavedSwarmConfig();
  const batchId = (postageBatchId || config.postageBatchId).trim().replace(/^0x/, '');

  if (!batchId) {
    throw new Error('Postage Batch ID is required to upload content to Swarm. Please configure one in Settings.');
  }

  if (!isValidPostageBatchId(batchId)) {
    throw new Error('Invalid Postage Batch ID format. Must be a 64-character hexadecimal string.');
  }

  const validationErrors = validateArticle(article);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
  }

  const serializedData = serializeArticle(article);
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(serializedData);

  const bee = getBeeClient(customBeeUrl || config.beeApiUrl);

  try {
    const uploadRes = await bee.data.upload(batchId, dataBytes);
    const refHex = uploadRes.reference.toHex();

    if (!isValidSwarmReference(refHex)) {
      throw new Error(`Bee returned an unexpected Swarm reference format: ${refHex}`);
    }

    return {
      swarmReference: refHex,
      article,
      sizeBytes: dataBytes.length,
      uploadedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    const msg = err.message || 'Swarm upload failed';
    if (msg.includes('batch') || msg.includes('400') || msg.includes('not found')) {
      throw new Error(`Swarm Postage Batch Error: ${msg}. Verify your postage batch ID and balance.`);
    }
    if (msg.includes('Failed to fetch') || msg.includes('ECONNREFUSED')) {
      throw new Error(`Bee Node Unreachable at ${customBeeUrl || config.beeApiUrl}. Please ensure your Bee node is running and CORS is enabled.`);
    }
    throw new Error(`Upload to Swarm failed: ${msg}`);
  }
}

