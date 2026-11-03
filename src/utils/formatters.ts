export function shortenHash(hash: string | undefined | null, lead = 6, tail = 4): string {
  if (!hash) return '';
  const str = hash.trim();
  if (str.length <= lead + tail) return str;
  return `${str.slice(0, lead)}...${str.slice(-tail)}`;
}

export function formatDate(isoString: string | undefined | null): string {
  if (!isoString) return 'Unknown date';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function calculateReadingTime(text: string | undefined | null): string {
  if (!text) return '1 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function topicStringToIdentifier(title: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 32);
  return clean || 'freepress-default';
}

