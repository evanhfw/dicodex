import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { useStudentData } from "@/contexts/StudentDataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgramTimeline from "@/components/dashboard/ProgramTimeline";
import KpiCards from "@/components/dashboard/KpiCards";
import AllStudentsView from "@/components/dashboard/AllStudentsView";
import CourseProgressTable from "@/components/dashboard/CourseProgressTable";
import AssignmentOverview from "@/components/dashboard/AssignmentOverview";
import DailyCheckinOverview from "@/components/dashboard/DailyCheckinOverview";

const Dashboard = () => {
  const { studentData, clearStudentData, hasData, isLoading } = useStudentData();
  const navigate = useNavigate();

  // Redirect to upload page if no data
  useEffect(() => {
    if (!isLoading && !hasData()) {
      navigate('/');
    }
  }, [isLoading, hasData, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return null;
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all student data? This action cannot be undone.')) {
      clearStudentData();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold text-card-foreground">
              <span className="text-primary">Coding Camp</span> — Cohort Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {studentData.totalStudents} Students
              </span>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearData}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Data Info Banner */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
              <p className="text-sm text-muted-foreground">
                Viewing data parsed on{' '}
                <span className="font-medium text-foreground">
                  {new Date(studentData.parsedAt).toLocaleString()}
                </span>
              </p>
              {studentData.students?.[0]?.lastUpdatedDicoding && (
                <>
                  <div className="hidden h-4 w-px bg-border sm:block" />
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Last updated in Dicoding:{' '}
                    <span className="font-medium text-foreground">
                      {studentData.students[0].lastUpdatedDicoding}
                    </span>
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 1. Program Timeline */}
        <ProgramTimeline mentor={studentData.mentor} />

        {/* 2. KPI Summary */}
        <KpiCards students={studentData.students} />

        {/* 3. Course Progress Table */}
        <CourseProgressTable students={studentData.students} />

        {/* 4. Assignment Overview */}
        <AssignmentOverview students={studentData.students} />

        {/* 5. Daily Check-in Overview */}
        <DailyCheckinOverview students={studentData.students} />

        {/* 6. All Students View */}
        <AllStudentsView students={studentData.students} />
      </main>
    </div>
  );
};

export default Dashboard;
