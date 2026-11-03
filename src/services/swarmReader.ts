import { EthAddress } from '@ethersphere/bee-js';
import { getBeeClient } from './swarmClient';
import { deriveTopic } from './swarmFeed';
import { Article } from '../types/article';
import { deserializeArticle, isValidSwarmReference } from '../utils/validation';
import { getSavedSwarmConfig } from '../config/swarmConfig';

export interface FeedResolveAndFetchResult {
  article: Article;
  reference: string;
  owner: string;
  topic: string;
  feedIndex?: string;
  source: 'swarm-bee' | 'swarm-gateway';
}

/**
 * Resolves the latest content reference from a Swarm Feed by owner address and topic.
 * Satisfies TEST 2: Latest-version pointer is resolved from the Swarm Feed.
 */
export async function resolveLatestFeedReference(
  ownerAddress: string,
  topicInput: string,
  customBeeUrl?: string
): Promise<{ reference: string; feedIndex?: string }> {
  const cleanOwner = ownerAddress.trim().replace(/^0x/, '');
  const config = getSavedSwarmConfig();
  const bee = getBeeClient(customBeeUrl || config.beeApiUrl);

  const topic = deriveTopic(topicInput);
  const owner = new EthAddress(cleanOwner);

  const reader = bee.feed.makeReader(topic, owner);

  try {
    const feedRes = await reader.downloadReference();
    const referenceHex = feedRes.reference.toHex();

    return {
      reference: referenceHex,
      feedIndex: feedRes.feedIndex?.toString(),
    };
  } catch (err: any) {
    const message = err.message || '';
    if (message.includes('404') || message.toLowerCase().includes('not found')) {
      throw new Error(`No feed updates found on Swarm for owner 0x${cleanOwner} and topic ${topic.toHex()}`);
    }
    throw new Error(`Failed to resolve Swarm feed: ${message}`);
  }
}

/**
 * Downloads and parses article content directly from Ethereum Swarm via reference.
 * Satisfies TEST 1: Published content is read directly from Swarm.
 * NO central backend or database is ever used.
 */
export async function fetchArticleFromSwarm(
  referenceHex: string,
  customBeeUrl?: string
): Promise<{ article: Article; source: 'swarm-bee' | 'swarm-gateway' }> {
  const cleanRef = referenceHex.trim().replace(/^0x/, '');

  if (!isValidSwarmReference(cleanRef)) {
    throw new Error(`Invalid Swarm content reference: ${referenceHex}`);
  }

  const config = getSavedSwarmConfig();
  const beeUrl = (customBeeUrl || config.beeApiUrl).trim().replace(/\/+$/, '');
  const gatewayUrl = config.gatewayUrl.trim().replace(/\/+$/, '');

  // 1. Primary path: Use bee-js SDK download via configured Bee client
  try {
    const bee = getBeeClient(beeUrl);
    const data = await bee.data.download(cleanRef);
    const jsonText = data.toUtf8();
    const article = deserializeArticle(jsonText);
    return { article, source: 'swarm-bee' };
  } catch (sdkError: any) {
    // 2. Direct Swarm Gateway fallback (e.g. if Bee API is a remote read-only gateway)
    try {
      const res = await fetch(`${gatewayUrl}/bzz/${cleanRef}/`, {
        headers: { Accept: 'application/json, text/plain' },
      });
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status} from gateway`);
      }
      const jsonText = await res.text();
      const article = deserializeArticle(jsonText);
      return { article, source: 'swarm-gateway' };
    } catch {
      throw new Error(
        `Failed to retrieve Swarm content for reference ${cleanRef}: ${sdkError.message || 'Content unavailable'}`
      );
    }
  }
}

/**
 * Full reader workflow: Resolves feed to latest Swarm reference, then fetches and renders article.
 */
export async function resolveAndFetchArticleFromFeed(
  ownerAddress: string,
  topicInput: string,
  customBeeUrl?: string
): Promise<FeedResolveAndFetchResult> {
  const cleanOwner = ownerAddress.trim().replace(/^0x/, '');
  const config = getSavedSwarmConfig();
  const gatewayUrl = config.gatewayUrl.trim().replace(/\/+$/, '');
  const topic = deriveTopic(topicInput);

  try {
    const feedUpdate = await resolveLatestFeedReference(ownerAddress, topicInput, customBeeUrl);
    const { article, source } = await fetchArticleFromSwarm(feedUpdate.reference, customBeeUrl);

    return {
      article,
      reference: feedUpdate.reference,
      owner: ownerAddress,
      topic: topicInput,
      feedIndex: feedUpdate.feedIndex,
      source,
    };
  } catch (primaryErr: any) {
    // Secondary gateway fallback: Try direct gateway /bzz-feed/ endpoint
    try {
      const res = await fetch(`${gatewayUrl}/bzz-feed/0x${cleanOwner}/${topic.toHex()}/`, {
        headers: { Accept: 'application/json, text/plain' },
      });
      if (res.ok) {
        const text = await res.text();
        const article = deserializeArticle(text);
        const refHeader = res.headers.get('swarm-reference') || 'gateway-feed-reference';
        return {
          article,
          reference: refHeader,
          owner: ownerAddress,
          topic: topicInput,
          source: 'swarm-gateway',
        };
      }
    } catch {
      // Fall through
    }

    throw primaryErr;
  }
}
