import { useState, useMemo } from "react";
import { ParsedStudent, ParsedStudentStatus, getAssignmentStats } from "@/data/parsedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentOverviewProps {
  students: ParsedStudent[];
}

type SortField = "name" | "completionRate" | "completed" | "uncompleted";
type SortDirection = "asc" | "desc";

const AssignmentOverview = ({ students }: AssignmentOverviewProps) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

  const stats = useMemo(() => getAssignmentStats(students), [students]);

  const sortedAssignments = useMemo(() => {
    const sorted = [...stats];
    sorted.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case "name": aVal = a.name; bVal = b.name; break;
        case "completionRate": aVal = a.completionRate; bVal = b.completionRate; break;
        case "completed": aVal = a.completed; bVal = b.completed; break;
        case "uncompleted": aVal = a.uncompleted; bVal = b.uncompleted; break;
        default: aVal = a.name; bVal = b.name;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [stats, sortField, sortDirection]);

  // Students who haven't completed the expanded assignment
  const uncompletedStudents = useMemo(() => {
    if (!expandedAssignment) return [];
    return students
      .filter(s => {
        const a = (s.assignments || []).find(a => a.name === expandedAssignment);
        return a && a.status !== "Completed";
      })
      .map(s => ({
        name: s.name,
        status: s.status,
      }));
  }, [expandedAssignment, students]);

  // Students who have completed the expanded assignment
  const completedStudents = useMemo(() => {
    if (!expandedAssignment) return [];
    return students
      .filter(s => {
        const a = (s.assignments || []).find(a => a.name === expandedAssignment);
        return a && a.status === "Completed";
      })
      .map(s => ({
        name: s.name,
        status: s.status,
      }));
  }, [expandedAssignment, students]);

  if (stats.length === 0) return null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={cn(
        "flex items-center gap-1 hover:text-foreground transition-colors",
        sortField === field ? "text-foreground font-semibold" : "text-muted-foreground"
      )}
    >
      {children}
      {sortField === field && (
        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  );

  const statusBadgeStyles: Record<string, string> = {
    "Special Attention": "bg-status-red/15 text-status-red border-status-red/30",
    "Lagging": "bg-status-yellow/15 text-status-yellow border-status-yellow/30",
    "Ideal": "bg-status-green/15 text-status-green border-status-green/30",
    "Ahead": "bg-status-blue/15 text-status-blue border-status-blue/30",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-5 w-5 text-primary" />
          Assignment Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-xs font-medium">
                  <SortButton field="name">Assignment</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium">
                  <SortButton field="completionRate">Completion</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium">
                  <SortButton field="completed">Status</SortButton>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAssignments.map((assignment, index) => {
                const isExpanded = expandedAssignment === assignment.name;

                return (
                  <>
                    <tr
                      key={index}
                      className={cn(
                        "border-b last:border-b-0 transition-colors cursor-pointer",
                        isExpanded ? "bg-muted/30" : "hover:bg-muted/50"
                      )}
                      onClick={() => setExpandedAssignment(isExpanded ? null : assignment.name)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
                              isExpanded && "rotate-180"
                            )}
                          />
                          <p className="text-sm font-medium text-card-foreground">
                            {assignment.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                assignment.completionRate === 100
                                  ? "bg-status-green"
                                  : assignment.completionRate >= 50
                                  ? "bg-status-yellow"
                                  : "bg-status-red"
                              )}
                              style={{ width: `${assignment.completionRate}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                            {assignment.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-status-green">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{assignment.completed}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-status-red">
                            <XCircle className="h-3 w-3" />
                            <span>{assignment.uncompleted}</span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable student list */}
                    <tr key={`${index}-expanded`}>
                      <td colSpan={3} className="p-0">
                        <div
                          className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          )}
                        >
                          <div className="overflow-hidden">
                            {isExpanded && (
                              <div className="border-t-2 border-muted bg-muted/20 p-4 flex flex-col md:flex-row gap-6">
                                {/* Uncompleted Students */}
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-status-red mb-3 flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Uncompleted ({uncompletedStudents.length})
                                  </h4>

                                  {uncompletedStudents.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-status-green border rounded-md bg-card/50">
                                      <CheckCircle2 className="h-4 w-4" />
                                      All clear!
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                      {uncompletedStudents.map((student, idx) => (
                                        <div
                                          key={`uncompleted-${idx}`}
                                          className="flex items-center justify-between rounded-md border bg-card p-2.5 shadow-sm"
                                        >
                                          <span className="text-sm font-medium text-card-foreground truncate">
                                            {student.name}
                                          </span>
                                          {student.status && (
                                            <Badge
                                              variant="outline"
                                              className={cn("shrink-0 text-xs", statusBadgeStyles[student.status] || "")}
                                            >
                                              {student.status}
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Completed Students */}
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-status-green mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed ({completedStudents.length})
                                  </h4>

                                  {completedStudents.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground border rounded-md bg-card/50">
                                      No students have completed this yet.
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                      {completedStudents.map((student, idx) => (
                                        <div
                                          key={`completed-${idx}`}
                                          className="flex items-center justify-between rounded-md border bg-card p-2.5 shadow-sm"
                                        >
                                          <span className="text-sm font-medium text-card-foreground truncate">
                                            {student.name}
                                          </span>
                                          {student.status && (
                                            <Badge
                                              variant="outline"
                                              className={cn("shrink-0 text-xs", statusBadgeStyles[student.status] || "")}
                                            >
                                              {student.status}
                                            </Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {stats.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No assignment data available
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-status-green" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3 w-3 text-status-red" />
            <span>Uncompleted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentOverview;
