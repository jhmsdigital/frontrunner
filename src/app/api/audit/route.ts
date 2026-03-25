import { NextRequest, NextResponse } from 'next/server';
import type { AuditFormData, PlatformMetrics } from '@/types';
import { fetchPlatformMetrics } from '@/lib/platforms';
import { fetchCompetitorData, generateAnalysis } from '@/lib/gemini';
import { saveAudit } from '@/lib/supabase';

// Map display names to platform keys
const PLATFORM_KEY_MAP: Record<string, string> = {
  'Facebook': 'facebook',
  'Twitter/X': 'twitter',
  'Instagram': 'instagram',
  'TikTok': 'tiktok',
  'LinkedIn': 'linkedin',
  'YouTube': 'youtube',
};

export async function POST(request: NextRequest) {
  try {
    const formData: AuditFormData = await request.json();

    if (
      !formData.orgName ||
      !formData.industry ||
      !formData.platforms ||
      formData.platforms.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: orgName, industry, and platforms' },
        { status: 400 }
      );
    }

    // Step 1: Fetch platform metrics in parallel
    const metricsPromises = formData.platforms
      .filter(p => p.url)
      .map(p => {
        const platformKey = PLATFORM_KEY_MAP[p.name] || p.name.toLowerCase();
        return fetchPlatformMetrics(platformKey as any, p.url);
      });

    const metricsResults = await Promise.all(metricsPromises);
    const platformMetrics: PlatformMetrics[] = metricsResults.filter(
      (m): m is PlatformMetrics => m !== null
    );

    // Step 2: Fetch competitor data via Gemini
    const platformNames = formData.platforms.map(p =>
      PLATFORM_KEY_MAP[p.name] || p.name.toLowerCase()
    );
    const competitorData = await fetchCompetitorData(
      formData.competitors || [],
      platformNames,
      formData.industry
    );

    // Step 3: Generate analysis
    const { executiveSummary, swot, recommendations } = await generateAnalysis(
      formData.orgName,
      formData.industry,
      formData.campaignGoals,
      platformMetrics,
      competitorData
    );

    // Step 4: Build result
    const auditResult = {
      input: formData,
      platformMetrics,
      competitorData,
      swot,
      executiveSummary,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    // Step 5: Save to Supabase
    let auditId: string | undefined;
    let saveError: string | null = null;
    try {
      auditId = await saveAudit(auditResult as any);
    } catch (e) {
      console.error('Failed to save audit to Supabase:', e);
      saveError = e instanceof Error ? e.message : 'Failed to save audit';
      // Continue without saving - show warning to user but don't fail the whole request
    }

    // Step 6: Return response in the shape the frontend expects
    const totalFollowers = platformMetrics.reduce((sum, m) => sum + m.followerCount, 0);
    const avgEngagement = platformMetrics.length > 0
      ? platformMetrics.reduce((sum, m) => sum + m.engagementRate, 0) / platformMetrics.length
      : 0;

    return NextResponse.json({
      id: auditId || crypto.randomUUID(),
      organizationName: formData.orgName,
      industry: formData.industry,
      executiveSummary,
      metrics: [
        {
          label: 'Total Followers',
          value: totalFollowers.toLocaleString(),
          source: platformMetrics.some(m => m.dataSource === 'api-verified') ? 'API Verified' : 'Estimated',
        },
        {
          label: 'Avg. Engagement Rate',
          value: `${avgEngagement.toFixed(2)}%`,
          source: 'Calculated',
        },
        {
          label: 'Active Platforms',
          value: platformMetrics.length,
          source: 'Verified',
        },
      ],
      platforms: platformMetrics.map(m => ({
        platform: m.platform,
        followers: m.followerCount,
        engagementRate: m.engagementRate,
        url: m.profileUrl,
        postFrequency: `${m.postsPerWeek.toFixed(1)} posts/week`,
        audienceGrowth: 'N/A',
      })),
      competitors: competitorData.map(c => ({
        name: c.name,
        followers: c.totalFollowers,
      })),
      swot,
      recommendations,
      sources: platformMetrics.map(m => `${m.platform}: ${m.dataSource}`),
      ...(saveError ? { saveWarning: `Audit generated but not saved: ${saveError}` } : {}),
    }, { status: 201 });
  } catch (error) {
    console.error('Error in audit POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run audit' },
      { status: 500 }
    );
  }
}
