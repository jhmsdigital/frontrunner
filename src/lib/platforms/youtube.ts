import { PlatformMetrics, PostMetrics } from '@/types';

/**
 * Extracts YouTube channel ID or handle from URL
 * Supports:
 * - https://youtube.com/@username
 * - https://youtube.com/channel/UCxxxxxx
 * - https://youtube.com/c/channelname
 * - @username or UC... format
 */
function extractYouTubeHandle(handleOrUrl: string): { type: 'id' | 'forUsername'; value: string } {
  const trimmed = handleOrUrl.trim();

  // Remove @ if present
  const withoutAt = trimmed.startsWith('@') ? trimmed.substring(1) : trimmed;

  // Check if it's a channel ID (starts with UC)
  if (withoutAt.match(/^UC[a-zA-Z0-9_-]{22}$/)) {
    return { type: 'id', value: withoutAt };
  }

  // Extract channel ID from URL
  const channelIdMatch = withoutAt.match(/(?:youtube\.com\/channel\/)([a-zA-Z0-9_-]+)/i);
  if (channelIdMatch) {
    return { type: 'id', value: channelIdMatch[1] };
  }

  // Extract username/handle from URL or use as-is
  const usernameMatch = withoutAt.match(/(?:youtube\.com\/@|youtube\.com\/c\/)([a-zA-Z0-9_-]+)/i);
  if (usernameMatch) {
    return { type: 'forUsername', value: usernameMatch[1] };
  }

  // Default to forUsername
  return { type: 'forUsername', value: withoutAt };
}

/**
 * Fetches YouTube channel metrics using YouTube Data API v3
 *
 * Endpoints used:
 * - GET /youtube/v3/channels - Get channel info with statistics
 * - GET /youtube/v3/search - Find recent videos
 * - GET /youtube/v3/videos - Get video statistics and engagement metrics
 *
 * Requires YOUTUBE_API_KEY environment variable
 */
export async function fetchYouTubeMetrics(
  handleOrUrl: string
): Promise<PlatformMetrics | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.error('YOUTUBE_API_KEY not configured');
      return null;
    }

    const handle = extractYouTubeHandle(handleOrUrl);
    let channelId: string | null = null;
    let channelData: any = null;

    // Step 1: Get channel ID and info
    if (handle.type === 'id') {
      channelId = handle.value;
      const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,topicDetails&id=${encodeURIComponent(channelId)}&key=${apiKey}`;

      const channelsResponse = await fetch(channelsUrl);

      if (!channelsResponse.ok) {
        console.error(`YouTube channels lookup failed: ${channelsResponse.status} ${channelsResponse.statusText}`);
        return null;
      }

      const channelsResp = await channelsResponse.json();
      if (channelsResp.error) {
        console.error(`YouTube API error: ${channelsResp.error.message}`);
        return null;
      }

      channelData = channelsResp.items?.[0];
    } else {
      // Look up by forUsername
      const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,topicDetails&forUsername=${encodeURIComponent(handle.value)}&key=${apiKey}`;

      const channelsResponse = await fetch(channelsUrl);

      if (!channelsResponse.ok) {
        console.error(`YouTube channels lookup failed: ${channelsResponse.status} ${channelsResponse.statusText}`);
        return null;
      }

      const channelsResp = await channelsResponse.json();
      if (channelsResp.error) {
        console.error(`YouTube API error: ${channelsResp.error.message}`);
        return null;
      }

      channelData = channelsResp.items?.[0];
      if (!channelData) {
        console.error(`YouTube channel not found: ${handle.value}`);
        return null;
      }

      channelId = channelData.id;
    }

    if (!channelData || !channelId) {
      console.error(`YouTube channel not found`);
      return null;
    }

    const channelTitle = channelData.snippet?.title || handle.value;
    const subscriberCount = parseInt(channelData.statistics?.subscriberCount || '0', 10);
    const viewCount = parseInt(channelData.statistics?.viewCount || '0', 10);
    const videoCount = parseInt(channelData.statistics?.videoCount || '0', 10);

    // Step 2: Get recent videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=date&maxResults=10&type=video&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      console.error(`YouTube search failed: ${searchResponse.status} ${searchResponse.statusText}`);
      return null;
    }

    const searchData = await searchResponse.json();
    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',') || '';

    let videoStats: any[] = [];

    if (videoIds) {
      // Step 3: Get video statistics
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${encodeURIComponent(videoIds)}&key=${apiKey}`;

      const videosResponse = await fetch(videosUrl);

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        videoStats = videosData.items || [];
      }
    }

    const recentPosts: PostMetrics[] = videoStats.map((video: any) => {
      const stats = video.statistics || {};
      return {
        id: video.id,
        text: video.snippet?.title || '',
        publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
        likes: parseInt(stats.likeCount || '0', 10),
        comments: parseInt(stats.commentCount || '0', 10),
        shares: 0, // YouTube API doesn't provide direct share count
        views: parseInt(stats.viewCount || '0', 10),
        url: `https://www.youtube.com/watch?v=${video.id}`,
      };
    });

    // Calculate engagement metrics
    let totalEngagement = 0;
    let totalViews = 0;

    if (recentPosts.length > 0) {
      totalEngagement = recentPosts.reduce((sum, post) => {
        return sum + (post.likes + post.comments);
      }, 0);
      totalViews = recentPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    }

    const avgEngagementPerPost = recentPosts.length > 0 ? totalEngagement / recentPosts.length : 0;
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

    // Calculate posts per week (uploads per week)
    let postsPerWeek = 0;
    if (recentPosts.length > 1) {
      const oldestPostDate = new Date(recentPosts[recentPosts.length - 1].publishedAt);
      const newestPostDate = new Date(recentPosts[0].publishedAt);
      const daysDiff = (newestPostDate.getTime() - oldestPostDate.getTime()) / (1000 * 60 * 60 * 24);
      const weeks = Math.max(daysDiff / 7, 1);
      postsPerWeek = recentPosts.length / weeks;
    }

    return {
      platform: 'youtube',
      handle: channelTitle,
      profileUrl: `https://www.youtube.com/channel/${channelId}`,
      followerCount: subscriberCount,
      followingCount: 0, // YouTube channels don't have "following"
      totalPosts: videoCount,
      recentPosts,
      avgEngagementPerPost,
      engagementRate,
      postsPerWeek,
      dataSource: 'api-verified',
      scrapedAt: new Date().toISOString(),
      rawData: {
        channelId,
        description: channelData.snippet?.description,
        totalViews: viewCount,
        topics: channelData.topicDetails?.topicIds,
      },
    };
  } catch (error) {
    console.error('Error fetching YouTube metrics:', error);
    return null;
  }
}
