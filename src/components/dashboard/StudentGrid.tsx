import { students, getStatusColor } from "@/data/dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

const statusDotMap: Record<string, string> = {
  "status-red": "bg-status-red",
  "status-yellow": "bg-status-yellow",
  "status-green": "bg-status-green",
  "status-blue": "bg-status-blue",
};

const strokeColorMap: Record<string, string> = {
  "status-red": "hsl(var(--status-red))",
  "status-yellow": "hsl(var(--status-yellow))",
  "status-green": "hsl(var(--status-green))",
  "status-blue": "hsl(var(--status-blue))",
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
            const sparkData = student.weeklyProgress.map((v, i) => ({
              i,
              v,
            }));

            return (
              <Tooltip key={student.id}>
                <TooltipTrigger asChild>
                  <div className="cursor-default rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${statusDotMap[colorToken]}`}
                      />
                      <span className="truncate text-sm font-medium text-card-foreground">
                        {student.name}
                      </span>
                    </div>
                    <div className="h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={strokeColorMap[colorToken]}
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{student.name}</p>
                  <p>Status: {student.status}</p>
                  <p>Attendance: {student.attendanceRate}%</p>
                  <p>
                    Assignments: {student.assignmentsSubmitted.length}/4
                    submitted
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
