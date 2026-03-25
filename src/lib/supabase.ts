import type { AuditResult, SavedAudit } from '@/types';

/**
 * Supabase REST API helpers using raw fetch.
 * 
 * The Supabase JS client caches/filters results incorrectly in Vercel
 * serverless environments. Raw fetch to the PostgREST API is reliable.
 */

function getConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return { url, key };
}

function headers(key: string, extra?: Record<string, string>) {
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...extra,
  };
}

/**
 * Retry helper — retries an async function with exponential backoff.
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
        const delayMs = 500 * Math.pow(2, attempt);
        console.warn(`Supabase ${label} attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError!;
}

/**
 * Save a new audit result to Supabase (with retry)
 */
export async function saveAudit(result: AuditResult): Promise<string> {
  return withRetry(async () => {
    const { url, key } = getConfig();
    const payload = {
      organization_name: result.input.orgName,
      industry: result.input.industry,
      audit_data: result,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${url}/rest/v1/audits`, {
      method: 'POST',
      headers: headers(key),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to save audit: ${errText} (status: ${res.status})`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Failed to save audit: No data returned');
    }

    return data[0].id;
  }, 3, 'saveAudit');
}

/**
 * Retrieve a single audit by ID
 */
export async function getAudit(id: string): Promise<SavedAudit | null> {
  const { url, key } = getConfig();

  const res = await fetch(
    `${url}/rest/v1/audits?id=eq.${encodeURIComponent(id)}&select=*`,
    { method: 'GET', headers: headers(key), cache: 'no-store' }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch audit: ${errText}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0] as SavedAudit;
}

/**
 * List all saved audits
 */
export async function listAudits(): Promise<SavedAudit[]> {
  const { url, key } = getConfig();

  const res = await fetch(
    `${url}/rest/v1/audits?select=*&order=created_at.desc`,
    { method: 'GET', headers: headers(key), cache: 'no-store' }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list audits: ${errText}`);
  }

  return (await res.json()) as SavedAudit[];
}

/**
 * Update an existing audit
 */
export async function updateAudit(
  id: string,
  auditData: Partial<AuditResult>
): Promise<void> {
  const { url, key } = getConfig();

  const res = await fetch(
    `${url}/rest/v1/audits?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: headers(key),
      body: JSON.stringify({
        audit_data: auditData,
        updated_at: new Date().toISOString(),
      }),
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update audit: ${errText}`);
  }
}

/**
 * Delete an audit by ID
 */
export async function deleteAudit(id: string): Promise<void> {
  const { url, key } = getConfig();

  const res = await fetch(
    `${url}/rest/v1/audits?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: headers(key), cache: 'no-store' }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete audit: ${errText}`);
  }
}
