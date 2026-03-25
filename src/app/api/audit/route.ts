import { NextRequest, NextResponse } from 'next/server';
import type { AuditFormData, AuditResult, PlatformMetrics } from '@/types';
import { fetchMultiplePlatformMetrics } from '@/lib/platforms';
import { fetchCompetitorData, generateAnalysis } from '@/lib/gemini';
import { saveAudit } from '@/lib/supabase';

/**
 * POST /api/audit
 * Runs a complete social media audit:
 * 1. Fetches platform metrics from APIs
 * 2. Fetches competitor data via Gemini
 * 3. Generates analysis (SWOT, executive summary, recommendations)
 * 4. Saves to Supabase
 * 5. Returns complete AuditResult
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: AuditFormData = body;

    // Validate required fields
    if (
      !formData.organizationName ||
      !formData.industry ||
      !formData.platforms ||
      formData.platforms.length === 0
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields: organizationName, industry, and platforms',
        },
        { status: 400 }
      );
    }

    // Step 1: Fetch platform metrics in parallel
    const platformHandles: Array<[typeof formData.platforms[0], string]> = [];
    for (const platform of formData.platforms) {
      const handle = formData.socialHandles?.[platform];
      if (handle) {
        platformHandles.push([platform, handle]);
      }
    }

    const metricsResults = await fetchMultiplePlatformMetrics(platformHandles);
    const platformMetrics: PlatformMetrics[] = metricsResults
      .filter((m): m is PlatformMetrics => m !== null);

    // Step 2: Fetch competitor data
    const competitorData = await fetchCompetitorData(
      formData.competitors,
      formData.platforms,
      formData.industry
    );

    // Step 3: Generate analysis
    const { executiveSummary, swot, recommendations } = await generateAnalysis(
      formData.organizationName,
      formData.industry,
      formData.campaignGoals,
      platformMetrics,
      competitorData
    );

    // Step 4: Create audit result object
    const auditResult: AuditResult = {
      input: formData,
      platformMetrics,
      competitorData,
      swot,
      executiveSummary,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    // Step 5: Save to Supabase
    const auditId = await saveAudit(auditResult);
    auditResult.id = auditId;

    return NextResponse.json(auditResult, { status: 201 });
  } catch (error) {
    console.error('Error in audit POST:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to run audit',
      },
      { status: 500 }
    );
  }
}
