export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  category: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  updatedAt?: string;
  version: number;
  feedTopic: string;
  feedOwner: string;
  previousReference?: string;
}

export interface PublishedArticleRecord {
  article: Article;
  swarmReference: string;
  feedTopic: string;
  feedOwner: string;
  feedManifestReference?: string;
  publishedAt: string;
  status: 'published' | 'draft';
}

export interface ArticleDraft {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  content: string;
  coverImage: string;
  savedAt: string;
}
