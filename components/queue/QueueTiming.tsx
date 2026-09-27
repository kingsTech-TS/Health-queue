"use client";

import { CalendarClock, Clock, DoorOpen, TimerOff } from "lucide-react";
import { cn, formatTime, parseServerDate } from "@/lib/utils";

export interface QueueTimingInput {
  start_datetime?: string | null;
  end_datetime?: string | null;
  time_per_student_minutes?: number | null;
  already_joined?: boolean;
  my_position?: number | null;
}

type Phase = "upcoming" | "open" | "closed" | "unknown";

// Suggest arriving a little before the estimated turn.
const ARRIVE_EARLY_MINUTES = 10;

export function getQueueTiming(status: QueueTimingInput, now = new Date()) {
  const start = parseServerDate(status.start_datetime);
  const end = parseServerDate(status.end_datetime);
  const perStudent = status.time_per_student_minutes || 0;

  let phase: Phase = "unknown";
  if (start && now < start) phase = "upcoming";
  else if (end && now >= end) phase = "closed";
  else if (start) phase = "open";

  // my_position counts the student themself, so position 1 is next in line.
  const ahead =
    status.already_joined && status.my_position != null
      ? Math.max(0, status.my_position - 1)
      : null;

  let expectedAt: Date | null = null;
  let arriveBy: Date | null = null;
  if (ahead != null && start && perStudent > 0) {
    const base = now > start ? now : start;
    expectedAt = new Date(base.getTime() + ahead * perStudent * 60_000);
    const early = new Date(expectedAt.getTime() - ARRIVE_EARLY_MINUTES * 60_000);
    arriveBy = early < start ? start : early < now ? now : early;
  }

  return {
    phase,
    start,
    end,
    ahead,
    expectedAt,
    arriveBy,
    waitMinutes: ahead != null ? ahead * perStudent : null,
    pastClosing: Boolean(expectedAt && end && expectedAt >= end),
  };
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function dayLabel(date: Date, now = new Date()) {
  if (sameDay(date, now)) return "Today";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
}

export function QueueTimingPanel({
  status,
  className,
}: {
  status: QueueTimingInput;
  className?: string;
}) {
  const timing = getQueueTiming(status);
  const { phase, start, end, expectedAt, arriveBy } = timing;
  if (!start) return null;

  const hours = `${dayLabel(start)}, ${formatTime(start)}${end ? ` – ${formatTime(end)}` : ""}`;
  const phaseStyles = {
    upcoming: { tone: "border-blue-200 bg-blue-50 text-blue-900", icon: <CalendarClock size={16} className="text-blue-600" />, label: `Opens ${dayLabel(start).replace(/^(Today|Tomorrow)$/, (d) => d.toLowerCase())} at ${formatTime(start)}` },
    open: { tone: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: <DoorOpen size={16} className="text-emerald-600" />, label: end ? `Open now until ${formatTime(end)}` : "Open now" },
    closed: { tone: "border-slate-200 bg-slate-50 text-slate-700", icon: <TimerOff size={16} className="text-slate-500" />, label: "This session has closed" },
    unknown: { tone: "border-slate-200 bg-slate-50 text-slate-700", icon: <Clock size={16} className="text-slate-500" />, label: "Queue session" },
  }[phase];

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("flex items-start gap-2.5 rounded-lg border p-3", phaseStyles.tone)}>
        <span className="mt-0.5 shrink-0">{phaseStyles.icon}</span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{phaseStyles.label}</p>
          <p className="text-xs opacity-80">Queue hours: {hours}</p>
        </div>
      </div>

      {expectedAt && arriveBy && phase !== "closed" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <div className="flex items-start gap-2.5">
            <Clock size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                {timing.ahead === 0
                  ? "You're next — please be at the health center now"
                  : `Please arrive by ${formatTime(arriveBy)}`}
              </p>
              <p className="text-xs opacity-80">
                Your turn is expected around{" "}
                <span className="font-semibold">
                  {sameDay(expectedAt, new Date()) ? "" : `${dayLabel(expectedAt)}, `}
                  {formatTime(expectedAt)}
                </span>
                {timing.ahead != null && timing.ahead > 0 && (
                  <> ({timing.ahead} student{timing.ahead === 1 ? "" : "s"} ahead, ~{timing.waitMinutes} min)</>
                )}
                . Times are estimates and may change.
              </p>
              {timing.pastClosing && (
                <p className="mt-1 text-xs font-medium text-red-700">
                  Your estimated turn is after the queue closes. Contact the
                  health center if you are not called.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
