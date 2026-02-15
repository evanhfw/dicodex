import { useState, useMemo } from "react";
import { ParsedStudent, ParsedStudentStatus, calculateAverageProgress, getStatusColor } from "@/data/parsedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AllStudentsViewProps {
  students: ParsedStudent[];
}

type SortOption = "name-asc" | "name-desc" | "status" | "progress-asc" | "progress-desc";

const statusDotMap: Record<string, string> = {
  "status-red": "bg-status-red",
  "status-yellow": "bg-status-yellow",
  "status-green": "bg-status-green",
  "status-blue": "bg-status-blue",
};

const statusPriority: Record<ParsedStudentStatus, number> = {
  "Special Attention": 1,
  "Lagging": 2,
  "Ideal": 3,
  "Ahead": 4,
};

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getStatusLabel = (status: ParsedStudentStatus | null): string => {
  if (!status) return "Unknown";
  return status;
};

const AllStudentsView = ({ students }: AllStudentsViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ParsedStudentStatus>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((student) =>
        student.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter((student) => student.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "status": {
          const aPriority = a.status ? statusPriority[a.status] : 999;
          const bPriority = b.status ? statusPriority[b.status] : 999;
          return aPriority - bPriority;
        }
        case "progress-asc": {
          const aProgress = calculateAverageProgress(a.courses);
          const bProgress = calculateAverageProgress(b.courses);
          return aProgress - bProgress;
        }
        case "progress-desc": {
          const aProgress = calculateAverageProgress(a.courses);
          const bProgress = calculateAverageProgress(b.courses);
          return bProgress - aProgress;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [students, searchQuery, statusFilter, sortBy]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          All Students View
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "All" | ParsedStudentStatus)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Special Attention">Special Attention</SelectItem>
              <SelectItem value="Lagging">Lagging</SelectItem>
              <SelectItem value="Ideal">Ideal</SelectItem>
              <SelectItem value="Ahead">Ahead</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="progress-asc">Progress (Low-High)</SelectItem>
              <SelectItem value="progress-desc">Progress (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredAndSortedStudents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "All"
                ? "No students found matching your filters"
                : "No students available"}
            </p>
          ) : (
            filteredAndSortedStudents.map((student, index) => {
              const isExpanded = expandedIndex === index;
              const avgProgress = calculateAverageProgress(student.courses);
              const completedCourses = student.courses.filter((c) => c.status === "Completed").length;
              const statusColor = getStatusColor(student.status);
              const statusBgColor = statusDotMap[statusColor] || "bg-muted";

              return (
                <div key={`${student.name}-${index}`}>
                  <div
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md border px-4 py-3 transition-colors",
                      student.status === "Special Attention" && "bg-status-red/5 border-status-red/20 hover:bg-status-red/10",
                      student.status === "Lagging" && "bg-status-yellow/5 border-status-yellow/20 hover:bg-status-yellow/10",
                      student.status === "Ideal" && "bg-status-green/5 border-status-green/20 hover:bg-status-green/10",
                      student.status === "Ahead" && "bg-status-blue/5 border-status-blue/20 hover:bg-status-blue/10",
                      !student.status && "bg-muted/5 border-border hover:bg-muted/10"
                    )}
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={student.imageUrl} alt={student.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-card-foreground truncate">
                            {student.name}
                          </span>
                          {student.status && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                student.status === "Special Attention" && "bg-status-red/15 text-status-red",
                                student.status === "Lagging" && "bg-status-yellow/15 text-status-yellow",
                                student.status === "Ideal" && "bg-status-green/15 text-status-green",
                                student.status === "Ahead" && "bg-status-blue/15 text-status-blue"
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full", statusBgColor)} />
                              {getStatusLabel(student.status)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>
                            {completedCourses}/{student.courses.length} courses
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span>{avgProgress}% avg</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>

                  {/* Expanded course list */}
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className={cn(
                        "ml-2 mt-1 space-y-1 border-l-2 pl-3",
                        student.status === "Special Attention" && "border-status-red/20",
                        student.status === "Lagging" && "border-status-yellow/20",
                        student.status === "Ideal" && "border-status-green/20",
                        student.status === "Ahead" && "border-status-blue/20",
                        !student.status && "border-border"
                      )}>
                        <div className="mb-2 px-3 py-1 text-xs text-muted-foreground">
                          {completedCourses} of {student.courses.length} courses completed
                        </div>
                        {student.courses.map((course, courseIndex) => (
                          <div key={courseIndex} className="rounded-md px-3 py-2">
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
                                      course.status === "Completed"
                                        ? "bg-status-green"
                                        : course.status === "In Progress"
                                        ? "bg-status-yellow"
                                        : "bg-status-red"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AllStudentsView;
