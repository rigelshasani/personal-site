import { statusColors } from '@/lib/constants';

describe('Constants', () => {
  describe('statusColors', () => {
    it('should have all required status keys', () => {
      expect(statusColors).toHaveProperty('active');
      expect(statusColors).toHaveProperty('completed');
      expect(statusColors).toHaveProperty('archived');
    });

    it('should have string values for all status colors', () => {
      expect(typeof statusColors.active).toBe('string');
      expect(typeof statusColors.completed).toBe('string');
      expect(typeof statusColors.archived).toBe('string');
    });

    it('should have non-empty values for all status colors', () => {
      expect(statusColors.active.length).toBeGreaterThan(0);
      expect(statusColors.completed.length).toBeGreaterThan(0);
      expect(statusColors.archived.length).toBeGreaterThan(0);
    });

    it('should have active status with correct color classes', () => {
      expect(statusColors.active).toContain('bg-status-active-bg');
      expect(statusColors.active).toContain('text-status-active-text');
    });

    it('should have completed status with correct color classes', () => {
      expect(statusColors.completed).toContain('bg-status-completed-bg');
      expect(statusColors.completed).toContain('text-status-completed-text');
    });

    it('should have archived status with correct color classes', () => {
      expect(statusColors.archived).toContain('bg-status-archived-bg');
      expect(statusColors.archived).toContain('text-status-archived-text');
    });

    it('should use CSS variable-based classes (no dark: prefix — dark mode handled via .dark)', () => {
      Object.values(statusColors).forEach(colorString => {
        const classes = colorString.split(' ');
        expect(classes.every(cls => !cls.startsWith('dark:'))).toBe(true);
        expect(classes.some(cls => cls.includes('bg-'))).toBe(true);
        expect(classes.some(cls => cls.includes('text-'))).toBe(true);
      });
    });

    it('should have immutable object structure', () => {
      const originalActive = statusColors.active;
      const originalCompleted = statusColors.completed;
      const originalArchived = statusColors.archived;

      expect(statusColors.active).toBe(originalActive);
      expect(statusColors.completed).toBe(originalCompleted);
      expect(statusColors.archived).toBe(originalArchived);
    });

    it('should be enumerable', () => {
      const keys = Object.keys(statusColors);
      expect(keys).toEqual(['active', 'completed', 'archived']);
      expect(keys).toHaveLength(3);
    });

    it('should have consistent class format (space-separated)', () => {
      Object.values(statusColors).forEach(colorString => {
        expect(colorString).toMatch(/^[\w-]+(\s+[\w-:/]+)*$/);
        expect(colorString.trim()).toBe(colorString);
        expect(colorString).not.toContain('  ');
      });
    });

    it('should have valid Tailwind CSS class names', () => {
      Object.values(statusColors).forEach(colorString => {
        const classes = colorString.split(' ');
        classes.forEach(cls => {
          expect(cls).toMatch(/^[\w-]+(\/([\d]+|full|auto))?$/);
        });
      });
    });

    it('should include background and text color classes for each status', () => {
      Object.entries(statusColors).forEach(([_status, colorString]) => {
        const classes = colorString.split(' ');
        expect(classes.some(cls => cls.includes('bg-'))).toBe(true);
        expect(classes.some(cls => cls.includes('text-'))).toBe(true);
      });
    });

    it('should be accessible as object properties', () => {
      expect(statusColors['active']).toBeDefined();
      expect(statusColors['completed']).toBeDefined();
      expect(statusColors['archived']).toBeDefined();
    });

    it('should support iteration over entries', () => {
      const entries = Object.entries(statusColors);
      expect(entries).toHaveLength(3);

      entries.forEach(([key, value]) => {
        expect(['active', 'completed', 'archived']).toContain(key);
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent structure across all statuses', () => {
      Object.entries(statusColors).forEach(([_status, classes]) => {
        const classArray = classes.split(' ');
        expect(classArray.length).toBeGreaterThanOrEqual(2);
        expect(classArray.some(cls => cls.startsWith('bg-'))).toBe(true);
        expect(classArray.some(cls => cls.startsWith('text-'))).toBe(true);
        expect(classArray.every(cls => !cls.startsWith('dark:'))).toBe(true);
      });
    });

    it('should be suitable for className props in React components', () => {
      const mockComponent = (className: string) => ({ className });

      expect(() => mockComponent(statusColors.active)).not.toThrow();
      expect(() => mockComponent(statusColors.completed)).not.toThrow();
      expect(() => mockComponent(statusColors.archived)).not.toThrow();

      expect(mockComponent(statusColors.active).className).toBe(statusColors.active);
      expect(mockComponent(statusColors.completed).className).toBe(statusColors.completed);
      expect(mockComponent(statusColors.archived).className).toBe(statusColors.archived);
    });
  });
});
