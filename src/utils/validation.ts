import { Article } from '../types/article';

export function isValidSwarmReference(ref: string | null | undefined): boolean {
  if (!ref || typeof ref !== 'string') return false;
  const clean = ref.trim().toLowerCase().replace(/^0x/, '');
  // Standard Swarm reference is 64 hex chars (32 bytes) or 128 hex chars (64 bytes for encrypted reference)
  return (clean.length === 64 || clean.length === 128) && /^[0-9a-f]+$/.test(clean);
}

export function isValidPostageBatchId(batchId: string | null | undefined): boolean {
  if (!batchId || typeof batchId !== 'string') return false;
  const clean = batchId.trim().toLowerCase().replace(/^0x/, '');
  return clean.length === 64 && /^[0-9a-f]+$/.test(clean);
}

export function isValidEthAddress(address: string | null | undefined): boolean {
  if (!address || typeof address !== 'string') return false;
  const clean = address.trim().toLowerCase().replace(/^0x/, '');
  return clean.length === 40 && /^[0-9a-f]+$/.test(clean);
}

export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface ArticleValidationError {
  field: string;
  message: string;
}

export function validateArticle(article: Partial<Article>): ArticleValidationError[] {
  const errors: ArticleValidationError[] = [];

  if (!article.title || article.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Article title is required' });
  } else if (article.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Article title must be under 200 characters' });
  }

  if (!article.author || article.author.trim().length === 0) {
    errors.push({ field: 'author', message: 'Author name is required' });
  }

  if (!article.content || article.content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Article content cannot be empty' });
  }

  if (!article.category || article.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  return errors;
}

export function serializeArticle(article: Article): string {
  return JSON.stringify(article, null, 2);
}

export function deserializeArticle(jsonString: string): Article {
  const parsed = JSON.parse(jsonString);
  if (!parsed.title || !parsed.content) {
    throw new Error('Invalid article payload: missing title or content');
  }
  return parsed as Article;
}

