import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: boolean;
  urgent?: boolean;
}

export function SummaryCard({ title, value, subtitle, icon: Icon, accent, urgent }: SummaryCardProps) {
  return (
    <Card className={urgent ? "border-red-400 bg-red-50" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${urgent ? "text-red-600" : accent ? "text-bank-accent" : "text-bank-primary"}`}>
              {value}
            </p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`p-2 rounded-md ${urgent ? "bg-red-100" : "bg-bank-primary/10"}`}>
              <Icon className={`h-5 w-5 ${urgent ? "text-red-600" : "text-bank-primary"}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
