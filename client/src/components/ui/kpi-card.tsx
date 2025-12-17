import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  className?: string;
  warning?: boolean;
}

export function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  description,
  className,
  warning 
}: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden shadow-sm transition-all hover:shadow-md", warning && "border-destructive/50 bg-destructive/5", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", warning ? "text-destructive" : "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold font-mono tracking-tight", warning ? "text-destructive" : "text-foreground")}>
          {value}
        </div>
        {(trend || description) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span className={cn("font-medium mr-1", trendUp ? "text-emerald-600" : "text-destructive")}>
                {trend}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
