// Form Data Types
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

// Platform Metrics Types
export interface PlatformMetrics {
  platform: string;
  followers: number;
  engagementRate: number;
  url: string;
  postFrequency: string;
  audienceGrowth: string;
}

// SWOT Item Type
export interface SwotItem {
  text: string;
  source: 'VERIFIED' | 'CALCULATED' | 'BENCHMARK' | 'OBSERVED';
}

// SWOT Analysis Type
export interface SwotAnalysis {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

// Metrics Card Type
export interface MetricsCard {
  label: string;
  value: string | number;
  source: string;
  icon?: React.ReactNode;
}

// Competitor Type
export interface Competitor {
  name: string;
  followers: number;
}

// Full Audit Result Type
export interface AuditResult {
  id: string;
  organizationName: string;
  industry: string;
  executiveSummary: string;
  metrics: MetricsCard[];
  platforms: PlatformMetrics[];
  competitors: Competitor[];
  swot: SwotAnalysis;
  recommendations: string[];
  sources: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Audit Record Type (for history)
export interface AuditRecord {
  id: string;
  organizationName: string;
  industry: string;
  createdAt: string;
  platformCount: number;
}
