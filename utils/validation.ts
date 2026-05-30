import type { SiteDetails } from '@/context/InstallationContext';

/** Returns true when mandatory site fields are filled. */
export function isSiteDetailsValid(details: Pick<SiteDetails, 'siteName' | 'customerName'>): boolean {
  return details.siteName.trim().length > 0 && details.customerName.trim().length > 0;
}

/** Returns a human-readable reason string when invalid, or null when valid. */
export function siteDetailsError(
  details: Pick<SiteDetails, 'siteName' | 'customerName'>
): string | null {
  if (details.siteName.trim().length === 0 && details.customerName.trim().length === 0) {
    return 'Site name and customer name are required.';
  }
  if (details.siteName.trim().length === 0) return 'Site name is required.';
  if (details.customerName.trim().length === 0) return 'Customer name is required.';
  return null;
}

/** Calculates mock storage estimate from total photo count. */
export function storageEstimate(totalPhotos: number): string {
  const mb = totalPhotos * 0.8;
  return `~${mb.toFixed(1)} MB`;
}

/** Returns "X of Y steps complete" label. */
export function progressLabel(completedCount: number, total: number): string {
  return `${completedCount} of ${total} steps complete`;
}
