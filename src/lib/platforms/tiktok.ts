import { PlatformMetrics } from '@/types';

/**
 * Extracts TikTok username from URL
 * Supports: https://tiktok.com/@username, @username, username
 */
function extractTikTokHandle(handleOrUrl: string): string {
  const trimmed = handleOrUrl.trim();

  // Remove @ if present
  if (trimmed.startsWith('@')) {
    return trimmed.substring(1);
  }

  // Extract from URL
  const urlMatch = trimmed.match(/(?:tiktok\.com|vm\.tiktok\.com)\/(@[a-zA-Z0-9._-]+)/i);
  if (urlMatch) {
    return urlMatch[1].replace('@', '');
  }

  return trimmed;
}

/**
 * Fetches TikTok metrics using TikTok Display API
 *
 * PLACEHOLDER: TikTok API requires user OAuth authentication which must be
 * handled separately. This function returns null until OAuth flow is implemented.
 *
 * TODO: Implement TikTok OAuth flow
 * - Guide user through TikTok OAuth consent
 * - Store access token securely
 * - Use access token to call TikTok API
 *
 * Endpoints (when implemented):
 * - GET /v2/user/info/ - Get user info with follower_count, following_count, likes_count, video_count
 * - GET /v2/video/list/ - Get recent videos with engagement metrics
 *
 * Requires TikTok OAuth token (user-specific, not app-level)
 */
export async function fetchTikTokMetrics(
  handleOrUrl: string
): Promise<PlatformMetrics | null> {
  try {
    // TODO: Implement TikTok OAuth authentication
    // For now, return null as TikTok Display API requires user-level OAuth
    const handle = extractTikTokHandle(handleOrUrl);

    console.warn(
      `TikTok metrics fetch not implemented. User: ${handle}. ` +
      'TikTok API requires user OAuth which must be implemented separately.'
    );

    // Placeholder implementation structure:
    // const accessToken = await getTikTokUserToken(); // From OAuth flow
    // if (!accessToken) return null;
    //
    // const userResponse = await fetch('https://open.tiktokapis.com/v1/user/info/', {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    // });
    //
    // if (!userResponse.ok) return null;
    //
    // const userData = await userResponse.json();
    // const user = userData.data.user;
    //
    // const videosResponse = await fetch('https://open.tiktokapis.com/v1/video/list/', {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    //   params: {
    //     max_count: 10,
    //   },
    // });

    return null;
  } catch (error) {
    console.error('Error fetching TikTok metrics:', error);
    return null;
  }
}
