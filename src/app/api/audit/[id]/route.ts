import { NextRequest, NextResponse } from 'next/server';
import { getAudit, updateAudit, deleteAudit } from '@/lib/supabase';

/**
 * GET /api/audit/[id]
 * Fetch a single audit by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing audit ID' }, { status: 400 });
    }

    const audit = await getAudit(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Error in audit GET:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch audit',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/audit/[id]
 * Update an existing audit (for editing analysis)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing audit ID' }, { status: 400 });
    }

    const body = await request.json();

    // Validate that the audit exists first
    const existingAudit = await getAudit(id);
    if (!existingAudit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Update the audit with new data
    await updateAudit(id, body);

    // Return updated audit
    const updatedAudit = await getAudit(id);
    return NextResponse.json(updatedAudit);
  } catch (error) {
    console.error('Error in audit PUT:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update audit',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audit/[id]
 * Delete an audit by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing audit ID' }, { status: 400 });
    }

    // Validate that the audit exists first
    const existingAudit = await getAudit(id);
    if (!existingAudit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    await deleteAudit(id);

    return NextResponse.json({ success: true, message: 'Audit deleted' });
  } catch (error) {
    console.error('Error in audit DELETE:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete audit',
      },
      { status: 500 }
    );
  }
}
