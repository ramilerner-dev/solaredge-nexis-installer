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

/** Formats an ISO timestamp as a 12-hour time string (e.g. "12:34 PM"). Returns empty string for null. */
export function formatTimestamp(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mm} ${ampm}`;
}
