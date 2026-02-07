import { useState } from "react";
import { getStatusCounts, getStudentsByStatus, StudentStatus } from "@/data/dashboardData";
import { AlertTriangle, TrendingDown, CheckCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const kpiConfig = [
  {
    key: "Special Attention" as const,
    label: "Need Special Attention",
    icon: AlertTriangle,
    colorClass: "text-status-red",
    bgClass: "bg-status-red/10",
    borderClass: "border-status-red/30",
    hoverClass: "hover:border-status-red/60",
  },
  {
    key: "Lagging" as const,
    label: "Lagging Behind",
    icon: TrendingDown,
    colorClass: "text-status-yellow",
    bgClass: "bg-status-yellow/10",
    borderClass: "border-status-yellow/30",
    hoverClass: "hover:border-status-yellow/60",
  },
  {
    key: "Ideal" as const,
    label: "On Ideal Schedule",
    icon: CheckCircle,
    colorClass: "text-status-green",
    bgClass: "bg-status-green/10",
    borderClass: "border-status-green/30",
    hoverClass: "hover:border-status-green/60",
  },
  {
    key: "Ahead" as const,
    label: "Ahead of Schedule",
    icon: Zap,
    colorClass: "text-status-blue",
    bgClass: "bg-status-blue/10",
    borderClass: "border-status-blue/30",
    hoverClass: "hover:border-status-blue/60",
  },
];

const KpiCards = () => {
  const counts = getStatusCounts();
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | null>(null);

  const selectedConfig = selectedStatus
    ? kpiConfig.find((c) => c.key === selectedStatus)
    : null;
  const selectedStudents = selectedStatus ? getStudentsByStatus(selectedStatus) : [];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiConfig.map(({ key, label, icon: Icon, colorClass, bgClass, borderClass, hoverClass }) => (
          <Card
            key={key}
            className={cn(
              "cursor-pointer border-2 transition-all",
              borderClass,
              hoverClass,
              "hover:shadow-md"
            )}
            onClick={() => setSelectedStatus(key)}
          >
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

      <Dialog open={selectedStatus !== null} onOpenChange={(open) => !open && setSelectedStatus(null)}>
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", selectedConfig?.colorClass)}>
              {selectedConfig && <selectedConfig.icon className="h-5 w-5" />}
              {selectedConfig?.label}
            </DialogTitle>
            <DialogDescription>
              {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} in this category
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-2">
            {selectedStudents.map((student) => (
              <div
                key={student.id}
                className={cn(
                  "rounded-lg border-2 bg-card p-3",
                  selectedConfig?.borderClass
                )}
              >
                <p className="font-medium text-card-foreground">{student.name}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>Attendance:</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          student.attendanceRate >= 85
                            ? "bg-status-green"
                            : student.attendanceRate >= 70
                            ? "bg-status-yellow"
                            : "bg-status-red"
                        )}
                        style={{ width: `${student.attendanceRate}%` }}
                      />
                    </div>
                    <span className="font-medium">{student.attendanceRate}%</span>
                  </div>
                  <div>
                    Assignments: <span className="font-medium">{student.assignmentsSubmitted}/{student.totalAssignments}</span>
                  </div>
                </div>
              </div>
            ))}

            {selectedStudents.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No students in this category
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KpiCards;
