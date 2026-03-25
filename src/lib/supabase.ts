import { createClient } from '@supabase/supabase-js';
import type { AuditResult, SavedAudit } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side client (for browser operations)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (for API routes)
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Retry helper — retries an async function up to `maxRetries` times with exponential backoff.
 * Waits 500ms, 1s, 2s between retries.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  label: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delayMs = 500 * Math.pow(2, attempt); // 500ms, 1s, 2s
        console.warn(
          `Supabase ${label} attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delayMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError!;
}

/**
 * Save a new audit result to Supabase (with retry)
 * @param result The audit result to save
 * @returns The ID of the saved audit
 */
export async function saveAudit(result: AuditResult): Promise<string> {
  return withRetry(async () => {
    const { data, error } = await supabaseClient
      .from('audits')
      .insert([
        {
          organization_name: result.input.orgName,
          industry: result.input.industry,
          audit_data: result,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('id');

    if (error) {
      throw new Error(`Failed to save audit: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Failed to save audit: No data returned');
    }

    return data[0].id;
  }, 3, 'saveAudit');
}

/**
 * Retrieve a single audit by ID
 * @param id The audit ID
 * @returns The saved audit or null if not found
 */
export async function getAudit(id: string): Promise<SavedAudit | null> {
  const { data, error } = await supabaseClient
    .from('audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      return null;
    }
    throw new Error(`Failed to fetch audit: ${error.message}`);
  }

  return data as SavedAudit;
}

/**
 * List all saved audits
 * @returns Array of saved audits
 */
export async function listAudits(): Promise<SavedAudit[]> {
  const { data, error } = await supabaseClient
    .from('audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list audits: ${error.message}`);
  }

  return (data as SavedAudit[]) || [];
}

/**
 * Update an existing audit
 * @param id The audit ID
 * @param data Partial audit data to update
 */
export async function updateAudit(
  id: string,
  data: Partial<AuditResult>
): Promise<void> {
  const { error } = await supabaseClient
    .from('audits')
    .update({
      audit_data: data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update audit: ${error.message}`);
  }
}

/**
 * Delete an audit by ID
 * @param id The audit ID
 */
export async function deleteAudit(id: string): Promise<void> {
  const { error } = await supabaseClient
    .from('audits')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete audit: ${error.message}`);
  }
}
