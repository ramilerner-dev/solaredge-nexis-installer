import path from 'path';
import fs from 'fs';
import STEPS from '@/data/steps';
import DiagramImages from '@/constants/DiagramImages';

describe('STEPS array structure', () => {
  it('contains exactly 12 steps', () => {
    expect(STEPS).toHaveLength(12);
  });

  it('step ids are unique and sequential from 1 to 12', () => {
    const ids = STEPS.map((s) => s.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('no step has an empty title', () => {
    STEPS.forEach((step) => {
      expect(step.title.trim().length).toBeGreaterThan(0);
    });
  });

  it('no step has an empty instructions array', () => {
    STEPS.forEach((step) => {
      expect(step.instructions.length).toBeGreaterThan(0);
    });
  });

  it('no step has an empty instruction string', () => {
    STEPS.forEach((step) => {
      step.instructions.forEach((instruction) => {
        expect(instruction.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('no step has an empty diagramFiles array', () => {
    STEPS.forEach((step) => {
      expect(step.diagramFiles.length).toBeGreaterThan(0);
    });
  });
});

describe('DiagramImages map', () => {
  it('contains all 34 pages', () => {
    expect(Object.keys(DiagramImages)).toHaveLength(34);
  });

  it('all keys follow the page-XX format', () => {
    Object.keys(DiagramImages).forEach((key) => {
      expect(key).toMatch(/^page-\d{2}$/);
    });
  });
});

describe('steps.ts ↔ DiagramImages cross-check', () => {
  it('every diagramFile referenced in steps exists as a key in DiagramImages', () => {
    const keys = Object.keys(DiagramImages);
    STEPS.forEach((step) => {
      step.diagramFiles.forEach((file) => {
        expect(keys).toContain(file);
      });
    });
  });

  it('every diagramFile referenced in steps exists on disk', () => {
    const diagramsDir = path.join(__dirname, '..', 'assets', 'diagrams');
    STEPS.forEach((step) => {
      step.diagramFiles.forEach((file) => {
        const filePath = path.join(diagramsDir, `${file}.png`);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });
});
