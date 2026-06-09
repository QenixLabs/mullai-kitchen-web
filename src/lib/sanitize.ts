import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return dirty;
  return DOMPurify.sanitize(dirty);
}

const UNSAFE_PROTOCOLS = /^(javascript|data|vbscript):/i;

export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (UNSAFE_PROTOCOLS.test(trimmed)) return undefined;
  return trimmed;
}
