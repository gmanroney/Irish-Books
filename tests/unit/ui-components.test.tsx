import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('UI Components', () => {
  describe('Calendar', () => {
    it('renders correctly', () => {
      render(<Calendar />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('allows date selection', () => {
      const onSelect = vi.fn();
      render(<Calendar mode="single" onSelect={onSelect} />);
      
      // Select the 15th of the current month
      // Note: This might be flaky if today is 15th and it's selected or disabled.
      // But usually in default mode it's fine.
      // We'll search for text "15" and click it.
      const day15 = screen.getByText('15');
      fireEvent.click(day15);
      
      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('Card', () => {
    it('renders content correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card Body</CardContent>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Body')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
      it('renders with custom class', () => {
          render(<Button className="custom-class">Click me</Button>);
          const btn = screen.getByRole('button', { name: 'Click me' });
          expect(btn).toHaveClass('custom-class');
      });

      it('handles click', () => {
          const onClick = vi.fn();
          render(<Button onClick={onClick}>Click me</Button>);
          fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
          expect(onClick).toHaveBeenCalled();
      });
  });
});
