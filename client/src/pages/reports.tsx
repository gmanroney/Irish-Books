import { useAppStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Account, AccountType } from "@/lib/types";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";

export default function ReportsPage() {
  const { accounts, getAccountBalance, transactions, vatCodes } = useAppStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("pnl");

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2, // Improve resolution
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`financial-report-${activeTab}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n);


  // --- Profit & Loss Calculation ---
  const revenueAccounts = accounts.filter(a => a.type === 'Revenue');
  const expenseAccounts = accounts.filter(a => a.type === 'Expense');
  
  const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + (-1 * getAccountBalance(acc.id)), 0);
  const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);
  const netProfit = totalRevenue - totalExpenses;

  // --- Balance Sheet Calculation ---
  const assetAccounts = accounts.filter(a => a.type === 'Asset');
  const liabilityAccounts = accounts.filter(a => a.type === 'Liability');
  const equityAccounts = accounts.filter(a => a.type === 'Equity');

  const totalAssets = assetAccounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + (-1 * getAccountBalance(acc.id)), 0);
  const totalEquity = equityAccounts.reduce((sum, acc) => sum + (-1 * getAccountBalance(acc.id)), 0);
  
  // Balance Check: Assets = Liabilities + Equity + Current Year Earnings
  const balanceCheck = totalAssets - (totalLiabilities + totalEquity + netProfit);

  // --- VAT Report Calculation ---
  // We need to iterate over all lines with VAT codes
  const vatSummary = vatCodes.map(code => {
    let salesNet = 0;
    let salesVat = 0;
    let purchaseNet = 0;
    let purchaseVat = 0;

    transactions.forEach(t => {
      t.lines.forEach(line => {
        if (line.vatCodeId === code.id) {
          // Identify if it's Sales (Output) or Purchase (Input)
          // Rough heuristic: Revenue accounts are sales, Expense/Asset are purchases
          const acc = accounts.find(a => a.id === line.accountId);
          if (acc?.type === 'Revenue') {
            salesNet += line.credit - line.debit; // Revenue is Credit normal
            salesVat += line.vatAmount || 0;
          } else if (acc?.type === 'Expense' || acc?.type === 'Asset') {
            purchaseNet += line.debit - line.credit; // Expense is Debit normal
            purchaseVat += line.vatAmount || 0;
          }
        }
      });
    });

    return { code, salesNet, salesVat, purchaseNet, purchaseVat };
  });

  const totalSalesVat = vatSummary.reduce((s, i) => s + i.salesVat, 0);
  const totalPurchaseVat = vatSummary.reduce((s, i) => s + i.purchaseVat, 0);
  const netVatPayable = totalSalesVat - totalPurchaseVat;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">Financial Reports</h2>
          <p className="text-muted-foreground">Real-time financial statements.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
          <TabsTrigger value="vat">VAT Return</TabsTrigger>
        </TabsList>

        <div ref={reportRef} className="bg-background p-4 rounded-lg">
        {/* Profit & Loss Content */}
        <TabsContent value="pnl" className="space-y-4 mt-0">
          <Card className="max-w-3xl mx-auto shadow-sm print:shadow-none border-none">
            <CardHeader className="text-center border-b pb-6">
              <CardTitle className="text-2xl font-serif">Profit & Loss Statement</CardTitle>
              <CardDescription>Emerald Tech Solutions Ltd</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">For the period ending {format(new Date(), "dd MMM yyyy")}</p>
            </CardHeader>
            <CardContent className="pt-8 px-8">
              <Table>
                <TableBody>
                  <TableRow className="hover:bg-transparent font-bold text-lg border-b-2">
                    <TableCell>Revenue</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                  {revenueAccounts.map(acc => {
                    const bal = -1 * getAccountBalance(acc.id);
                    if (bal === 0) return null;
                    return (
                      <TableRow key={acc.id} className="hover:bg-transparent border-0">
                        <TableCell className="pl-8 py-1">{acc.name}</TableCell>
                        <TableCell className="text-right py-1 font-mono">{fmt(bal)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="hover:bg-transparent font-bold bg-muted/20">
                    <TableCell>Total Revenue</TableCell>
                    <TableCell className="text-right font-mono">{fmt(totalRevenue)}</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent h-8 border-0"><TableCell colSpan={2}></TableCell></TableRow>

                  <TableRow className="hover:bg-transparent font-bold text-lg border-b-2">
                    <TableCell>Expenses</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                  {expenseAccounts.map(acc => {
                    const bal = getAccountBalance(acc.id);
                    if (bal === 0) return null;
                    return (
                      <TableRow key={acc.id} className="hover:bg-transparent border-0">
                        <TableCell className="pl-8 py-1">{acc.name}</TableCell>
                        <TableCell className="text-right py-1 font-mono">{fmt(bal)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="hover:bg-transparent font-bold bg-muted/20">
                    <TableCell>Total Expenses</TableCell>
                    <TableCell className="text-right font-mono">{fmt(totalExpenses)}</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent h-8 border-0"><TableCell colSpan={2}></TableCell></TableRow>

                  <TableRow className="hover:bg-transparent font-bold text-xl border-t-4 border-double">
                    <TableCell>Net Profit</TableCell>
                    <TableCell className={`text-right font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {fmt(netProfit)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet Content */}
        <TabsContent value="bs" className="space-y-4 mt-0">
          <Card className="max-w-3xl mx-auto shadow-sm border-none">
            <CardHeader className="text-center border-b pb-6">
              <CardTitle className="text-2xl font-serif">Balance Sheet</CardTitle>
              <CardDescription>Emerald Tech Solutions Ltd</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">As at {format(new Date(), "dd MMM yyyy")}</p>
            </CardHeader>
            <CardContent className="pt-8 px-8">
               <Table>
                <TableBody>
                  {/* Assets */}
                  <TableRow className="hover:bg-transparent font-bold text-lg border-b-2">
                    <TableCell>Assets</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                  {assetAccounts.map(acc => {
                    const bal = getAccountBalance(acc.id);
                    if (bal === 0) return null;
                    return (
                      <TableRow key={acc.id} className="hover:bg-transparent border-0">
                        <TableCell className="pl-8 py-1">{acc.name}</TableCell>
                        <TableCell className="text-right py-1 font-mono">{fmt(bal)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="hover:bg-transparent font-bold bg-muted/20">
                    <TableCell>Total Assets</TableCell>
                    <TableCell className="text-right font-mono">{fmt(totalAssets)}</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent h-8 border-0"><TableCell colSpan={2}></TableCell></TableRow>

                  {/* Liabilities */}
                  <TableRow className="hover:bg-transparent font-bold text-lg border-b-2">
                    <TableCell>Liabilities</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                  {liabilityAccounts.map(acc => {
                    const bal = -1 * getAccountBalance(acc.id); // Show as positive number for report
                    if (bal === 0) return null;
                    return (
                      <TableRow key={acc.id} className="hover:bg-transparent border-0">
                        <TableCell className="pl-8 py-1">{acc.name}</TableCell>
                        <TableCell className="text-right py-1 font-mono">{fmt(bal)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="hover:bg-transparent font-bold bg-muted/20">
                    <TableCell>Total Liabilities</TableCell>
                    <TableCell className="text-right font-mono">{fmt(totalLiabilities)}</TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent h-8 border-0"><TableCell colSpan={2}></TableCell></TableRow>

                  {/* Equity */}
                  <TableRow className="hover:bg-transparent font-bold text-lg border-b-2">
                    <TableCell>Equity</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                  {equityAccounts.map(acc => {
                    const bal = -1 * getAccountBalance(acc.id);
                    if (bal === 0) return null;
                    return (
                      <TableRow key={acc.id} className="hover:bg-transparent border-0">
                        <TableCell className="pl-8 py-1">{acc.name}</TableCell>
                        <TableCell className="text-right py-1 font-mono">{fmt(bal)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell className="pl-8 py-1">Current Year Earnings</TableCell>
                    <TableCell className="text-right py-1 font-mono">{fmt(netProfit)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent font-bold bg-muted/20">
                    <TableCell>Total Equity</TableCell>
                    <TableCell className="text-right font-mono">{fmt(totalEquity + netProfit)}</TableCell>
                  </TableRow>
                  
                  <TableRow className="hover:bg-transparent h-8 border-0"><TableCell colSpan={2}></TableCell></TableRow>

                   <TableRow className="hover:bg-transparent font-bold text-lg border-t-4 border-double">
                    <TableCell>Total Liabilities & Equity</TableCell>
                    <TableCell className="text-right font-mono">{fmt(totalLiabilities + totalEquity + netProfit)}</TableCell>
                  </TableRow>
                  
                  {Math.abs(balanceCheck) > 0.01 && (
                     <TableRow className="hover:bg-transparent text-destructive">
                      <TableCell>Balance Check (Diff)</TableCell>
                      <TableCell className="text-right font-mono">{fmt(balanceCheck)}</TableCell>
                    </TableRow>
                  )}

                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VAT Report */}
        <TabsContent value="vat" className="space-y-4 mt-0">
          <Card className="max-w-4xl mx-auto shadow-sm border-none">
             <CardHeader className="text-center border-b pb-6">
              <CardTitle className="text-2xl font-serif">VAT Return Summary</CardTitle>
              <CardDescription>Emerald Tech Solutions Ltd</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                 <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sales VAT (T1)</h4>
                    <p className="text-2xl font-mono mt-2">{fmt(totalSalesVat)}</p>
                 </div>
                 <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Purchase VAT (T2)</h4>
                    <p className="text-2xl font-mono mt-2">{fmt(totalPurchaseVat)}</p>
                 </div>
                 <div className={`p-4 rounded-lg border-2 ${netVatPayable > 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-emerald-50 border-emerald-200'}`}>
                    <h4 className="text-sm font-medium text-foreground uppercase tracking-wider">Net Payable (T3)</h4>
                    <p className={`text-3xl font-mono font-bold mt-2 ${netVatPayable > 0 ? 'text-destructive' : 'text-emerald-700'}`}>
                      {fmt(netVatPayable)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {netVatPayable > 0 ? "You owe Revenue" : "Revenue owes you"}
                    </span>
                 </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VAT Rate</TableHead>
                    <TableHead className="text-right">Sales Net</TableHead>
                    <TableHead className="text-right">Sales VAT</TableHead>
                    <TableHead className="text-right">Purchases Net</TableHead>
                    <TableHead className="text-right">Purchases VAT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatSummary.map((row) => (
                    <TableRow key={row.code.id}>
                      <TableCell className="font-medium">{row.code.description} ({(row.code.rate * 100).toFixed(1)}%)</TableCell>
                      <TableCell className="text-right font-mono">{fmt(row.salesNet)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(row.salesVat)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(row.purchaseNet)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(row.purchaseVat)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
