import type { HistoryEntry } from '@/context/InstallationContext';

/** Sort comparator — most recent date first. */
export function byDateDesc(a: HistoryEntry, b: HistoryEntry): number {
  return b.date.localeCompare(a.date);
}

/** Insert a new entry or update an existing one (matched by id). Returns sorted-desc array. */
export function upsertHistoryEntry(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const idx = history.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    const next = history.slice();
    next[idx] = entry;
    return next.sort(byDateDesc);
  }
  return [...history, entry].sort(byDateDesc);
}

/** Remove the entry with the given id. */
export function removeHistoryEntry(history: HistoryEntry[], id: string): HistoryEntry[] {
  return history.filter((e) => e.id !== id);
}

/** Update the date field of the entry with given id and re-sort. No-op if id not found. */
export function refreshHistoryEntryDate(
  history: HistoryEntry[],
  id: string,
  newDate: string
): HistoryEntry[] {
  const found = history.find((e) => e.id === id);
  if (!found) return history;
  return history.map((e) => (e.id === id ? { ...e, date: newDate } : e)).sort(byDateDesc);
}
