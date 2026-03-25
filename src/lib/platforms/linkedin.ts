import { PlatformMetrics } from '@/types';

/**
 * Extracts LinkedIn profile handle from URL
 * Supports: https://linkedin.com/in/firstname-lastname, /in/handle, /company/handle
 */
function extractLinkedInHandle(handleOrUrl: string): { type: 'person' | 'company'; value: string } {
  const trimmed = handleOrUrl.trim();

  // Check if it's a company profile
  const companyMatch = trimmed.match(/(?:linkedin\.com\/company\/)([a-z0-9_-]+)/i);
  if (companyMatch) {
    return { type: 'company', value: companyMatch[1] };
  }

  // Check if it's a person profile
  const personMatch = trimmed.match(/(?:linkedin\.com\/in\/)([a-z0-9_-]+)/i);
  if (personMatch) {
    return { type: 'person', value: personMatch[1] };
  }

  // Default to person
  return { type: 'person', value: trimmed };
}

/**
 * Fetches LinkedIn metrics using LinkedIn API
 *
 * PLACEHOLDER: LinkedIn API access is highly restricted and requires approval.
 * The official LinkedIn API does not provide public access to:
 * - Individual profile metrics (followers, engagement)
 * - Company page metrics (subscribers, engagement)
 * - Post engagement data
 *
 * This function returns null until LinkedIn API access is approved.
 *
 * TODO: Apply for LinkedIn API access
 * - Request access to Community Management API for companies
 * - Request access to Organization Lookup API for company data
 * - Handle user authentication via OAuth
 *
 * Intended endpoints (when API access is approved):
 * - GET /v2/me - Get authenticated user profile
 * - GET /v2/organizations/{id} - Get company profile with metrics (if approved)
 * - GET /v2/posts - Get company posts with engagement metrics (if approved)
 *
 * Note: As of now (2026), LinkedIn restricts API access to official partners
 * and does not provide public metrics scraping capabilities.
 */
export async function fetchLinkedInMetrics(
  handleOrUrl: string
): Promise<PlatformMetrics | null> {
  try {
    const handle = extractLinkedInHandle(handleOrUrl);

    console.warn(
      `LinkedIn metrics fetch not available. Handle: ${handle.value} (${handle.type}). ` +
      'LinkedIn API access is restricted and requires official approval.'
    );

    // Placeholder implementation structure:
    // const accessToken = await getLinkedInAccessToken(); // From OAuth
    // if (!accessToken) return null;
    //
    // if (handle.type === 'company') {
    //   // Community Management API - for company posts
    //   const orgResponse = await fetch(`https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${handle.value}`, {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   });
    //
    //   if (!orgResponse.ok) return null;
    //   const orgData = await orgResponse.json();
    //   const organizationUrn = orgData.elements[0].id;
    //
    //   // Get organization details
    //   const detailsResponse = await fetch(`https://api.linkedin.com/v2/organizationalMetadata`, {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //     params: {
    //       q: 'organization',
    //       organization: organizationUrn,
    //     },
    //   });
    // } else {
    //   // Person profile - very limited data available
    //   const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   });
    //
    //   // LinkedIn does not provide follower count or engagement metrics
    //   // for personal profiles through the API
    // }

    return null;
  } catch (error) {
    console.error('Error fetching LinkedIn metrics:', error);
    return null;
  }
}
