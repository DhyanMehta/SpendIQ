import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  trend,
  trendUp,
  className,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        "rounded-[1.5rem] border-none shadow-sm hover:shadow-md transition-shadow duration-300",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
        {trend && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                trendUp
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700",
              )}
            >
              {trendUp ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
