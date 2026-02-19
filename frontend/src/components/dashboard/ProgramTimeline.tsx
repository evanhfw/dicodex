import { useState, useRef, useEffect } from "react";
import { CalendarDays, Flag, Calendar, CircleCheckBig, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { MentorInfo } from "@/data/parsedData";
import { Button } from "@/components/ui/button";
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
  deadline: "text-status-red bg-status-red/10 border-status-red",
  event: "text-status-blue bg-status-blue/10 border-status-blue",
  checkpoint: "text-status-green bg-status-green/10 border-status-green",
};

const milestoneBgMap: Record<MilestoneType, string> = {
  deadline: "bg-status-red",
  event: "bg-status-blue",
  checkpoint: "bg-status-green",
};

type ZoomLevel = 'week' | 'month' | 'all';

interface ProgramTimelineProps {
  mentor?: MentorInfo;
}

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getEndOfWeek = (date: Date) => {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

const getStartOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

const getEndOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

const ProgramTimeline = ({ mentor }: ProgramTimelineProps) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const learningPath = getLearningPath(mentor?.group);
  const timeline = getTimelineForPath(learningPath);
  let { startDate, endDate, milestones } = timeline;

  const today = new Date();

  // Progress calculations
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const overallProgress = Math.max(0, Math.min(100, Math.round((elapsed / totalDays) * 100)));

  // Filter based on zoom level
  let displayStartDate = startDate;
  let displayEndDate = endDate;

  if (zoomLevel === 'week') {
    displayStartDate = getStartOfWeek(today);
    displayEndDate = getEndOfWeek(today);
  } else if (zoomLevel === 'month') {
    displayStartDate = getStartOfMonth(today);
    displayEndDate = getEndOfMonth(today);
  }

  // Adjust display start/end dates with padding so nodes don't touch edges
  const rawTotalMs = displayEndDate.getTime() - displayStartDate.getTime();
  const padMs = zoomLevel === 'all' ? rawTotalMs * 0.05 : zoomLevel === 'month' ? rawTotalMs * 0.1 : rawTotalMs * 0.15;
  
  const viewStartMs = displayStartDate.getTime() - padMs;
  const viewEndMs = displayEndDate.getTime() + padMs;
  const viewTotalMs = viewEndMs - viewStartMs;

  const visibleMilestones = milestones.filter(m => {
    const mTime = m.date.getTime();
    return mTime >= displayStartDate.getTime() && mTime <= displayEndDate.getTime();
  });

  const isPast = (d: Date) => d <= today;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric", weekday: zoomLevel !== 'all' ? 'short' : undefined });
    
  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayPos = ((today.getTime() - viewStartMs) / viewTotalMs) * container.scrollWidth;
      container.scrollTo({
        left: todayPos - container.clientWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  // On mount or zoom change, try to scroll to today if it's in view
  useEffect(() => {
    const todayMs = today.getTime();
    if (todayMs >= viewStartMs && todayMs <= viewEndMs) {
      // Small timeout to let DOM render
      setTimeout(scrollToToday, 100);
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [zoomLevel, viewStartMs, viewEndMs]);

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">
            Program Timeline
          </h2>
          {learningPath !== "unknown" && (
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {learningPath}
            </span>
          )}
          <span className="ml-0 sm:ml-4 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary whitespace-nowrap">
            Day {Math.max(0, elapsed)} of {totalDays} — {overallProgress}% Journey
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-md border bg-muted/50 p-1">
            <button
              onClick={() => setZoomLevel('week')}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                zoomLevel === 'week' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
            >
              This Week
            </button>
            <button
              onClick={() => setZoomLevel('month')}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                zoomLevel === 'month' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
            >
              This Month
            </button>
            <button
              onClick={() => setZoomLevel('all')}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                zoomLevel === 'all' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
            >
              All Time
            </button>
          </div>
          
          <Button variant="outline" size="sm" onClick={scrollToToday} className="h-8 text-xs shrink-0">
            Today
          </Button>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-md border border-border/50 bg-accent/20">
        {/* Timeline Container */}
        <div 
          ref={scrollContainerRef}
          className="group/timeline relative w-full overflow-x-auto overflow-y-hidden pb-44 pt-28 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/60 hover:[&::-webkit-scrollbar-thumb]:bg-border"
        >
          {/* Timeline width is proportional to the number of visible items or just wide to spread them out */}
          <div className="relative h-2 min-w-[1200px]" style={{ width: zoomLevel === 'all' ? '250%' : zoomLevel === 'month' ? '150%' : '100%' }}>
            
            {/* The main continuous line */}
            <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-secondary">
               {/* Progress Fill if looking at All Time or if within bounds */}
               <div
                className="absolute h-full rounded-full bg-primary transition-all duration-500"
                style={{ 
                  left: 0,
                  width: `${Math.max(0, Math.min(100, ((today.getTime() - viewStartMs) / viewTotalMs) * 100))}%` 
                }}
              />
            </div>

            {/* Today Marker Line */}
            {today.getTime() >= viewStartMs && today.getTime() <= viewEndMs && (
              <div
                className="absolute top-1/2 flex flex-col items-center -translate-y-1/2 z-0"
                style={{
                  left: `${((today.getTime() - viewStartMs) / viewTotalMs) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  height: "120px"
                }}
              >
                <div className="rounded border bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background absolute -top-5">
                  TODAY
                </div>
                <div className="h-full w-0.5 border-l-2 border-dashed border-primary/60" />
              </div>
            )}

            {/* Milestones rendering */}
            {visibleMilestones.length === 0 ? (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                No milestones for this period
              </div>
            ) : (
              visibleMilestones.map((m, i) => {
                const isItemPast = isPast(m.date);
                const pos = ((m.date.getTime() - viewStartMs) / viewTotalMs) * 100;
                const Icon = milestoneIconMap[m.type];
                const colorTheme = milestoneColorMap[m.type];
                
                // Stagger up/down
                const isTop = i % 2 === 0;

                return (
                  <div
                    key={i}
                    className="group absolute top-1/2 z-10 flex cursor-pointer flex-col items-center hover:z-50"
                    style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
                  >
                    {/* The Icon */}
                    <div 
                      className={cn(
                        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm transition-transform duration-200 group-hover:scale-125", 
                        isItemPast ? "border-primary" : "border-muted-foreground/50",
                      )}
                      title={m.label}
                    >
                       <Icon className={cn("h-3.5 w-3.5", isItemPast ? "text-primary" : "text-muted-foreground/80")} />
                    </div>

                    {/* Vertical connector line */}
                     <div className={cn(
                        "absolute w-[2px] bg-border transition-all duration-300",
                        isTop ? "bottom-full mb-3 h-5" : "top-full mt-3 h-5",
                        isItemPast ? "bg-primary/30" : "",
                        // If all zoom, hide line by default and show on hover
                        zoomLevel === 'all' && "opacity-0 group-hover:opacity-100 group-hover:bg-border/60"
                     )} />

                    {/* Information Card */}
                    <div
                      className={cn(
                        "absolute left-1/2 w-48 -translate-x-1/2 rounded border bg-card p-2 text-card-foreground shadow focus-within:z-50 hover:shadow-md transition-all duration-300 pointer-events-none group-hover:pointer-events-auto",
                        isItemPast && "bg-muted/30 border-muted",
                        isTop ? "bottom-full mb-8" : "top-full mt-8",
                        // Visibility logic
                        zoomLevel === 'all'
                          ? cn(
                              "opacity-0 group-hover:opacity-100",
                              isTop ? "translate-y-2 group-hover:translate-y-0" : "-translate-y-2 group-hover:translate-y-0"
                            )
                          : cn(
                              "opacity-100",
                              isItemPast && "opacity-80 hover:opacity-100"
                            )
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className={cn("flex items-center justify-center rounded-sm p-0.5", colorTheme)}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="truncate">{m.type}</span>
                        {isItemPast && <CircleCheckBig className="ml-auto h-3 w-3 text-status-green" />}
                      </div>
                      <p className={cn("text-xs font-medium leading-snug line-clamp-2", isItemPast && "text-muted-foreground font-normal")}>
                        {m.label}
                      </p>
                      <div className="mt-1.5 text-[10px] text-muted-foreground/80 font-medium">
                        {formatDate(m.date)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramTimeline;
