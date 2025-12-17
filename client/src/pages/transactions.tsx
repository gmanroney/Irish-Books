import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useSearch } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction-form";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const { transactions, accounts } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const search = useSearch();

  useEffect(() => {
    if (search && search.includes("new=true")) {
      setIsDialogOpen(true);
    }
  }, [search]);

  // Helper to get account name
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || id;

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">Transactions</h2>
          <p className="text-muted-foreground">Manage your bookkeeping entries.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Transaction</DialogTitle>
              <DialogDescription>
                Choose a guided flow or use advanced journal entry.
              </DialogDescription>
            </DialogHeader>
            <TransactionForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((t) => {
              // Calculate total amount (sum of positive debits usually)
              const totalAmount = t.lines.reduce((sum, line) => sum + line.debit, 0);
              
              return (
                <TableRow key={t.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium font-mono text-xs">
                    {format(new Date(t.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{t.description}</div>
                    <div className="text-xs text-muted-foreground hidden group-hover:block transition-all mt-1">
                      {t.lines.length} journal lines
                    </div>
                  </TableCell>
                  <TableCell>
                    {t.reference ? (
                      <Badge variant="outline" className="font-mono text-[10px]">{t.reference}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{t.source}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    €{totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
