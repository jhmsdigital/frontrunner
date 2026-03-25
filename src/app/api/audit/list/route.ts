import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering - this route reads from Supabase at runtime
export const dynamic = 'force-dynamic';

/**
 * GET /api/audit/list
 * Returns all saved audits for the history view
 * Results are sorted by creation date (newest first)
 * 
 * Creates a fresh Supabase client per request to avoid stale connection
 * state that occurs with module-level singletons in Vercel serverless.
 */
export async function GET() {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });
    }

    const supabase = createClient(url, key);

    const { data: rawAudits, error } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase list error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedAudits = (rawAudits || []).map((audit: any) => ({
      id: audit.id,
      organizationName: audit.organization_name,
      industry: audit.industry,
      createdAt: audit.created_at,
      platformCount: audit.audit_data?.input?.platforms?.length || 0,
    }));

    const response = NextResponse.json({ audits: transformedAudits, _v: 'v5-direct' });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    return response;
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
