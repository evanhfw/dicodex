import { getUnsubmittedCounts } from "@/data/dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning } from "lucide-react";

const CriticalList = () => {
  const unsubmitted = getUnsubmittedCounts();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileWarning className="h-5 w-5 text-primary" />
          Unsubmitted Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {unsubmitted.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-md border bg-secondary/50 px-4 py-3"
          >
            <span className="text-sm font-medium text-card-foreground">
              {item.name}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                item.pending >= 6
                  ? "bg-status-red/15 text-status-red"
                  : item.pending >= 3
                  ? "bg-status-yellow/15 text-status-yellow"
                  : "bg-status-green/15 text-status-green"
              }`}
            >
              {item.pending} Pending
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CriticalList;
