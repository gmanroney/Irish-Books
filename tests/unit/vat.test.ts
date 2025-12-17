import { describe, it, expect } from 'vitest';

describe('VAT Calculations', () => {
  const calculateVat = (amount: number, rate: number) => {
    const net = amount / (1 + rate);
    const vat = amount - net;
    return { net, vat };
  };

  it('should calculate Standard Rate (23%) correctly', () => {
    // Gross 123, Net 100, VAT 23
    const { net, vat } = calculateVat(123, 0.23);
    expect(net).toBeCloseTo(100, 2);
    expect(vat).toBeCloseTo(23, 2);
  });

  it('should calculate Reduced Rate (13.5%) correctly', () => {
    // Gross 113.5, Net 100, VAT 13.5
    const { net, vat } = calculateVat(113.5, 0.135);
    expect(net).toBeCloseTo(100, 2);
    expect(vat).toBeCloseTo(13.5, 2);
  });

  it('should handle rounding correctly for large numbers', () => {
    // Gross 98400, Rate 23%
    // Net should be 80000
    // VAT should be 18400
    const { net, vat } = calculateVat(98400, 0.23);
    expect(net).toBeCloseTo(80000, 2);
    expect(vat).toBeCloseTo(18400, 2);
  });
});
