import type { StepState, StepStatus } from '@/context/InstallationContext';

export function applyMarkStepComplete(steps: StepState[], stepIndex: number): StepState[] {
  return steps.map((s, i) =>
    i === stepIndex
      ? { ...s, status: 'complete' as StepStatus, completedAt: new Date().toISOString() }
      : s
  );
}

export function applyAddPhoto(steps: StepState[], stepIndex: number): StepState[] {
  return steps.map((s, i) =>
    i === stepIndex ? { ...s, photoCount: s.photoCount + 1 } : s
  );
}

export function applyStartFresh(steps: StepState[]): StepState[] {
  return steps.map(() => ({ status: 'pending' as StepStatus, photoCount: 0, completedAt: null }));
}

export function totalPhotos(steps: StepState[]): number {
  return steps.reduce((sum, s) => sum + s.photoCount, 0);
}

export function completedCount(steps: StepState[]): number {
  return steps.filter((s) => s.status === 'complete').length;
}
