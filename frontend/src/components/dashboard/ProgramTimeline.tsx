import { useState } from "react";
import { CalendarDays, ChevronDown, Flag, Calendar, CircleCheckBig } from "lucide-react";
import { cn } from "@/lib/utils";
import { MentorInfo } from "@/data/parsedData";
import {
  getLearningPath,
  getTimelineForPath,
  TimelineMilestone,
  MilestoneType,
} from "@/data/timelineData";

const milestoneIconMap: Record<MilestoneType, typeof Flag> = {
  deadline: Flag,
  event: Calendar,
  checkpoint: CircleCheckBig,
};

const milestoneColorMap: Record<MilestoneType, string> = {
  deadline: "text-status-red bg-status-red/10",
  event: "text-status-blue bg-status-blue/10",
  checkpoint: "text-status-green bg-status-green/10",
};

interface ProgramTimelineProps {
  mentor?: MentorInfo;
}

const ProgramTimeline = ({ mentor }: ProgramTimelineProps) => {
  const [expanded, setExpanded] = useState(false);

  const learningPath = getLearningPath(mentor?.group);
  const timeline = getTimelineForPath(learningPath);
  const { startDate, endDate, milestones } = timeline;

  const today = new Date();
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progress = Math.max(0, Math.min(100, Math.round((elapsed / totalDays) * 100)));

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

  const isPast = (d: Date) => d <= today;

  // Learning path badge label
  const pathLabel =
    learningPath !== "unknown"
      ? `${learningPath} Learning Path`
      : "Program Timeline";

  return (
    <div
      className="cursor-pointer rounded-lg border bg-card p-5 transition-shadow hover:shadow-md"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">
          Program Timeline
        </h2>
        {learningPath !== "unknown" && (
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {learningPath}
          </span>
        )}
        <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Day {Math.max(0, elapsed)} of {totalDays} — {progress}% Journey
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </div>

      {/* Progress track */}
      <div className="relative mt-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Milestone dots on track */}
        {milestones.map((m, i) => {
          const pos = Math.round(
            ((m.date.getTime() - startDate.getTime()) /
              (endDate.getTime() - startDate.getTime())) *
              100
          );
          return (
            <div
              key={i}
              className="absolute top-0.5"
              style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full border border-card",
                  isPast(m.date) ? "bg-primary" : "bg-muted-foreground/40"
                )}
              />
            </div>
          );
        })}

        {/* Today marker */}
        {progress > 0 && progress < 100 && (
          <div
            className="absolute -top-1 flex flex-col items-center"
            style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
          >
            <div className="h-5 w-0.5 bg-primary" />
            <span className="mt-0.5 text-[10px] font-semibold text-primary">
              TODAY
            </span>
          </div>
        )}
      </div>

      {/* Date labels */}
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>

      {/* Expanded milestones list */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="grid gap-2 sm:grid-cols-2">
            {milestones.map((m, i) => {
              const Icon = milestoneIconMap[m.type];
              const colorClass = milestoneColorMap[m.type];
              const past = isPast(m.date);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-md border px-3 py-2.5",
                    past ? "bg-secondary/50" : "bg-card"
                  )}
                >
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", colorClass)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium", past ? "text-muted-foreground" : "text-card-foreground")}>
                      {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(m.date)}
                    </p>
                  </div>
                  {past && (
                    <CircleCheckBig className="h-4 w-4 shrink-0 text-status-green" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramTimeline;
