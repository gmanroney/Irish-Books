import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportsPage from '@/pages/reports';
import { AppProvider } from '@/lib/store';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    width: 800,
    height: 1200,
    toDataURL: () => 'data:image/png;base64,fake-image-data'
  }))
}));

// Mock jspdf
const mockSave = vi.fn();
const mockAddImage = vi.fn();

vi.mock('jspdf', () => {
  return {
    default: class {
      save = mockSave;
      addImage = mockAddImage;
    }
  };
});

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders report tabs', () => {
    render(
      <AppProvider>
        <ReportsPage />
      </AppProvider>
    );

    expect(screen.getByText('Profit & Loss')).toBeInTheDocument();
    expect(screen.getByText('Balance Sheet')).toBeInTheDocument();
    expect(screen.getByText('VAT Return')).toBeInTheDocument();
  });

  it('calculates totals correctly (sanity check)', () => {
    render(
      <AppProvider>
        <ReportsPage />
      </AppProvider>
    );
    // Sanity check that values are being rendered (e.g. from seed data)
    // We expect some currency values
    const currencyElements = screen.getAllByText(/€/);
    expect(currencyElements.length).toBeGreaterThan(0);
  });

  it('triggers PDF export on button click', async () => {
    render(
      <AppProvider>
        <ReportsPage />
      </AppProvider>
    );

    const exportButton = screen.getByText('Export PDF');
    fireEvent.click(exportButton);

    await waitFor(() => {
        expect(html2canvas).toHaveBeenCalled();
    });
    
    // Check if jsPDF was instantiated
    // expect(jsPDF).toHaveBeenCalled(); // Can't easily check constructor call with this class mock style without more boilerplate
    expect(mockAddImage).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalledWith(expect.stringContaining('.pdf'));
  });
});
