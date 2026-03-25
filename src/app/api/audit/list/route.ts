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
    const rawAudits = await listAudits();

    // Transform Supabase data to match AuditHistory component expectations
    const transformedAudits = rawAudits.map((audit: any) => ({
      id: audit.id,
      organizationName: audit.organization_name,
      industry: audit.industry,
      createdAt: audit.created_at,
      platformCount: audit.audit_data?.input?.platforms?.length || 0,
    }));

    // TEMPORARY DEBUG — remove after verifying env var fix
    const keySource = process.env.SUPABASE_ANON_KEY ? 'SUPABASE_ANON_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
    const activeKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    return NextResponse.json({
      audits: transformedAudits,
      _debug: {
        keySource,
        keyLength: activeKey.length,
        keyPrefix: activeKey.substring(0, 20),
        keySuffix: activeKey.substring(activeKey.length - 10),
        totalFromDb: rawAudits.length,
      },
    });
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
