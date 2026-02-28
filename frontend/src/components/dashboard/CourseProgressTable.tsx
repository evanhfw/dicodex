import { useState, useMemo } from "react";
import { ParsedStudent, getCourseStats, getStudentsByCourse } from "@/data/parsedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, CheckCircle, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseProgressTableProps {
  students: ParsedStudent[];
}

type SortField = "name" | "averageProgress" | "completionRate" | "totalEnrolled";
type SortDirection = "asc" | "desc";

const CourseProgressTable = ({ students }: CourseProgressTableProps) => {
  const [sortField, setSortField] = useState<SortField>("averageProgress");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [studentSortDirection, setStudentSortDirection] = useState<'asc' | 'desc'>('asc');

  const courseStats = useMemo(() => getCourseStats(students), [students]);

  const sortedCourses = useMemo(() => {
    const sorted = [...courseStats];
    sorted.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "averageProgress":
          aValue = a.averageProgress;
          bValue = b.averageProgress;
          break;
        case "completionRate":
          aValue = a.completionRate;
          bValue = b.completionRate;
          break;
        case "totalEnrolled":
          aValue = a.totalEnrolled;
          bValue = b.totalEnrolled;
          break;
        default:
          aValue = a.completionRate;
          bValue = b.completionRate;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [courseStats, sortField, sortDirection]);

  const enrolledStudents = useMemo(() => {
    if (!expandedCourse) return [];
    const studentsData = getStudentsByCourse(students, expandedCourse);
    return studentSortDirection === 'desc' 
      ? studentsData.sort((a, b) => b.courseProgress - a.courseProgress)
      : studentsData.sort((a, b) => a.courseProgress - b.courseProgress);
  }, [students, expandedCourse, studentSortDirection]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5 text-primary" />
          Course Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-xs font-medium whitespace-nowrap">
                  <SortButton field="name">Course Name</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium whitespace-nowrap">
                  <SortButton field="totalEnrolled">Enrolled</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium whitespace-nowrap">
                  <SortButton field="completionRate">Completion Rate</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium whitespace-nowrap">
                  <SortButton field="averageProgress">Avg Progress</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedCourses.map((course, index) => {
                const isExpanded = expandedCourse === course.name;
                
                return (
                  <>
                    <tr
                      key={index}
                      className={cn(
                        "border-b last:border-b-0 transition-colors cursor-pointer",
                        isExpanded ? "bg-muted/30" : "hover:bg-muted/50"
                      )}
                      onClick={() => setExpandedCourse(isExpanded ? null : course.name)}
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ChevronDown 
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
                              isExpanded && "rotate-180"
                            )}
                          />
                          <p className="text-sm font-medium text-card-foreground">
                            {course.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-sm text-muted-foreground">
                          {course.totalEnrolled}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                course.completionRate >= 70
                                  ? "bg-status-green"
                                  : course.completionRate >= 40
                                  ? "bg-status-yellow"
                                  : "bg-status-red"
                              )}
                              style={{ width: `${course.completionRate}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                            {course.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                course.averageProgress >= 70
                                  ? "bg-status-green"
                                  : course.averageProgress >= 40
                                  ? "bg-status-yellow"
                                  : "bg-status-red"
                              )}
                              style={{ width: `${course.averageProgress}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                            {course.averageProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-status-green">
                            <CheckCircle className="h-3 w-3" />
                            <span>{course.completed}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-status-yellow">
                            <TrendingUp className="h-3 w-3" />
                            <span>{course.inProgress}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-status-red">
                            <Clock className="h-3 w-3" />
                            <span>{course.notStarted}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable student detail section */}
                    <tr key={`${index}-expanded`}>
                      <td colSpan={5} className="p-0">
                        <div
                          className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          )}
                        >
                          <div className="overflow-hidden">
                            {isExpanded && (
                              <div className="border-t-2 border-muted bg-muted/20 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-card-foreground">
                                    Students Enrolled ({enrolledStudents.length})
                                  </h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStudentSortDirection(studentSortDirection === 'desc' ? 'asc' : 'desc');
                                    }}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    Sort by Progress
                                    <span className="font-semibold">{studentSortDirection === 'desc' ? '↓' : '↑'}</span>
                                  </button>
                                </div>
                                
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                  {enrolledStudents.map((studentData, idx) => {
                                    const statusColors = {
                                      "Completed": "bg-status-green/15 text-status-green border-status-green/30",
                                      "In Progress": "bg-status-yellow/15 text-status-yellow border-status-yellow/30",
                                      "Not Started": "bg-status-red/15 text-status-red border-status-red/30",
                                    };
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 rounded-md border bg-card p-2.5"
                                      >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <span className="text-sm font-medium text-card-foreground truncate">
                                            {studentData.studentName}
                                          </span>
                                          <Badge 
                                            variant="outline" 
                                            className={cn("shrink-0 text-xs", statusColors[studentData.courseStatus])}
                                          >
                                            {studentData.courseStatus}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto mt-1 sm:mt-0">
                                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                                            <div
                                              className={cn(
                                                "h-full rounded-full transition-all",
                                                studentData.courseProgress >= 70
                                                  ? "bg-status-green"
                                                  : studentData.courseProgress >= 40
                                                  ? "bg-status-yellow"
                                                  : "bg-status-red"
                                              )}
                                              style={{ width: `${studentData.courseProgress}%` }}
                                            />
                                          </div>
                                          <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                                            {studentData.courseProgress}%
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
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

        {sortedCourses.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No course data available
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3 text-status-green" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-status-yellow" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-status-red" />
            <span>Not Started</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgressTable;
