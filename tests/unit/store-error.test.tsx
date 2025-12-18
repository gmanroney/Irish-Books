import { renderHook } from '@testing-library/react';
import { useAppStore, AppProvider } from '@/lib/store';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';

describe('AppStore Error Handling', () => {
  const LOCAL_STORAGE_KEY = 'irish_ltd_books_data_v1';

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('handles localStorage parsing error gracefully', () => {
    // Mock localStorage.getItem to return invalid JSON
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useAppStore(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      ),
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to parse saved data", expect.any(Error));
  });

  it('throws error when useAppStore is used outside AppProvider', () => {
    // Suppress React error boundary logs for this test if needed, 
    // but typically renderHook handles the error catch.
    
    // We expect renderHook to throw because useAppStore throws
    expect(() => {
      renderHook(() => useAppStore());
    }).toThrow('useAppStore must be used within an AppProvider');
  });
});
