import { students, assignments, getStatusColor } from "@/data/dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const statusDotMap: Record<string, string> = {
  "status-red": "bg-status-red",
  "status-yellow": "bg-status-yellow",
  "status-green": "bg-status-green",
  "status-blue": "bg-status-blue",
};

const statusBorderMap: Record<string, string> = {
  "status-red": "border-status-red/30",
  "status-yellow": "border-status-yellow/30",
  "status-green": "border-status-green/30",
  "status-blue": "border-status-blue/30",
};

const StudentGrid = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Student Overview
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            ({students.length} students)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {students.map((student) => {
            const colorToken = getStatusColor(student.status);
            const completedCount = student.assignmentsSubmitted.length;
            const totalAssignments = assignments.length;
            const completionPct = Math.round(
              (completedCount / totalAssignments) * 100
            );

            return (
              <Tooltip key={student.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "cursor-default rounded-lg border-2 bg-card p-3 transition-shadow hover:shadow-md",
                      statusBorderMap[colorToken]
                    )}
                  >
                    {/* Name + status dot */}
                    <div className="mb-2.5 flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${statusDotMap[colorToken]}`}
                      />
                      <span className="truncate text-sm font-medium text-card-foreground">
                        {student.name}
                      </span>
                    </div>

                    {/* Assignment completion dots */}
                    <div className="mb-2 flex items-center gap-1.5">
                      {assignments.map((a) => {
                        const submitted = student.assignmentsSubmitted.includes(a.id);
                        return (
                          <div
                            key={a.id}
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded",
                              submitted
                                ? "bg-status-green/15 text-status-green"
                                : "bg-status-red/15 text-status-red"
                            )}
                          >
                            {submitted ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </div>
                        );
                      })}
                      <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
                        {completedCount}/{totalAssignments}
                      </span>
                    </div>

                    {/* Attendance bar */}
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            student.attendanceRate >= 85
                              ? "bg-status-green"
                              : student.attendanceRate >= 70
                              ? "bg-status-yellow"
                              : "bg-status-red"
                          )}
                          style={{ width: `${student.attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {student.attendanceRate}%
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{student.name}</p>
                  <p>Status: {student.status}</p>
                  <p>Attendance: {student.attendanceRate}%</p>
                  <p>
                    Assignments: {completedCount}/{totalAssignments} submitted ({completionPct}%)
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentGrid;
