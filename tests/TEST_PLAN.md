# Test Plan: Irish LtdCo Books

## Overview
This test plan validates the accounting logic, VAT compliance, and user flows for the "Irish LtdCo Books" application, specifically focusing on the "Irish Pallet Co" scenario.

## Scenarios & Coverage

### 1. Opening Balances (1 Jan 2026)
*   **Goal**: Establish a balanced ledger.
*   **Data**:
    *   Bank: €200,000 (Dr)
    *   Inventory (Raw): €60,000 (Dr)
    *   Inventory (Finished): €40,000 (Dr)
    *   Fixed Assets: €500,000 (Dr)
    *   Accum. Depreciation: €150,000 (Cr)
    *   Share Capital: €100,000 (Cr)
    *   Retained Earnings: €550,000 (Cr) [Balancing Figure]
*   **Validation**: Total Assets = Total Liabilities + Equity.

### 2. Operational Transactions
*   **Purchase**: Raw materials with 23% VAT.
*   **Production**: Transfer Raw Materials to Cost of Goods Sold (COGS).
*   **Sales**:
    *   Wood Pallets (Standard VAT)
    *   Plastic Pallets (Standard VAT)
*   **Payroll**: Monthly journal with PRSI/PAYE split.
*   **Utilities**: Overheads with VAT.
*   **Depreciation**: Non-cash expense.

### 3. Reporting Assertions
*   **VAT Report**: Verify T1 (Sales), T2 (Purchases), and T3 (Net Payable) match calculated expectations.
*   **Profit & Loss**: Revenue - COGS - Expenses = Net Profit.
*   **Balance Sheet**: Assets = Liabilities + Equity.

## Test Strategy

### Unit Tests (`/tests/unit`)
*   `vat.test.ts`: Verifies tax calculations for different rates (23%, 13.5%, etc.).
*   `reports.test.ts`: Loads the seeded "Irish Pallet Co" data and asserts exact report totals.

### Integration Tests (`/tests/integration`)
*   `store.test.tsx`: Verifies the React Store correctly adds transactions and updates account balances.

### E2E Tests (`/tests/e2e`)
*   `flow.spec.ts`:
    *   Opens the app.
    *   Navigates to Transactions.
    *   Creates a new Sales Invoice.
    *   Verifies the transaction appears in the table.
    *   Checks the Dashboard for updated KPIs.

## Assumptions
*   Currency is EUR.
*   Standard VAT rate is 23%.
*   Dates are handled in ISO format (YYYY-MM-DD).
