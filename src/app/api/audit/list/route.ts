import { NextResponse } from 'next/server';
import { listAudits } from '@/lib/supabase';

/**
 * GET /api/audit/list
 * Returns all saved audits for the history view
 * Results are sorted by creation date (newest first)
 */
export async function GET() {
  try {
    const audits = await listAudits();
    return NextResponse.json(audits);
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
