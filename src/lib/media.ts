import { getApiBaseUrl } from '@/lib/env';

export function getMediaUrl(filename: string): string {
  const baseUrl = getApiBaseUrl().replace(/\/v1$/, '');
  return `${baseUrl}/media/${filename}`;
}
