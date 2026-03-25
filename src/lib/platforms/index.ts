import { Platform, PlatformMetrics } from '@/types';
import { fetchTwitterMetrics } from './twitter';
import { fetchFacebookMetrics, fetchInstagramMetrics } from './meta';
import { fetchYouTubeMetrics } from './youtube';
import { fetchTikTokMetrics } from './tiktok';
import { fetchLinkedInMetrics } from './linkedin';

/**
 * Main entry point for fetching platform metrics
 *
 * Routes to the appropriate platform-specific service based on the platform parameter.
 * All API calls are wrapped in error handling - returns null if any error occurs.
 *
 * @param platform - The social media platform to fetch metrics for
 * @param handleOrUrl - The profile handle or URL (supports various formats per platform)
 * @returns PlatformMetrics if successful, null if API fails or platform is unsupported
 *
 * @example
 * // Fetch Twitter metrics using handle
 * const metrics = await fetchPlatformMetrics('twitter', '@elonmusk');
 *
 * @example
 * // Fetch YouTube metrics using channel URL
 * const metrics = await fetchPlatformMetrics('youtube', 'https://youtube.com/@MrBeast');
 *
 * @example
 * // Fetch Instagram metrics using username
 * const metrics = await fetchPlatformMetrics('instagram', 'instagram');
 */
export async function fetchPlatformMetrics(
  platform: Platform,
  handleOrUrl: string
): Promise<PlatformMetrics | null> {
  try {
    if (!platform || !handleOrUrl) {
      console.error('Invalid parameters: platform and handleOrUrl are required');
      return null;
    }

    let metrics: PlatformMetrics | null = null;

    switch (platform) {
      case 'twitter':
        metrics = await fetchTwitterMetrics(handleOrUrl);
        break;

      case 'facebook':
        metrics = await fetchFacebookMetrics(handleOrUrl);
        break;

      case 'instagram':
        metrics = await fetchInstagramMetrics(handleOrUrl);
        break;

      case 'youtube':
        metrics = await fetchYouTubeMetrics(handleOrUrl);
        break;

      case 'tiktok':
        metrics = await fetchTikTokMetrics(handleOrUrl);
        break;

      case 'linkedin':
        metrics = await fetchLinkedInMetrics(handleOrUrl);
        break;

      default:
        console.error(`Unknown platform: ${platform}`);
        return null;
    }

    return metrics;
  } catch (error) {
    console.error(`Error fetching metrics for platform ${platform}:`, error);
    return null;
  }
}

/**
 * Fetch metrics for multiple platforms in parallel
 *
 * @param platforms - Array of [platform, handleOrUrl] tuples
 * @returns Array of PlatformMetrics (includes nulls for failed requests)
 *
 * @example
 * const results = await fetchMultiplePlatformMetrics([
 *   ['twitter', '@user'],
 *   ['youtube', 'UC...'],
 *   ['instagram', 'username'],
 * ]);
 */
export async function fetchMultiplePlatformMetrics(
  platforms: Array<[Platform, string]>
): Promise<(PlatformMetrics | null)[]> {
  try {
    const promises = platforms.map(([platform, handle]) =>
      fetchPlatformMetrics(platform, handle)
    );

    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching multiple platform metrics:', error);
    return platforms.map(() => null);
  }
}

// Re-export individual platform services for direct access if needed
export { fetchTwitterMetrics } from './twitter';
export { fetchFacebookMetrics, fetchInstagramMetrics } from './meta';
export { fetchYouTubeMetrics } from './youtube';
export { fetchTikTokMetrics } from './tiktok';
export { fetchLinkedInMetrics } from './linkedin';
