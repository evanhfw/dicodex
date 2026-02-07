import { useState } from "react";
import { getUnsubmittedCounts, getStudentsForAssignment, getStatusColor } from "@/data/dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

const statusDotMap: Record<string, string> = {
  "status-red": "bg-status-red",
  "status-yellow": "bg-status-yellow",
  "status-green": "bg-status-green",
  "status-blue": "bg-status-blue",
};

const CriticalList = () => {
  const unsubmitted = getUnsubmittedCounts();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileWarning className="h-5 w-5 text-primary" />
          Unsubmitted Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {unsubmitted.map((item) => {
          const isExpanded = expandedId === item.id;
          const students = isExpanded ? getStudentsForAssignment(item.id) : [];

          return (
            <div key={item.id}>
              <div
                className="flex cursor-pointer items-center justify-between rounded-md border bg-secondary/50 px-4 py-3 transition-colors hover:bg-secondary/80"
                onClick={() => toggleExpand(item.id)}
              >
                <span className="text-sm font-medium text-card-foreground">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
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
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
              </div>

              {/* Expanded student list */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="ml-2 mt-1 space-y-1 border-l-2 border-border pl-3">
                    {students.map((student) => {
                      const colorToken = getStatusColor(student.status);
                      return (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 rounded-md px-3 py-2"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block h-2 w-2 rounded-full ${statusDotMap[colorToken]}`}
                              />
                              <span className="truncate text-sm text-card-foreground">
                                {student.name}
                              </span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-medium text-muted-foreground">
                              {student.progress}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CriticalList;
