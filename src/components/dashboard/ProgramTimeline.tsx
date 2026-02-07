import { programTimeline } from "@/data/dashboardData";
import { CalendarDays } from "lucide-react";

const ProgramTimeline = () => {
  const { startDate, endDate, today, totalDays } = programTimeline;
  const elapsed = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progress = Math.round((elapsed / totalDays) * 100);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">
          Program Timeline
        </h2>
        <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Day {elapsed} of {totalDays} — {progress}% Journey
        </span>
      </div>

      {/* Progress track */}
      <div className="relative mt-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Today marker */}
        <div
          className="absolute -top-1 flex flex-col items-center"
          style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
        >
          <div className="h-5 w-0.5 bg-primary" />
          <span className="mt-0.5 text-[10px] font-semibold text-primary">
            TODAY
          </span>
        </div>
      </div>

      {/* Date labels */}
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>
    </div>
  );
};

export default ProgramTimeline;
