const FALLBACK_API_URL = "http://localhost:3001/v1";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_URL;
}
