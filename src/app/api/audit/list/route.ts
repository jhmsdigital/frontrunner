import { NextResponse } from 'next/server';

// Force dynamic rendering - this route reads from Supabase at runtime
export const dynamic = 'force-dynamic';

/**
 * GET /api/audit/list
 * Returns all saved audits for the history view
 * Results are sorted by creation date (newest first)
 * 
 * Uses raw fetch to Supabase REST API to bypass any JS client issues.
 */
export async function GET() {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });
    }

    // Raw fetch to Supabase REST API — bypasses JS client entirely
    const restUrl = `${url}/rest/v1/audits?select=id,organization_name,industry,created_at,audit_data&order=created_at.desc`;
    const res = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText, status: res.status }, { status: 500 });
    }

    const rawAudits = await res.json();

    const transformedAudits = (rawAudits || []).map((audit: any) => ({
      id: audit.id,
      organizationName: audit.organization_name,
      industry: audit.industry,
      createdAt: audit.created_at,
      platformCount: audit.audit_data?.input?.platforms?.length || 0,
    }));

    const response = NextResponse.json({ audits: transformedAudits, _v: 'v6-rawfetch', _count: rawAudits?.length });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Error in audit list GET:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list audits' },
      { status: 500 }
    );
  }
}
