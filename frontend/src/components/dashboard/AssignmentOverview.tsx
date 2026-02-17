import { useState, useMemo } from "react";
import { ParsedStudent, getAssignmentStats } from "@/data/parsedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClipboardList, CheckCircle2, XCircle, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentOverviewProps {
  students: ParsedStudent[];
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const AssignmentOverview = ({ students }: AssignmentOverviewProps) => {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const stats = useMemo(() => getAssignmentStats(students), [students]);

  // Overall stats
  const totalAssignments = stats.length;
  const overallCompletion = useMemo(() => {
    if (stats.length === 0) return 0;
    const totalCompleted = stats.reduce((sum, s) => sum + s.completed, 0);
    const totalPossible = stats.reduce((sum, s) => sum + s.totalStudents, 0);
    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  }, [stats]);

  // Students who haven't completed the selected assignment
  const uncompletedStudents = useMemo(() => {
    if (!selectedAssignment) return [];
    return students
      .filter(s => {
        const assignment = (s.assignments || []).find(a => a.name === selectedAssignment);
        return assignment && assignment.status !== "Completed";
      })
      .map(s => ({
        name: s.name,
        photoUrl: s.profile?.photoUrl || s.imageUrl || "",
        university: s.profile?.university || "",
        status: s.status,
      }));
  }, [selectedAssignment, students]);

  if (stats.length === 0) {
    return null; // Don't render if no assignment data
  }

  // Shorten assignment name for display
  const shortenName = (name: string) => {
    // Remove "Assignment Soft Skill X " prefix for short display
    return name.replace(/^Assignment\s+Soft\s+Skill\s+\d+\s*/i, "SS" + (name.match(/\d+/)?.[0] || "") + ": ");
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assignment Overview
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{totalAssignments} assignments</span>
            <span>•</span>
            <span>
              <span className={cn("font-semibold", overallCompletion >= 70 ? "text-status-green" : overallCompletion >= 40 ? "text-status-yellow" : "text-status-red")}>
                {overallCompletion}%
              </span>{" "}
              overall completion
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.map((assignment) => {
            const completionRate = assignment.completionRate;
            return (
              <div
                key={assignment.name}
                className="group flex items-center gap-3 rounded-lg border px-4 py-3 transition-all cursor-pointer hover:bg-muted/50 hover:border-primary/30"
                onClick={() => setSelectedAssignment(assignment.name)}
              >
                {/* Completion rate badge */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    completionRate === 100
                      ? "bg-status-green/15 text-status-green"
                      : completionRate >= 50
                      ? "bg-status-yellow/15 text-status-yellow"
                      : "bg-status-red/15 text-status-red"
                  )}
                >
                  {completionRate}%
                </div>

                {/* Assignment info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {shortenName(assignment.name)}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-status-green" />
                      {assignment.completed} completed
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-status-red" />
                      {assignment.uncompleted} pending
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        completionRate === 100
                          ? "bg-status-green"
                          : completionRate >= 50
                          ? "bg-status-yellow"
                          : "bg-status-red"
                      )}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Dialog: Students who haven't completed the assignment */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-5 w-5 text-status-red" />
              Uncompleted Students
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedAssignment && shortenName(selectedAssignment)}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {uncompletedStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-status-green mb-2" />
                <p className="text-sm font-medium text-card-foreground">All students completed!</p>
                <p className="text-xs text-muted-foreground">Every student has finished this assignment</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-2 text-xs text-muted-foreground border-b">
                  <Users className="h-3.5 w-3.5" />
                  <span>{uncompletedStudents.length} student{uncompletedStudents.length > 1 ? "s" : ""} haven't completed</span>
                </div>
                {uncompletedStudents.map((student) => (
                  <div
                    key={student.name}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={student.photoUrl} alt={student.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {student.name}
                      </p>
                      {student.university && (
                        <p className="text-xs text-muted-foreground truncate">
                          {student.university}
                        </p>
                      )}
                    </div>
                    {student.status && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0",
                          student.status === "Special Attention" && "bg-status-red/15 text-status-red",
                          student.status === "Lagging" && "bg-status-yellow/15 text-status-yellow",
                          student.status === "Ideal" && "bg-status-green/15 text-status-green",
                          student.status === "Ahead" && "bg-status-blue/15 text-status-blue"
                        )}
                      >
                        {student.status}
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssignmentOverview;
