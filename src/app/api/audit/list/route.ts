import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering - this route reads from Supabase at runtime
export const dynamic = 'force-dynamic';

/**
 * GET /api/audit/list
 * Returns all saved audits for the history view
 * Results are sorted by creation date (newest first)
 */
export async function GET() {
  try {
    // Create a FRESH client directly to rule out module-level caching issues
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 });
    }
    
    const freshClient = createClient(url, key);

    const { data: rawAudits, error, count } = await freshClient
      .from('audits')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    // Transform Supabase data to match AuditHistory component expectations
    const transformedAudits = (rawAudits || []).map((audit: any) => ({
      id: audit.id,
      organizationName: audit.organization_name,
      industry: audit.industry,
      createdAt: audit.created_at,
      platformCount: audit.audit_data?.input?.platforms?.length || 0,
    }));

    // TEMPORARY DEBUG — remove after fixing
    return NextResponse.json({
      audits: transformedAudits,
      _debug: {
        keyLength: key.length,
        keySuffix: key.substring(key.length - 10),
        urlUsed: url,
        totalRows: rawAudits?.length || 0,
        exactCount: count,
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
