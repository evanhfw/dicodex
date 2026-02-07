import ProgramTimeline from "@/components/dashboard/ProgramTimeline";
import KpiCards from "@/components/dashboard/KpiCards";
import CriticalList from "@/components/dashboard/CriticalList";
import AttendanceChart from "@/components/dashboard/AttendanceChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-card-foreground">
          <span className="text-primary">Coding Camp</span> — Cohort Dashboard
        </h1>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* 1. Program Timeline */}
        <ProgramTimeline />

        {/* 2. KPI Summary */}
        <KpiCards />

        {/* 3–4. Critical List + Attendance Chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CriticalList />
          <AttendanceChart />
        </div>
      </main>
    </div>
  );
};

export default Index;
