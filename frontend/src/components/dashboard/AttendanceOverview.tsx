import { useState, useMemo } from "react";
import { ParsedStudent, ParsedStudentStatus, getAttendanceStats } from "@/data/parsedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceOverviewProps {
  students: ParsedStudent[];
}

type SortField = "event" | "attendanceRate" | "attending" | "absent";
type SortDirection = "asc" | "desc";

const AttendanceOverview = ({ students }: AttendanceOverviewProps) => {
  const [sortField, setSortField] = useState<SortField>("event");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const stats = useMemo(() => getAttendanceStats(students), [students]);

  const sortedEvents = useMemo(() => {
    const sorted = [...stats];
    sorted.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case "event": aVal = a.event; bVal = b.event; break;
        case "attendanceRate": aVal = a.attendanceRate; bVal = b.attendanceRate; break;
        case "attending": aVal = a.attending; bVal = b.attending; break;
        case "absent": aVal = a.absent; bVal = b.absent; break;
        default: aVal = a.event; bVal = b.event;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [stats, sortField, sortDirection]);

  const absentStudents = useMemo(() => {
    if (!expandedEvent) return [];
    return students
      .filter(s => {
        const att = (s.attendances || []).find(a => a.event === expandedEvent);
        return att && att.status !== "Attending";
      })
      .map(s => ({ name: s.name, status: s.status }));
  }, [expandedEvent, students]);

  const attendingStudents = useMemo(() => {
    if (!expandedEvent) return [];
    return students
      .filter(s => {
        const att = (s.attendances || []).find(a => a.event === expandedEvent);
        return att && att.status === "Attending";
      })
      .map(s => ({ name: s.name, status: s.status }));
  }, [expandedEvent, students]);

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

  const totalEvents = stats.length;
  const avgAttendanceRate = totalEvents > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.attendanceRate, 0) / totalEvents)
    : 0;
  const fullAttendance = stats.filter(s => s.attendanceRate === 100).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Attendance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary KPIs */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-2xl font-bold text-card-foreground">{totalEvents}</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className={cn(
              "text-2xl font-bold",
              avgAttendanceRate >= 80 ? "text-status-green" : avgAttendanceRate >= 60 ? "text-status-yellow" : "text-status-red"
            )}>
              {avgAttendanceRate}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Attendance</div>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-2xl font-bold text-status-green">{fullAttendance}</div>
            <div className="text-xs text-muted-foreground">Full Attendance</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-xs font-medium whitespace-nowrap">
                  <SortButton field="event">Event</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium whitespace-nowrap">
                  <SortButton field="attendanceRate">Attendance</SortButton>
                </th>
                <th className="pb-3 text-center text-xs font-medium whitespace-nowrap">
                  <SortButton field="attending">Status</SortButton>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event, index) => {
                const isExpanded = expandedEvent === event.event;

                return (
                  <>
                    <tr
                      key={index}
                      className={cn(
                        "border-b last:border-b-0 transition-colors cursor-pointer",
                        isExpanded ? "bg-muted/30" : "hover:bg-muted/50"
                      )}
                      onClick={() => setExpandedEvent(isExpanded ? null : event.event)}
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
                              isExpanded && "rotate-180"
                            )}
                          />
                          <p className="text-sm font-medium text-card-foreground truncate max-w-[200px] sm:max-w-none">
                            {event.event}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                event.attendanceRate === 100
                                  ? "bg-status-green"
                                  : event.attendanceRate >= 70
                                  ? "bg-status-yellow"
                                  : "bg-status-red"
                              )}
                              style={{ width: `${event.attendanceRate}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-medium text-muted-foreground">
                            {event.attendanceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-status-green">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{event.attending}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-status-red">
                            <XCircle className="h-3 w-3" />
                            <span>{event.absent}</span>
                          </div>
                        </div>
                      </td>
                    </tr>

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
                                {/* Absent Students */}
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-status-red mb-3 flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Absent ({absentStudents.length})
                                  </h4>

                                  {absentStudents.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-status-green border rounded-md bg-card/50">
                                      <CheckCircle2 className="h-4 w-4" />
                                      All present!
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                      {absentStudents.map((student, idx) => (
                                        <div
                                          key={`absent-${idx}`}
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

                                {/* Attending Students */}
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-status-green mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Attending ({attendingStudents.length})
                                  </h4>

                                  {attendingStudents.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground border rounded-md bg-card/50">
                                      No students attended this event.
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                      {attendingStudents.map((student, idx) => (
                                        <div
                                          key={`attending-${idx}`}
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

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-status-green" />
            <span>Attending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3 w-3 text-status-red" />
            <span>Absent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceOverview;
