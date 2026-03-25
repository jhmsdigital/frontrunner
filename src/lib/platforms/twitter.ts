import { PlatformMetrics, PostMetrics } from '@/types';

/**
 * Extracts Twitter handle from URL or returns the handle as-is
 * Supports: https://twitter.com/handle, https://x.com/handle, @handle, handle
 */
function extractTwitterHandle(handleOrUrl: string): string {
  const trimmed = handleOrUrl.trim();

  // Remove @ if present
  if (trimmed.startsWith('@')) {
    return trimmed.substring(1);
  }

  // Extract from URL (twitter.com or x.com)
  const urlMatch = trimmed.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Return as-is if it looks like a handle
  return trimmed;
}

/**
 * Fetches Twitter/X metrics using the X API v2
 *
 * Endpoints used:
 * - GET /2/users/by/username/:username - Get user info with public metrics
 * - GET /2/users/:id/tweets - Get recent tweets with engagement metrics
 *
 * Requires TWITTER_BEARER_TOKEN environment variable
 */
export async function fetchTwitterMetrics(
  handleOrUrl: string
): Promise<PlatformMetrics | null> {
  try {
    const handle = extractTwitterHandle(handleOrUrl);
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      console.error('TWITTER_BEARER_TOKEN not configured');
      return null;
    }

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
      'User-Agent': 'Frontrunner-SocialAudit/1.0',
    };

    // Step 1: Get user info and public metrics
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${encodeURIComponent(handle)}?user.fields=public_metrics,description,profile_image_url,created_at`,
      { headers }
    );

    if (!userResponse.ok) {
      console.error(`Twitter user lookup failed: ${userResponse.status} ${userResponse.statusText}`);
      return null;
    }

    const userData = await userResponse.json();
    const user = userData.data;

    if (!user) {
      console.error(`Twitter user not found: ${handle}`);
      return null;
    }

    const userId = user.id;
    const followerCount = user.public_metrics.followers_count || 0;
    const followingCount = user.public_metrics.following_count || 0;

    // Step 2: Get recent tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&tweet.fields=public_metrics,created_at,author_id`,
      { headers }
    );

    if (!tweetsResponse.ok) {
      console.error(`Twitter tweets lookup failed: ${tweetsResponse.status} ${tweetsResponse.statusText}`);
      return null;
    }

    const tweetsData = await tweetsResponse.json();
    const tweets = tweetsData.data || [];

    // Process recent posts (limit to 10)
    const recentPosts: PostMetrics[] = tweets.slice(0, 10).map((tweet: any) => {
      const metrics = tweet.public_metrics || {};
      return {
        id: tweet.id,
        text: tweet.text,
        publishedAt: tweet.created_at,
        likes: metrics.like_count || 0,
        comments: metrics.reply_count || 0,
        shares: (metrics.retweet_count || 0) + (metrics.quote_count || 0),
        views: metrics.impression_count,
        url: `https://twitter.com/${handle}/status/${tweet.id}`,
      };
    });

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
      platform: 'twitter',
      handle,
      profileUrl: `https://twitter.com/${handle}`,
      followerCount,
      followingCount,
      totalPosts: user.public_metrics.tweet_count || 0,
      recentPosts,
      avgEngagementPerPost,
      engagementRate,
      postsPerWeek,
      dataSource: 'api-verified',
      scrapedAt: new Date().toISOString(),
      rawData: {
        user: {
          id: user.id,
          name: user.name,
          description: user.description,
          verified: user.verified,
          created_at: user.created_at,
        },
        tweetsCount: tweets.length,
      },
    };
  } catch (error) {
    console.error('Error fetching Twitter metrics:', error);
    return null;
  }
}
