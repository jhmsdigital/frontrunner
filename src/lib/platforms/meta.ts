import { PlatformMetrics, PostMetrics } from '@/types';

/**
 * Extracts Facebook page ID or name from URL
 * Supports: https://facebook.com/pagename, https://www.facebook.com/pages/pagename/123456
 */
function extractFacebookHandle(handleOrUrl: string): string {
  const trimmed = handleOrUrl.trim();

  // Check if it's already a numeric ID
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Extract page name/ID from URL
  const urlMatch = trimmed.match(
    /(?:facebook\.com|fb\.com)\/(?:pages\/)?([a-zA-Z0-9._-]+)(?:\/(\d+))?/i
  );
  if (urlMatch) {
    return urlMatch[2] || urlMatch[1]; // Prefer ID if available, otherwise use name
  }

  return trimmed;
}

/**
 * Extracts Instagram username from URL
 * Supports: https://instagram.com/username, https://www.instagram.com/username/
 */
function extractInstagramHandle(handleOrUrl: string): string {
  const trimmed = handleOrUrl.trim();

  // Remove @ if present
  if (trimmed.startsWith('@')) {
    return trimmed.substring(1);
  }

  // Extract from URL
  const urlMatch = trimmed.match(/(?:instagram\.com)\/([a-zA-Z0-9._]+)/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  return trimmed;
}

/**
 * Fetches Facebook page metrics using Meta Graph API
 *
 * Endpoints used:
 * - GET /{page-id} - Get page info with fan_count, followers_count
 * - GET /{page-id}/posts - Get recent posts with engagement metrics
 *
 * Requires META_PAGE_ACCESS_TOKEN environment variable
 */
export async function fetchFacebookMetrics(
  handleOrUrl: string
): Promise<PlatformMetrics | null> {
  try {
    const pageId = extractFacebookHandle(handleOrUrl);
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('META_PAGE_ACCESS_TOKEN not configured');
      return null;
    }

    const fields = 'id,name,fan_count,followers_count,website,about,picture,created_time';
    const pageUrl = `https://graph.facebook.com/v18.0/${encodeURIComponent(pageId)}?fields=${fields}&access_token=${accessToken}`;

    const pageResponse = await fetch(pageUrl);

    if (!pageResponse.ok) {
      console.error(`Facebook page lookup failed: ${pageResponse.status} ${pageResponse.statusText}`);
      return null;
    }

    const pageData = await pageResponse.json();

    if (pageData.error) {
      console.error(`Facebook API error: ${pageData.error.message}`);
      return null;
    }

    const followerCount = pageData.followers_count || pageData.fan_count || 0;
    const pageName = pageData.name || pageId;

    // Get recent posts
    const postsFields = 'id,message,created_time,type,story,permalink_url,shares,likes.summary(true),comments.summary(true)';
    const postsUrl = `https://graph.facebook.com/v18.0/${encodeURIComponent(pageId)}/posts?fields=${postsFields}&limit=10&access_token=${accessToken}`;

    const postsResponse = await fetch(postsUrl);

    if (!postsResponse.ok) {
      console.error(`Facebook posts lookup failed: ${postsResponse.status} ${postsResponse.statusText}`);
      return null;
    }

    const postsData = await postsResponse.json();
    const posts = postsData.data || [];

    const recentPosts: PostMetrics[] = posts.map((post: any) => ({
      id: post.id,
      text: post.message || post.story || '',
      publishedAt: post.created_time,
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      url: post.permalink_url,
    }));

    // Calculate engagement metrics
    let totalEngagement = 0;
    let totalPostsInPeriod = 0;

    if (recentPosts.length > 0) {
      totalEngagement = recentPosts.reduce((sum, post) => {
        return sum + (post.likes + post.comments + post.shares);
      }, 0);
      totalPostsInPeriod = recentPosts.length;
    }

    const avgEngagementPerPost = totalPostsInPeriod > 0 ? totalEngagement / totalPostsInPeriod : 0;
    const engagementRate = followerCount > 0 ? (avgEngagementPerPost / followerCount) * 100 : 0;

    // Calculate posts per week
    let postsPerWeek = 0;
    if (recentPosts.length > 1) {
      const oldestPostDate = new Date(recentPosts[recentPosts.length - 1].publishedAt);
      const newestPostDate = new Date(recentPosts[0].publishedAt);
      const daysDiff = (newestPostDate.getTime() - oldestPostDate.getTime()) / (1000 * 60 * 60 * 24);
      const weeks = Math.max(daysDiff / 7, 1);
      postsPerWeek = recentPosts.length / weeks;
    }

    return {
      platform: 'facebook',
      handle: pageName,
      profileUrl: `https://facebook.com/${pageId}`,
      followerCount,
      followingCount: 0, // Facebook pages don't have "following"
      totalPosts: posts.length,
      recentPosts,
      avgEngagementPerPost,
      engagementRate,
      postsPerWeek,
      dataSource: 'api-verified',
      scrapedAt: new Date().toISOString(),
      rawData: {
        pageId,
        website: pageData.website,
        about: pageData.about,
        createdTime: pageData.created_time,
      },
    };
  } catch (error) {
    console.error('Error fetching Facebook metrics:', error);
    return null;
  }
}

/**
 * Fetches Instagram metrics using Meta Graph API
 *
 * Endpoints used:
 * - GET /{ig-user-id} - Get user info with followers_count, media_count
 * - GET /{ig-user-id}/media - Get recent posts with engagement metrics
 *
 * Requires META_PAGE_ACCESS_TOKEN environment variable (must be for Instagram Business Account)
 */
export async function fetchInstagramMetrics(
  handleOrUrl: string
): Promise<PlatformMetrics | null> {
  try {
    const username = extractInstagramHandle(handleOrUrl);
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

    if (!accessToken) {
      console.error('META_PAGE_ACCESS_TOKEN not configured');
      return null;
    }

    // Note: This requires the Instagram Business Account ID. In production, you'd need to:
    // 1. Get the Facebook page ID from the token
    // 2. Get the Instagram Business Account ID from the page
    // For now, we attempt direct lookup by username (limited API support)

    const fields = 'id,username,name,biography,followers_count,following_count,media_count,website,profile_picture_url,ig_id';
    const userUrl = `https://graph.instagram.com/v18.0/ig_hashtag_search?user_id=${username}&fields=${fields}&access_token=${accessToken}`;

    const userResponse = await fetch(userUrl);

    if (!userResponse.ok) {
      console.error(`Instagram user lookup failed: ${userResponse.status} ${userResponse.statusText}`);
      return null;
    }

    const userData = await userResponse.json();

    if (userData.error) {
      console.error(`Instagram API error: ${userData.error.message}`);
      return null;
    }

    const user = userData.data?.[0];

    if (!user) {
      console.error(`Instagram user not found: ${username}`);
      return null;
    }

    const followerCount = user.followers_count || 0;
    const followingCount = user.following_count || 0;
    const userId = user.id;

    // Get recent media
    const mediaFields = 'id,caption,timestamp,like_count,comments_count,media_type,media_url,permalink,insights.metric(impressions,engagement)';
    const mediaUrl = `https://graph.instagram.com/v18.0/${userId}/media?fields=${mediaFields}&limit=10&access_token=${accessToken}`;

    const mediaResponse = await fetch(mediaUrl);

    if (!mediaResponse.ok) {
      console.error(`Instagram media lookup failed: ${mediaResponse.status} ${mediaResponse.statusText}`);
      return null;
    }

    const mediaData = await mediaResponse.json();
    const media = mediaData.data || [];

    const recentPosts: PostMetrics[] = media.map((post: any) => ({
      id: post.id,
      text: post.caption || '',
      publishedAt: post.timestamp,
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
      shares: 0, // Instagram API doesn't provide share count
      views: post.insights?.data?.find((i: any) => i.name === 'impressions')?.values?.[0]?.value,
      url: post.permalink,
    }));

    // Calculate engagement metrics
    let totalEngagement = 0;
    let totalPostsInPeriod = 0;

    if (recentPosts.length > 0) {
      totalEngagement = recentPosts.reduce((sum, post) => {
        return sum + (post.likes + post.comments + post.shares);
      }, 0);
      totalPostsInPeriod = recentPosts.length;
    }

    const avgEngagementPerPost = totalPostsInPeriod > 0 ? totalEngagement / totalPostsInPeriod : 0;
    const engagementRate = followerCount > 0 ? (avgEngagementPerPost / followerCount) * 100 : 0;

    // Calculate posts per week
    let postsPerWeek = 0;
    if (recentPosts.length > 1) {
      const oldestPostDate = new Date(recentPosts[recentPosts.length - 1].publishedAt);
      const newestPostDate = new Date(recentPosts[0].publishedAt);
      const daysDiff = (newestPostDate.getTime() - oldestPostDate.getTime()) / (1000 * 60 * 60 * 24);
      const weeks = Math.max(daysDiff / 7, 1);
      postsPerWeek = recentPosts.length / weeks;
    }

    return {
      platform: 'instagram',
      handle: user.username,
      profileUrl: `https://instagram.com/${user.username}`,
      followerCount,
      followingCount,
      totalPosts: user.media_count || 0,
      recentPosts,
      avgEngagementPerPost,
      engagementRate,
      postsPerWeek,
      dataSource: 'api-verified',
      scrapedAt: new Date().toISOString(),
      rawData: {
        userId,
        biography: user.biography,
        website: user.website,
      },
    };
  } catch (error) {
    console.error('Error fetching Instagram metrics:', error);
    return null;
  }
}
