import { useState } from "react";
import { ParsedStudent, ParsedStudentStatus, getStatusCounts, getStudentsByStatus, calculateAverageProgress } from "@/data/parsedData";
import { AlertTriangle, TrendingDown, CheckCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  students: ParsedStudent[];
}

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

const KpiCards = ({ students }: KpiCardsProps) => {
  const counts = getStatusCounts(students);
  const [selectedStatus, setSelectedStatus] = useState<ParsedStudentStatus | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ParsedStudent | null>(null);

  const selectedConfig = selectedStatus
    ? kpiConfig.find((c) => c.key === selectedStatus)
    : null;
  const selectedStudents = selectedStatus ? getStudentsByStatus(students, selectedStatus) : [];

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
            {selectedStudents.map((student, index) => {
              const avgProgress = calculateAverageProgress(student.courses);
              const completedCourses = student.courses.filter(c => c.status === "Completed").length;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "cursor-pointer rounded-lg border-2 bg-card p-3 transition-colors hover:bg-muted/30",
                    selectedConfig?.borderClass
                  )}
                  onClick={() => setSelectedStudent(student)}
                >
                  <p className="font-medium text-card-foreground">{student.name}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>Avg Progress:</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            avgProgress >= 80
                              ? "bg-status-green"
                              : avgProgress >= 50
                              ? "bg-status-yellow"
                              : "bg-status-red"
                          )}
                          style={{ width: `${avgProgress}%` }}
                        />
                      </div>
                      <span className="font-medium">{avgProgress}%</span>
                    </div>
                    <div>
                      Completed: <span className="font-medium">{completedCourses}/{student.courses.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {selectedStudents.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No students in this category
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Course Detail Dialog */}
      <Dialog open={selectedStudent !== null} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name} - Course Progress</DialogTitle>
            <DialogDescription>
              {selectedStudent && (() => {
                const completedCount = selectedStudent.courses.filter(c => c.status === "Completed").length;
                const avgProgress = calculateAverageProgress(selectedStudent.courses);
                return `${completedCount}/${selectedStudent.courses.length} courses completed • ${avgProgress}% average progress`;
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-2">
            {selectedStudent?.courses.map((course, index) => {
              const progress = parseFloat(course.progress.replace('%', ''));
              const statusColors = {
                "Completed": "bg-status-green/15 text-status-green border-status-green/30",
                "In Progress": "bg-status-yellow/15 text-status-yellow border-status-yellow/30",
                "Not Started": "bg-status-red/15 text-status-red border-status-red/30",
              };
              
              return (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-card-foreground line-clamp-2">
                      {course.name}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={cn("shrink-0 text-xs", statusColors[course.status])}
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          progress >= 70
                            ? "bg-status-green"
                            : progress >= 40
                            ? "bg-status-yellow"
                            : "bg-status-red"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {course.progress}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KpiCards;
