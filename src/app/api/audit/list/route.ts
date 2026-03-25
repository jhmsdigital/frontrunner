import { NextResponse } from 'next/server';
import { listAudits } from '@/lib/supabase';

// Force dynamic rendering - this route reads from Supabase at runtime
export const dynamic = 'force-dynamic';

/**
 * GET /api/audit/list
 * Returns all saved audits for the history view
 * Results are sorted by creation date (newest first)
 */
export async function GET() {
  try {
    const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    console.log('[audit/list] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[audit/list] Supabase key starts with:', supaKey.substring(0, 20));
    console.log('[audit/list] Supabase key length:', supaKey.length);

    const rawAudits = await listAudits();
    console.log('[audit/list] Raw audits count:', rawAudits.length);
    console.log('[audit/list] Raw audit IDs:', rawAudits.map((a: any) => a.id));

    // Transform Supabase data to match AuditHistory component expectations
    const transformedAudits = rawAudits.map((audit: any) => ({
      id: audit.id,
      organizationName: audit.organization_name,
      industry: audit.industry,
      createdAt: audit.created_at,
      platformCount: audit.audit_data?.input?.platforms?.length || 0,
    }));

    return NextResponse.json({ audits: transformedAudits });
  } catch (error) {
    console.error('Error in audit list GET:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to list audits',
      },
      { status: 500 }
    );
  }
}
