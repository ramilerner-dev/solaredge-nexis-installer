import {
  applyMarkStepComplete,
  applyAddPhoto,
  applyStartFresh,
  totalPhotos,
  completedCount,
} from '@/utils/stepUtils';
import type { StepState } from '@/context/InstallationContext';

const makeSteps = (n = 12): StepState[] =>
  Array(n).fill(null).map(() => ({ status: 'pending' as const, photoCount: 0, completedAt: null }));

// ─── applyMarkStepComplete ────────────────────────────────────────────────────

describe('applyMarkStepComplete', () => {
  it('sets the target step to complete', () => {
    const result = applyMarkStepComplete(makeSteps(), 0);
    expect(result[0].status).toBe('complete');
  });

  it('records a non-null ISO timestamp on the completed step', () => {
    const result = applyMarkStepComplete(makeSteps(), 0);
    expect(result[0].completedAt).not.toBeNull();
    expect(typeof result[0].completedAt).toBe('string');
  });

  it('leaves all other steps unchanged', () => {
    const steps = makeSteps();
    const result = applyMarkStepComplete(steps, 2);
    result.forEach((s, i) => {
      if (i !== 2) {
        expect(s.status).toBe('pending');
        expect(s.completedAt).toBeNull();
      }
    });
  });

  it('works on the last step (index 11)', () => {
    const result = applyMarkStepComplete(makeSteps(), 11);
    expect(result[11].status).toBe('complete');
    expect(result[0].status).toBe('pending');
  });
});

// ─── applyAddPhoto ────────────────────────────────────────────────────────────

describe('applyAddPhoto', () => {
  it('increments photoCount by 1 for the target step', () => {
    const result = applyAddPhoto(makeSteps(), 1);
    expect(result[1].photoCount).toBe(1);
  });

  it('leaves all other steps photoCount unchanged', () => {
    const result = applyAddPhoto(makeSteps(), 1);
    result.forEach((s, i) => {
      if (i !== 1) expect(s.photoCount).toBe(0);
    });
  });

  it('calling three times on the same step results in photoCount === 3', () => {
    let steps = makeSteps();
    steps = applyAddPhoto(steps, 3);
    steps = applyAddPhoto(steps, 3);
    steps = applyAddPhoto(steps, 3);
    expect(steps[3].photoCount).toBe(3);
  });
});

// ─── applyStartFresh ─────────────────────────────────────────────────────────

describe('applyStartFresh', () => {
  it('resets all steps to pending with 0 photos and null timestamp', () => {
    let steps = applyMarkStepComplete(makeSteps(), 0);
    steps = applyAddPhoto(steps, 0);
    steps = applyMarkStepComplete(steps, 1);
    const fresh = applyStartFresh(steps);
    fresh.forEach((s) => {
      expect(s.status).toBe('pending');
      expect(s.photoCount).toBe(0);
      expect(s.completedAt).toBeNull();
    });
  });
});

// ─── totalPhotos & completedCount ────────────────────────────────────────────

describe('totalPhotos', () => {
  it('sums photoCount across all steps', () => {
    let steps = makeSteps();
    steps = applyAddPhoto(steps, 0);
    steps = applyAddPhoto(steps, 0);
    steps = applyAddPhoto(steps, 2);
    expect(totalPhotos(steps)).toBe(3);
  });

  it('returns 0 when no photos added', () => {
    expect(totalPhotos(makeSteps())).toBe(0);
  });
});

describe('completedCount', () => {
  it('counts only complete steps', () => {
    let steps = makeSteps();
    steps = applyMarkStepComplete(steps, 0);
    steps = applyMarkStepComplete(steps, 1);
    expect(completedCount(steps)).toBe(2);
  });

  it('returns 0 when no steps complete', () => {
    expect(completedCount(makeSteps())).toBe(0);
  });
});
