import {
  isSiteDetailsValid,
  siteDetailsError,
  storageEstimate,
  progressLabel,
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
