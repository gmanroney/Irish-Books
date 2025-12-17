import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Transaction, JournalLine, VatRate } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

// --- Types ---

const guidedSchema = z.object({
  type: z.enum([
    'invoice', 'payment', 'bill', 'bill_payment', 'expense', 'payroll', 'dla_spend', 'dla_withdraw', 'asset_purchase'
  ]),
  date: z.date(),
  description: z.string().min(3, "Description is required"),
  reference: z.string().optional(),
  // Dynamic fields based on type
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  vatRate: z.string().optional(),
  accountId: z.string().optional(), // For Expense/Asset selection
  // Payroll specific
  netPay: z.coerce.number().optional(),
  paye: z.coerce.number().optional(),
  usc: z.coerce.number().optional(),
  prsiEe: z.coerce.number().optional(),
  prsiEr: z.coerce.number().optional(),
});

interface TransactionFormProps {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { addTransaction, accounts, vatCodes } = useAppStore();
  const [mode, setMode] = useState<"guided" | "advanced">("guided");
  const [previewLines, setPreviewLines] = useState<JournalLine[]>([]);
  
  // -- Guided Form --
  const form = useForm<z.infer<typeof guidedSchema>>({
    resolver: zodResolver(guidedSchema),
    defaultValues: {
      type: "invoice",
      date: new Date(),
      description: "",
      amount: 0,
      vatRate: "vat_23",
    }
  });

  const watchAll = form.watch();

  // Effect to generate preview lines based on guided inputs
  useEffect(() => {
    if (mode === "guided") {
      const { type, amount, vatRate, accountId, netPay, paye, usc, prsiEe, prsiEr } = watchAll;
      const lines: JournalLine[] = [];
      const id = "preview";
      const tId = "temp";

      // Helper to get rate
      const vRate = vatCodes.find(v => v.id === vatRate)?.rate || 0;

      if (type === "invoice") {
        // Sales Invoice
        // Dr AR (Gross)
        // Cr Sales (Net)
        // Cr VAT (VAT)
        const net = amount / (1 + vRate);
        const vat = amount - net;
        
        lines.push({ id: "1", transactionId: tId, accountId: "acc_1100", debit: amount, credit: 0 }); // AR
        lines.push({ id: "2", transactionId: tId, accountId: "acc_4000", debit: 0, credit: net, vatCodeId: vatRate, vatAmount: vat }); // Sales
        lines.push({ id: "3", transactionId: tId, accountId: "acc_2100", debit: 0, credit: vat }); // VAT Payable
      } 
      else if (type === "expense") {
         // Expense paid from Bank
         // Dr Expense (Net)
         // Dr VAT Recoverable
         // Cr Bank (Gross)
         const net = amount / (1 + vRate);
         const vat = amount - net;
         const expAcc = accountId || "acc_6700"; // Default to Bank Charges if not set

         lines.push({ id: "1", transactionId: tId, accountId: expAcc, debit: net, credit: 0, vatCodeId: vatRate, vatAmount: vat }); // Expense
         lines.push({ id: "2", transactionId: tId, accountId: "acc_1300", debit: vat, credit: 0 }); // VAT Input
         lines.push({ id: "3", transactionId: tId, accountId: "acc_1000", debit: 0, credit: amount }); // Bank
      }
      else if (type === "bill") {
        // Supplier Bill (on credit)
        // Dr Expense (Net)
        // Dr VAT Recoverable
        // Cr AP (Gross)
        const net = amount / (1 + vRate);
        const vat = amount - net;
        const expAcc = accountId || "acc_6700";

        lines.push({ id: "1", transactionId: tId, accountId: expAcc, debit: net, credit: 0, vatCodeId: vatRate, vatAmount: vat });
        lines.push({ id: "2", transactionId: tId, accountId: "acc_1300", debit: vat, credit: 0 });
        lines.push({ id: "3", transactionId: tId, accountId: "acc_2000", debit: 0, credit: amount }); // AP
      }
      else if (type === "payment") {
        // Customer Payment
        // Dr Bank
        // Cr AR
        lines.push({ id: "1", transactionId: tId, accountId: "acc_1000", debit: amount, credit: 0 });
        lines.push({ id: "2", transactionId: tId, accountId: "acc_1100", debit: 0, credit: amount });
      }
      else if (type === "bill_payment") {
        // Pay Supplier
        // Dr AP
        // Cr Bank
        lines.push({ id: "1", transactionId: tId, accountId: "acc_2000", debit: amount, credit: 0 });
        lines.push({ id: "2", transactionId: tId, accountId: "acc_1000", debit: 0, credit: amount });
      }
      else if (type === "dla_withdraw") {
        // Director Withdrawal
        // Dr DLA
        // Cr Bank
        lines.push({ id: "1", transactionId: tId, accountId: "acc_3200", debit: amount, credit: 0 });
        lines.push({ id: "2", transactionId: tId, accountId: "acc_1000", debit: 0, credit: amount });
      }
      else if (type === "dla_spend") {
        // Director paid expense personally
        // Dr Expense (Net)
        // Dr VAT
        // Cr DLA (Gross)
        const net = amount / (1 + vRate);
        const vat = amount - net;
        const expAcc = accountId || "acc_6600"; // Travel default

        lines.push({ id: "1", transactionId: tId, accountId: expAcc, debit: net, credit: 0, vatCodeId: vatRate, vatAmount: vat });
        lines.push({ id: "2", transactionId: tId, accountId: "acc_1300", debit: vat, credit: 0 });
        lines.push({ id: "3", transactionId: tId, accountId: "acc_3200", debit: 0, credit: amount }); // DLA
      }
      else if (type === "payroll") {
        // Payroll Journal
        // Dr Wages (Gross)
        // Dr Employer PRSI
        // Cr Bank (Net Pay)
        // Cr Payroll Liabilities (PAYE+USC+PRSI)
        
        const gross = amount; // Treat 'amount' as Gross Wages for simplicity in UI, or sum components
        const net = netPay || 0;
        const erPrsi = prsiEr || 0;
        const liability = (paye || 0) + (usc || 0) + (prsiEe || 0) + erPrsi;
        
        // Actually, normally: Gross = Net + PAYE + USC + PRSI(Ee).
        // Cost to company = Gross + PRSI(Er).
        // Let's assume user inputs Gross Wages.
        // And we calculate liability as Gross - Net + PRSI(Er).
        
        // Let's trust the user inputs.
        // Dr Wages (Gross input)
        lines.push({ id: "1", transactionId: tId, accountId: "acc_6000", debit: gross, credit: 0 });
        
        // Dr ER PRSI
        if (erPrsi > 0) {
            lines.push({ id: "2", transactionId: tId, accountId: "acc_6010", debit: erPrsi, credit: 0 });
        }

        // Cr Bank (Net)
        if (net > 0) {
            lines.push({ id: "3", transactionId: tId, accountId: "acc_1000", debit: 0, credit: net });
        }

        // Cr Liabilities (Balance)
        const totalDr = gross + erPrsi;
        const totalCr = net;
        const diff = totalDr - totalCr;
        
        lines.push({ id: "4", transactionId: tId, accountId: "acc_2200", debit: 0, credit: diff });
      }

      // Only update if lines have changed (basic check or rely on stable deps)
      // Since we are fixing dependencies, this should be fine.
      setPreviewLines(lines);
    }
  }, [
    watchAll.type,
    watchAll.amount,
    watchAll.vatRate,
    watchAll.accountId,
    watchAll.netPay,
    watchAll.paye,
    watchAll.usc,
    watchAll.prsiEe,
    watchAll.prsiEr,
    mode,
    vatCodes
  ]);


  async function onGuidedSubmit(data: z.infer<typeof guidedSchema>) {
    const transaction: Transaction = {
      id: Math.random().toString(36).substring(7),
      date: data.date.toISOString(),
      description: data.description,
      reference: data.reference,
      source: "Guided",
      createdAt: new Date().toISOString(),
      lines: previewLines.map(l => ({...l, id: Math.random().toString(36).substring(7), transactionId: "new"}))
    };
    
    await addTransaction(transaction);
    onSuccess();
  }

  // --- Render ---

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guided">Guided Flow</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Journal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="guided" className="space-y-4 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGuidedSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invoice">Sales Invoice</SelectItem>
                          <SelectItem value="payment">Customer Payment</SelectItem>
                          <SelectItem value="bill">Supplier Bill</SelectItem>
                          <SelectItem value="bill_payment">Pay Supplier</SelectItem>
                          <SelectItem value="expense">Expense (Bank)</SelectItem>
                          <SelectItem value="dla_spend">Director Paid Expense</SelectItem>
                          <SelectItem value="dla_withdraw">Director Withdrawal</SelectItem>
                          <SelectItem value="payroll">Payroll Journal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <DatePicker date={field.value} setDate={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Web Design Services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. INV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchAll.type === 'payroll' ? 'Gross Wages' : 'Total Amount (Gross)'}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Fields based on Type */}
                {['invoice', 'bill', 'expense', 'dla_spend'].includes(watchAll.type) && (
                   <FormField
                    control={form.control}
                    name="vatRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Rate</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vatCodes.map(v => (
                              <SelectItem key={v.id} value={v.id}>{v.description} ({(v.rate * 100).toFixed(1)}%)</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {['bill', 'expense', 'dla_spend'].includes(watchAll.type) && (
                   <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Expense/Asset Account</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.filter(a => a.type === 'Expense' || a.type === 'Asset').map(a => (
                              <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchAll.type === 'payroll' && (
                  <>
                    <FormField
                      control={form.control}
                      name="netPay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Net Pay (Paid from Bank)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="prsiEr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer PRSI</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Journal Preview */}
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <h4 className="text-sm font-medium mb-3">Journal Preview</h4>
                  <div className="space-y-2">
                    {previewLines.map((line, i) => {
                      const acc = accounts.find(a => a.id === line.accountId);
                      return (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex-1">
                            {acc?.code} - {acc?.name}
                          </span>
                          <span className="w-24 text-right font-mono">
                            {line.debit > 0 ? `Dr €${line.debit.toFixed(2)}` : ''}
                          </span>
                          <span className="w-24 text-right font-mono">
                            {line.credit > 0 ? `Cr €${line.credit.toFixed(2)}` : ''}
                          </span>
                        </div>
                      );
                    })}
                    {previewLines.length === 0 && <span className="text-muted-foreground text-sm italic">Enter details to see preview</span>}
                    
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-sm">
                        <span>Total</span>
                        <span className="w-24 text-right">
                           Dr €{previewLines.reduce((s, l) => s + l.debit, 0).toFixed(2)}
                        </span>
                        <span className="w-24 text-right">
                           Cr €{previewLines.reduce((s, l) => s + l.credit, 0).toFixed(2)}
                        </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full">Save Transaction</Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Advanced Journal Entry (Drag & Drop / Multi-line) - To be implemented in next iteration.
            <br/>
            Please use Guided Flow for now.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
