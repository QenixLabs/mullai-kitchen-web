 const FALLBACK_API_URL = "http://localhost:3001/v1";
// const FALLBACK_API_URL = "https://wkwb7vc0-5001.inc1.devtunnels.ms/v1";
//NEED TO CHNAGE THIS URL TO THE DEPLOYED API URL BEFORE DEPLOYING THE FRONTEND
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_URL;
}
