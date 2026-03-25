// Platform literal type
export type Platform = 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin';

// Post-level metrics from platform APIs
export interface PostMetrics {
  id: string;
  text: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  url: string;
}

// Full platform metrics returned by API services (twitter.ts, youtube.ts, etc.)
export interface PlatformMetrics {
  platform: string;
  handle: string;
  profileUrl: string;
  followerCount: number;
  followingCount: number;
  totalPosts: number;
  recentPosts: PostMetrics[];
  avgEngagementPerPost: number;
  engagementRate: number;
  postsPerWeek: number;
  dataSource: 'api-verified' | 'search-derived';
  scrapedAt: string;
  rawData?: any;
}

// Competitor data from Gemini search
export interface CompetitorData {
  name: string;
  platforms: Array<{
    platform: string;
    followerCount: number;
    handle?: string;
  }>;
  totalFollowers: number;
  dataSource: 'search-derived';
}

// Form input from InputForm component
export interface AuditFormData {
  orgName: string;
  website: string;
  industry: string;
  campaignGoals?: string;
  platforms: Array<{
    name: string;
    url: string;
  }>;
  competitors: string[];
}

// SWOT types
export interface SwotItem {
  text: string;
  source: string;
}

export interface SwotAnalysis {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

// Complete audit result stored in Supabase
export interface AuditResult {
  id?: string;
  input: AuditFormData;
  platformMetrics: PlatformMetrics[];
  competitorData: CompetitorData[];
  swot: SwotAnalysis;
  executiveSummary: string;
  recommendations: string[];
  generatedAt: string;
}

// Supabase database record
export interface SavedAudit {
  id: string;
  organization_name: string;
  industry: string;
  audit_data: AuditResult;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Majority Strategies brand colors
export const MS_COLORS = {
  navy: '#00476C',
  oceanBlue: '#217CA1',
  gray: '#5A5B5D',
  gold: '#A38D31',
  lightGray: '#A4A7A9',
  skyBlue: '#D4E8F0',
} as const;
