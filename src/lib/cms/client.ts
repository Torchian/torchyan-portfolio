import { createClient, type SanityClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01';

export const isSanityConfigured = Boolean(projectId);

let _client: SanityClient | null = null;
let _previewClient: SanityClient | null = null;

function createSanityClient(preview = false): SanityClient | null {
  if (!projectId) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !preview,
    ...(preview && {
      token: process.env.SANITY_API_TOKEN,
      perspective: 'previewDrafts' as const,
    }),
  });
}

export function getClient(preview = false): SanityClient | null {
  if (!isSanityConfigured) return null;

  if (preview) {
    if (!_previewClient) _previewClient = createSanityClient(true);
    return _previewClient;
  }

  if (!_client) _client = createSanityClient(false);
  return _client;
}
