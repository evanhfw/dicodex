import { useState } from "react";
import { ParsedStudent, getStudentsByStatus, calculateAverageProgress, getStatusColor } from "@/data/parsedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CriticalListProps {
  students: ParsedStudent[];
}

const statusDotMap: Record<string, string> = {
  "status-red": "bg-status-red",
  "status-yellow": "bg-status-yellow",
  "status-green": "bg-status-green",
  "status-blue": "bg-status-blue",
};

const CriticalList = ({ students }: CriticalListProps) => {
  const criticalStudents = getStudentsByStatus(students, "Special Attention");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-status-red" />
          Students Needing Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {criticalStudents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No students need special attention at this time
          </p>
        ) : (
          criticalStudents.map((student, index) => {
            const isExpanded = expandedIndex === index;
            const avgProgress = calculateAverageProgress(student.courses);
            const completedCourses = student.courses.filter(c => c.status === "Completed").length;

            return (
              <div key={index}>
                <div
                  className="flex cursor-pointer items-center justify-between rounded-md border bg-status-red/5 border-status-red/20 px-4 py-3 transition-colors hover:bg-status-red/10"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-red/20">
                      <User className="h-3 w-3 text-status-red" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      {student.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-status-red/15 text-status-red">
                      {avgProgress}% Avg
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </div>

                {/* Expanded course list */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="ml-2 mt-1 space-y-1 border-l-2 border-status-red/20 pl-3">
                      <div className="mb-2 px-3 py-1 text-xs text-muted-foreground">
                        {completedCourses} of {student.courses.length} courses completed
                      </div>
                      {student.courses.map((course, courseIndex) => (
                        <div
                          key={courseIndex}
                          className="rounded-md px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-card-foreground truncate">
                                {course.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {course.status}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    course.status === "Completed" ? "bg-status-green" :
                                    course.status === "In Progress" ? "bg-status-yellow" :
                                    "bg-status-red"
                                  )}
                                  style={{ width: course.progress }}
                                />
                              </div>
                              <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                                {course.progress}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalList;
