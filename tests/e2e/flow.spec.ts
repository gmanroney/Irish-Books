import { test, expect } from '@playwright/test';

test.describe('Irish LtdCo Books E2E', () => {
  
  test('Dashboard loads with default data', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Irish LtdCo')).toBeVisible();
    await expect(page.getByText('Bank Balance')).toBeVisible();
  });

  test('Create a Sales Invoice Transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    // Open New Transaction Modal
    await page.getByRole('button', { name: 'New Transaction' }).click();
    
    // Fill Form (Guided Flow)
    // Select Type: Sales Invoice (default)
    // Description
    await page.getByLabel('Description').fill('E2E Test Invoice');
    // Amount
    await page.getByLabel('Total Amount (Gross)').fill('1230');
    
    // Check Preview
    await expect(page.getByText('Journal Preview')).toBeVisible();
    await expect(page.getByText('Dr €1230.00')).toBeVisible(); // AR
    
    // Save
    await page.getByRole('button', { name: 'Save Transaction' }).click();
    
    // Verify in Table
    await expect(page.getByText('E2E Test Invoice')).toBeVisible();
    await expect(page.getByText('€1230.00')).toBeVisible();
  });

  test('Reports page loads', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByText('Profit & Loss Statement')).toBeVisible();
    await expect(page.getByText('Balance Sheet')).toBeVisible();
  });
});
