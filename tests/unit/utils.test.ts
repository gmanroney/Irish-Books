import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('c-1', 'c-2')).toBe('c-1 c-2');
    });

    it('handles conditional classes', () => {
      expect(cn('c-1', true && 'c-2', false && 'c-3')).toBe('c-1 c-2');
    });

    it('merges tailwind classes correctly using tailwind-merge', () => {
      // px-2 should be overridden by px-4
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('handles arrays and objects', () => {
        expect(cn(['c-1', 'c-2'], { 'c-3': true, 'c-4': false })).toBe('c-1 c-2 c-3');
    });
  });
});
