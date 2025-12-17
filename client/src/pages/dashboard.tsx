import { useAppStore } from "@/lib/store";
import { KpiCard } from "@/components/ui/kpi-card";
import { 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

export default function Dashboard() {
  const { getAccountBalance, transactions } = useAppStore();

  // Calculate KPIs
  // 1. Bank Balance (Sum of all Asset Bank accounts)
  // Assuming 1000 is the main one for now
  const bankBalance = getAccountBalance("acc_1000"); // Dr - Cr. Positive is good for Asset.

  // 2. Revenue YTD (Sum of 4xxx accounts) - Cr balance is positive revenue
  // Since getAccountBalance returns Dr-Cr, Revenue will be negative. We flip it.
  // We should actually sum up all transactions for revenue accounts.
  const revenueBalance = -1 * (getAccountBalance("acc_4000") + getAccountBalance("acc_4010"));

  // 3. Expenses YTD
  // Expenses are Dr positive.
  // Sum 5xxx and 6xxx
  const expenseBalance = 
    getAccountBalance("acc_5000") + 
    getAccountBalance("acc_6000") + 
    getAccountBalance("acc_6010") + 
    getAccountBalance("acc_6100") + 
    getAccountBalance("acc_6200") + 
    getAccountBalance("acc_6300") + 
    getAccountBalance("acc_6400") + 
    getAccountBalance("acc_6500") + 
    getAccountBalance("acc_6600") + 
    getAccountBalance("acc_6700") + 
    getAccountBalance("acc_6800");

  const netProfit = revenueBalance - expenseBalance;

  // 4. DLA Balance
  // Equity account. Credit balance (negative number from getAccountBalance) means company owes director (Good).
  // Debit balance (positive number) means director owes company (Bad - Overdrawn).
  const dlaRawBalance = getAccountBalance("acc_3200"); 
  const dlaIsOverdrawn = dlaRawBalance > 0;
  
  // Format currency
  const fmt = (n: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n);

  // Mock Chart Data (Monthly)
  const chartData = [
    { name: "Oct", revenue: 4000, expenses: 2400 },
    { name: "Nov", revenue: 3000, expenses: 1398 },
    { name: "Dec", revenue: 9800, expenses: 2000 },
    { name: "Jan", revenue: 2780, expenses: 3908 },
    { name: "Feb", revenue: 1890, expenses: 4800 },
    { name: "Mar", revenue: 2390, expenses: 3800 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Bank Balance"
          value={fmt(bankBalance)}
          icon={Wallet}
          description="Current Account"
          trend="+2.5%"
          trendUp={true}
        />
        <KpiCard
          title="Revenue YTD"
          value={fmt(revenueBalance)}
          icon={TrendingUp}
          description="Total Sales"
        />
        <KpiCard
          title="Expenses YTD"
          value={fmt(expenseBalance)}
          icon={TrendingDown}
          description="Operating Costs"
        />
        <KpiCard
          title="Net Profit"
          value={fmt(netProfit)}
          icon={Euro}
          description="Net Income"
          trendUp={netProfit > 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
            <CardDescription>Revenue vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `€${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="hsl(var(--muted-foreground)/0.3)" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          {/* DLA Warning Widget */}
          <Card className={cn("shadow-sm", dlaIsOverdrawn ? "border-destructive/20" : "")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                Director Loan Account
                {dlaIsOverdrawn && <AlertTriangle className="h-4 w-4 text-destructive" />}
              </CardTitle>
              <CardDescription>Current balance owed {dlaIsOverdrawn ? "BY Director" : "TO Director"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold font-mono mb-2", dlaIsOverdrawn ? "text-destructive" : "text-emerald-600")}>
                {fmt(Math.abs(dlaRawBalance))} {dlaIsOverdrawn ? "(Dr)" : "(Cr)"}
              </div>
              
              {dlaIsOverdrawn ? (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive-foreground">
                  <span className="font-semibold block mb-1 text-destructive">Warning: Overdrawn</span>
                  Potential BIK (Benefit in Kind) tax implications. Please consult your accountant immediately to clear this balance.
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Healthy state. The company owes you money. You can withdraw this tax-free.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/transactions?new=true&type=invoice">
                <Button variant="outline" className="w-full justify-start font-normal">
                  <ArrowRight className="mr-2 h-4 w-4" /> Issue Sales Invoice
                </Button>
              </Link>
              <Link href="/transactions?new=true&type=expense">
                <Button variant="outline" className="w-full justify-start font-normal">
                  <ArrowRight className="mr-2 h-4 w-4" /> Record Expense
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {transactions.slice(0, 5).map((t) => (
               <div key={t.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                 <div className="space-y-1">
                   <p className="text-sm font-medium leading-none">{t.description}</p>
                   <p className="text-xs text-muted-foreground">{format(new Date(t.date), "dd MMM yyyy")} • {t.source}</p>
                 </div>
                 <div className="font-mono text-sm font-medium">
                   {/* Just show the first line amount for simplicity in this view */}
                   €{t.lines[0].debit > 0 ? t.lines[0].debit.toFixed(2) : t.lines[0].credit.toFixed(2)}
                 </div>
               </div>
             ))}
             {transactions.length === 0 && (
               <p className="text-sm text-muted-foreground text-center py-4">No transactions found.</p>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
