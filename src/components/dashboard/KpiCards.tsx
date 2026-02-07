import { getStatusCounts } from "@/data/dashboardData";
import { AlertTriangle, TrendingDown, CheckCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const kpiConfig = [
  {
    key: "Special Attention" as const,
    label: "Need Special Attention",
    icon: AlertTriangle,
    colorClass: "text-status-red",
    bgClass: "bg-status-red/10",
    borderClass: "border-status-red/30",
  },
  {
    key: "Lagging" as const,
    label: "Lagging Behind",
    icon: TrendingDown,
    colorClass: "text-status-yellow",
    bgClass: "bg-status-yellow/10",
    borderClass: "border-status-yellow/30",
  },
  {
    key: "Ideal" as const,
    label: "On Ideal Schedule",
    icon: CheckCircle,
    colorClass: "text-status-green",
    bgClass: "bg-status-green/10",
    borderClass: "border-status-green/30",
  },
  {
    key: "Ahead" as const,
    label: "Ahead of Schedule",
    icon: Zap,
    colorClass: "text-status-blue",
    bgClass: "bg-status-blue/10",
    borderClass: "border-status-blue/30",
  },
];

const KpiCards = () => {
  const counts = getStatusCounts();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpiConfig.map(({ key, label, icon: Icon, colorClass, bgClass, borderClass }) => (
        <Card key={key} className={`${borderClass} border-2`}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
              <Icon className={`h-6 w-6 ${colorClass}`} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${colorClass}`}>{counts[key]}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KpiCards;
