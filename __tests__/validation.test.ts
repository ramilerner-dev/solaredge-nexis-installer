import {
  isSiteDetailsValid,
  siteDetailsError,
  storageEstimate,
  progressLabel,
  shortDateYYMMDD,
  buildPdfFilename,
} from '@/utils/validation';

describe('isSiteDetailsValid', () => {
  it('returns true when both fields are filled', () => {
    expect(isSiteDetailsValid({ siteName: 'Green Valley Solar', customerName: 'Carlos Mendez' })).toBe(true);
  });

  it('returns false when site name is empty', () => {
    expect(isSiteDetailsValid({ siteName: '', customerName: 'Carlos Mendez' })).toBe(false);
  });

  it('returns false when customer name is empty', () => {
    expect(isSiteDetailsValid({ siteName: 'Green Valley Solar', customerName: '' })).toBe(false);
  });

  it('returns false when both fields are empty', () => {
    expect(isSiteDetailsValid({ siteName: '', customerName: '' })).toBe(false);
  });

  it('trims whitespace before validating', () => {
    expect(isSiteDetailsValid({ siteName: '   ', customerName: 'Carlos' })).toBe(false);
    expect(isSiteDetailsValid({ siteName: 'Green Valley', customerName: '  ' })).toBe(false);
  });
});

describe('siteDetailsError', () => {
  it('returns null when valid', () => {
    expect(siteDetailsError({ siteName: 'Site', customerName: 'Customer' })).toBeNull();
  });

  it('returns combined message when both empty', () => {
    expect(siteDetailsError({ siteName: '', customerName: '' })).toBe(
      'Site name and customer name are required.'
    );
  });

  it('returns site name message when only site name is empty', () => {
    expect(siteDetailsError({ siteName: '', customerName: 'Carlos' })).toBe('Site name is required.');
  });

  it('returns customer name message when only customer name is empty', () => {
    expect(siteDetailsError({ siteName: 'Site', customerName: '' })).toBe('Customer name is required.');
  });
});

describe('storageEstimate', () => {
  it('returns ~0.0 MB for zero photos', () => {
    expect(storageEstimate(0)).toBe('~0.0 MB');
  });

  it('calculates 0.8 MB per photo', () => {
    expect(storageEstimate(1)).toBe('~0.8 MB');
    expect(storageEstimate(3)).toBe('~2.4 MB');
    expect(storageEstimate(10)).toBe('~8.0 MB');
  });
});

describe('progressLabel', () => {
  it('formats correctly', () => {
    expect(progressLabel(0, 12)).toBe('0 of 12 steps complete');
    expect(progressLabel(3, 12)).toBe('3 of 12 steps complete');
    expect(progressLabel(12, 12)).toBe('12 of 12 steps complete');
  });
});

// ─── shortDateYYMMDD ─────────────────────────────────────────────────────────

describe('shortDateYYMMDD', () => {
  it('formats a date as yy-mm-dd with zero padding', () => {
    expect(shortDateYYMMDD(new Date(2026, 4, 5))).toBe('26-05-05');
  });

  it('uses last two digits of year', () => {
    expect(shortDateYYMMDD(new Date(1999, 11, 31))).toBe('99-12-31');
    expect(shortDateYYMMDD(new Date(2007, 0, 1))).toBe('07-01-01');
  });
});

// ─── buildPdfFilename ────────────────────────────────────────────────────────

describe('buildPdfFilename', () => {
  const NOW = new Date(2026, 4, 31, 12, 0, 0); // May 31, 2026 noon (local)

  it('returns index 1 when history is empty', () => {
    expect(buildPdfFilename([], null, NOW)).toBe('26-05-31 installation summary 1.pdf');
  });

  it('returns index 1 when only the current entry exists for today', () => {
    const entries = [{ id: 'current', date: NOW.toISOString() }];
    expect(buildPdfFilename(entries, 'current', NOW)).toBe('26-05-31 installation summary 1.pdf');
  });

  it('returns index 2 when one other entry exists for today', () => {
    const entries = [
      { id: 'a', date: new Date(2026, 4, 31, 9).toISOString() },
      { id: 'current', date: NOW.toISOString() },
    ];
    expect(buildPdfFilename(entries, 'current', NOW)).toBe('26-05-31 installation summary 2.pdf');
  });

  it('returns index 3 when two other entries exist for today', () => {
    const entries = [
      { id: 'a', date: new Date(2026, 4, 31, 8).toISOString() },
      { id: 'b', date: new Date(2026, 4, 31, 10).toISOString() },
      { id: 'current', date: NOW.toISOString() },
    ];
    expect(buildPdfFilename(entries, 'current', NOW)).toBe('26-05-31 installation summary 3.pdf');
  });

  it('ignores entries from other dates', () => {
    const entries = [
      { id: 'a', date: new Date(2026, 4, 30, 9).toISOString() }, // yesterday
      { id: 'b', date: new Date(2026, 4, 31, 10).toISOString() }, // today
      { id: 'c', date: new Date(2026, 5, 1, 9).toISOString() }, // tomorrow
    ];
    expect(buildPdfFilename(entries, null, NOW)).toBe('26-05-31 installation summary 2.pdf');
  });

  it('returns index 1 when activeEntryId is null and history has no today entries', () => {
    const entries = [{ id: 'a', date: new Date(2026, 4, 30, 9).toISOString() }];
    expect(buildPdfFilename(entries, null, NOW)).toBe('26-05-31 installation summary 1.pdf');
  });
});
