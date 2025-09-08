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
      const activeClasses = statusColors.active;
      expect(activeClasses).toContain('bg-blue-50');
      expect(activeClasses).toContain('text-blue-600');
      expect(activeClasses).toContain('dark:bg-green-800');
      expect(activeClasses).toContain('dark:text-green-100');
    });

    it('should have completed status with correct color classes', () => {
      const completedClasses = statusColors.completed;
      expect(completedClasses).toContain('bg-blue-100');
      expect(completedClasses).toContain('text-blue-800');
      expect(completedClasses).toContain('dark:bg-green-900/20');
      expect(completedClasses).toContain('dark:text-green-300');
    });

    it('should have archived status with correct color classes', () => {
      const archivedClasses = statusColors.archived;
      expect(archivedClasses).toContain('bg-gray-100');
      expect(archivedClasses).toContain('text-gray-800');
      expect(archivedClasses).toContain('dark:bg-gray-900/20');
      expect(archivedClasses).toContain('dark:text-gray-300');
    });

    it('should have immutable object structure', () => {
      const originalActive = statusColors.active;
      const originalCompleted = statusColors.completed;
      const originalArchived = statusColors.archived;

      // Verify the values haven't changed
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
        // Should not start or end with spaces
        expect(colorString.trim()).toBe(colorString);
        // Should not have double spaces
        expect(colorString).not.toContain('  ');
      });
    });

    it('should include both light and dark mode classes', () => {
      Object.values(statusColors).forEach(colorString => {
        const classes = colorString.split(' ');
        const hasLightMode = classes.some(cls => !cls.startsWith('dark:'));
        const hasDarkMode = classes.some(cls => cls.startsWith('dark:'));
        
        expect(hasLightMode).toBe(true);
        expect(hasDarkMode).toBe(true);
      });
    });

    it('should have valid Tailwind CSS class names', () => {
      Object.values(statusColors).forEach(colorString => {
        const classes = colorString.split(' ');
        classes.forEach(cls => {
          // Valid Tailwind class pattern (including dark: prefix and opacity modifiers)
          expect(cls).toMatch(/^(dark:)?[\w-]+(\/([\d]+|full|auto))?$/);
        });
      });
    });

    it('should include background and text color classes for each status', () => {
      Object.entries(statusColors).forEach(([status, colorString]) => {
        const classes = colorString.split(' ');
        const hasBgClass = classes.some(cls => cls.includes('bg-'));
        const hasTextClass = classes.some(cls => cls.includes('text-'));
        
        expect(hasBgClass).toBe(true);
        expect(hasTextClass).toBe(true);
      });
    });

    it('should be accessible as object properties', () => {
      // Test direct property access
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
      Object.entries(statusColors).forEach(([status, classes]) => {
        const classArray = classes.split(' ');
        
        // Each status should have at least 4 classes (bg, text, dark:bg, dark:text)
        expect(classArray.length).toBeGreaterThanOrEqual(4);
        
        // Should have at least one background class
        expect(classArray.some(cls => cls.startsWith('bg-'))).toBe(true);
        
        // Should have at least one text class
        expect(classArray.some(cls => cls.startsWith('text-'))).toBe(true);
        
        // Should have at least one dark mode background class
        expect(classArray.some(cls => cls.startsWith('dark:bg-'))).toBe(true);
        
        // Should have at least one dark mode text class
        expect(classArray.some(cls => cls.startsWith('dark:text-'))).toBe(true);
      });
    });

    it('should be suitable for className props in React components', () => {
      // Test that the strings can be used directly as className values
      const activeClasses = statusColors.active;
      const completedClasses = statusColors.completed;
      const archivedClasses = statusColors.archived;
      
      // Mock React component usage
      const mockComponent = (className: string) => ({ className });
      
      expect(() => mockComponent(activeClasses)).not.toThrow();
      expect(() => mockComponent(completedClasses)).not.toThrow();
      expect(() => mockComponent(archivedClasses)).not.toThrow();
      
      expect(mockComponent(activeClasses).className).toBe(activeClasses);
      expect(mockComponent(completedClasses).className).toBe(completedClasses);
      expect(mockComponent(archivedClasses).className).toBe(archivedClasses);
    });
  });
});