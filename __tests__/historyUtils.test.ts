import {
  upsertHistoryEntry,
  removeHistoryEntry,
  refreshHistoryEntryDate,
  byDateDesc,
} from '@/utils/historyUtils';
import type { HistoryEntry } from '@/context/InstallationContext';

const makeEntry = (id: string, date: string, siteName = 'Site'): HistoryEntry => ({
  id,
  date,
  siteDetails: {
    customerName: 'Customer',
    siteName,
    installerName: 'Installer',
    address: '',
    isIndoor: true,
    roomSizeConfirmed: false,
    rainProtectedConfirmed: false,
    systemType: 'SolarEdge Nexis 3ph',
    notes: '',
  },
  procedure: 'solaredge',
  currentStepIndex: 0,
  steps: [],
});

// ─── byDateDesc ──────────────────────────────────────────────────────────────

describe('byDateDesc', () => {
  it('returns positive when a is older than b', () => {
    const older = makeEntry('1', '2026-01-01T00:00:00Z');
    const newer = makeEntry('2', '2026-12-01T00:00:00Z');
    expect(byDateDesc(older, newer)).toBeGreaterThan(0);
  });

  it('returns negative when a is newer than b', () => {
    const older = makeEntry('1', '2026-01-01T00:00:00Z');
    const newer = makeEntry('2', '2026-12-01T00:00:00Z');
    expect(byDateDesc(newer, older)).toBeLessThan(0);
  });

  it('returns 0 when dates are identical', () => {
    const a = makeEntry('1', '2026-05-30T12:00:00Z');
    const b = makeEntry('2', '2026-05-30T12:00:00Z');
    expect(byDateDesc(a, b)).toBe(0);
  });
});

// ─── upsertHistoryEntry ──────────────────────────────────────────────────────

describe('upsertHistoryEntry', () => {
  it('appends a new entry to an empty list', () => {
    const entry = makeEntry('a', '2026-05-30T12:00:00Z');
    const result = upsertHistoryEntry([], entry);
    expect(result).toEqual([entry]);
  });

  it('appends a new entry and sorts by date desc', () => {
    const older = makeEntry('a', '2026-01-01T00:00:00Z');
    const newer = makeEntry('b', '2026-06-01T00:00:00Z');
    const result = upsertHistoryEntry([older], newer);
    expect(result.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('updates an existing entry matched by id without duplicating', () => {
    const original = makeEntry('a', '2026-01-01T00:00:00Z', 'OldSite');
    const updated = makeEntry('a', '2026-06-01T00:00:00Z', 'NewSite');
    const result = upsertHistoryEntry([original], updated);
    expect(result.length).toBe(1);
    expect(result[0].siteDetails.siteName).toBe('NewSite');
    expect(result[0].date).toBe('2026-06-01T00:00:00Z');
  });

  it('re-sorts after an update if the new date moves the entry', () => {
    const a = makeEntry('a', '2026-03-01T00:00:00Z');
    const b = makeEntry('b', '2026-02-01T00:00:00Z');
    const c = makeEntry('c', '2026-01-01T00:00:00Z');
    // c becomes newest after update
    const cUpdated = makeEntry('c', '2026-12-01T00:00:00Z');
    const result = upsertHistoryEntry([a, b, c], cUpdated);
    expect(result.map((e) => e.id)).toEqual(['c', 'a', 'b']);
  });

  it('does not mutate the input array', () => {
    const original = [makeEntry('a', '2026-01-01T00:00:00Z')];
    const snapshot = [...original];
    upsertHistoryEntry(original, makeEntry('b', '2026-02-01T00:00:00Z'));
    expect(original).toEqual(snapshot);
  });
});

// ─── removeHistoryEntry ──────────────────────────────────────────────────────

describe('removeHistoryEntry', () => {
  it('removes the entry with matching id', () => {
    const a = makeEntry('a', '2026-01-01T00:00:00Z');
    const b = makeEntry('b', '2026-02-01T00:00:00Z');
    const result = removeHistoryEntry([a, b], 'a');
    expect(result).toEqual([b]);
  });

  it('returns the input unchanged if id is not found', () => {
    const a = makeEntry('a', '2026-01-01T00:00:00Z');
    const result = removeHistoryEntry([a], 'nonexistent');
    expect(result).toEqual([a]);
  });

  it('returns empty array when removing the only entry', () => {
    const a = makeEntry('a', '2026-01-01T00:00:00Z');
    expect(removeHistoryEntry([a], 'a')).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const original = [makeEntry('a', '2026-01-01T00:00:00Z')];
    const snapshot = [...original];
    removeHistoryEntry(original, 'a');
    expect(original).toEqual(snapshot);
  });
});

// ─── refreshHistoryEntryDate ─────────────────────────────────────────────────

describe('refreshHistoryEntryDate', () => {
  it('updates the date of the matched entry', () => {
    const a = makeEntry('a', '2026-01-01T00:00:00Z');
    const result = refreshHistoryEntryDate([a], 'a', '2026-06-01T00:00:00Z');
    expect(result[0].date).toBe('2026-06-01T00:00:00Z');
  });

  it('re-sorts the list after date update', () => {
    const a = makeEntry('a', '2026-03-01T00:00:00Z');
    const b = makeEntry('b', '2026-02-01T00:00:00Z');
    const c = makeEntry('c', '2026-01-01T00:00:00Z');
    const result = refreshHistoryEntryDate([a, b, c], 'c', '2026-12-01T00:00:00Z');
    expect(result.map((e) => e.id)).toEqual(['c', 'a', 'b']);
  });

  it('returns the input unchanged if id is not found', () => {
    const a = makeEntry('a', '2026-01-01T00:00:00Z');
    const result = refreshHistoryEntryDate([a], 'nonexistent', '2026-06-01T00:00:00Z');
    expect(result).toBe(a === result[0] ? result : a as any); // identity not guaranteed but content unchanged
    expect(result).toEqual([a]);
  });

  it('preserves all other entry fields except date', () => {
    const a = makeEntry('a', '2026-01-01T00:00:00Z', 'OriginalSite');
    a.currentStepIndex = 5;
    const result = refreshHistoryEntryDate([a], 'a', '2026-06-01T00:00:00Z');
    expect(result[0].siteDetails.siteName).toBe('OriginalSite');
    expect(result[0].currentStepIndex).toBe(5);
  });
});
