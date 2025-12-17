export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  isControl: boolean;
  balance?: number; // Calculated field
}

export type VatRate = 'S23' | 'R13_5' | 'SR9' | 'Z0' | 'EXEMPT' | 'OOS';

export interface VatCode {
  id: string;
  code: VatRate;
  description: string;
  rate: number;
}

export type TransactionSource = 'Manual' | 'Guided' | 'Import';

export interface JournalLine {
  id: string;
  transactionId: string;
  accountId: string;
  debit: number;
  credit: number;
  vatCodeId?: string | null; // ID of the VatCode
  vatAmount?: number | null;
  description?: string; // Optional line-level description
}

export interface Transaction {
  id: string;
  date: string; // ISO Date
  description: string;
  reference?: string;
  source: TransactionSource;
  lines: JournalLine[];
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  currency: string;
  vatRegistered: boolean;
  country: string;
}

// For guided flows
export interface GuidedTransactionParams {
  type: 'invoice' | 'payment' | 'bill' | 'bill_payment' | 'expense' | 'payroll' | 'dla_spend' | 'dla_withdraw' | 'asset_purchase';
  date: string;
  description: string;
  reference?: string;
  amount: number; // Gross or Net depending on context, usually Gross
  vatRate?: VatRate;
  counterpartyId?: string; // Optional for MVP
  // Specific fields
  netAmount?: number;
  vatAmount?: number;
  payeAmount?: number;
  uscAmount?: number;
  prsiEeAmount?: number;
  prsiErAmount?: number;
}
