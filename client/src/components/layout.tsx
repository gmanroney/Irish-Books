import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  Settings, 
  PlusCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useMobile();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/reports", label: "Reports", icon: PieChart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <span className="text-lg">€</span>
            </div>
            <span>Irish LtdCo</span>
          </div>
          <button 
            className="ml-auto lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-4 text-xs text-sidebar-foreground/60">
            <p className="font-semibold text-sidebar-foreground">Emerald Tech Solutions Ltd</p>
            <p className="mt-1">VAT: IE 1234567T</p>
            <p>Year End: 31 Dec</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-foreground font-heading">
              {navItems.find(i => i.href === location)?.label || "Irish LtdCo Books"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/transactions?new=true">
               <Button size="sm" className="gap-2 shadow-sm font-medium">
                 <PlusCircle className="h-4 w-4" />
                 New Transaction
               </Button>
             </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-muted/30 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
