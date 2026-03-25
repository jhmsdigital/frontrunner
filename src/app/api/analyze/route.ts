import { NextRequest, NextResponse } from 'next/server';
import type { PlatformMetrics, CompetitorData } from '@/types';
import { generateAnalysis } from '@/lib/gemini';
import { getAudit, updateAudit } from '@/lib/supabase';

/**
 * POST /api/analyze
 * Re-generates analysis for an existing audit (when user makes edits)
 * Accepts updated metrics and competitor data, regenerates SWOT + recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.auditId || !body.organizationName || !body.industry) {
      return NextResponse.json(
        {
          error: 'Missing required fields: auditId, organizationName, industry',
        },
        { status: 400 }
      );
    }

    const {
      auditId,
      organizationName,
      industry,
      campaignGoals,
      platformMetrics = [],
      competitorData = [],
    } = body as {
      auditId: string;
      organizationName: string;
      industry: string;
      campaignGoals?: string;
      platformMetrics?: PlatformMetrics[];
      competitorData?: CompetitorData[];
    };

    // Verify audit exists
    const existingAudit = await getAudit(auditId);
    if (!existingAudit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Generate updated analysis
    const { executiveSummary, swot, recommendations } = await generateAnalysis(
      organizationName,
      industry,
      campaignGoals,
      platformMetrics,
      competitorData
    );

    // Update audit with new analysis
    await updateAudit(auditId, {
      ...existingAudit.audit_data,
      swot,
      executiveSummary,
      recommendations,
      generatedAt: new Date().toISOString(),
    } as any);

    // Return updated analysis
    return NextResponse.json({
      id: auditId,
      executiveSummary,
      swot,
      recommendations,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in analyze POST:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate analysis',
      },
      { status: 500 }
    );
  }
}
