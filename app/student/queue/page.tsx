"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest, formatDateTime } from "@/lib/utils";
import { StatusBadge, ErrorState, TableSkeleton, PageHeader, Button } from "@/components/ui/shared";
import { toast } from "sonner";

interface QueueStatus {
  session_id?: string;
  queue_type?: string;
  title?: string;
  status?: string;
  total_students?: number;
  max_students?: number;
  current_number?: number;
  is_eligible?: boolean;
  already_joined?: boolean;
  my_position?: number | null;
  my_queue_number?: number | null;
  start_datetime?: string;
  end_datetime?: string;
  time_per_student_minutes?: number;
}

type QueueType = "lab_test" | "physical_registration" | "physical_exam";

const queueTypes: { key: QueueType; label: string; desc: string }[] = [
  { key: "lab_test", label: "Laboratory Test", desc: "Queue for laboratory tests" },
  { key: "physical_registration", label: "Physical Registration", desc: "Queue for physical registration" },
  { key: "physical_exam", label: "Physical Examination", desc: "Queue for physical examination" },
];

function QueueCard({ qt, status, onJoin, joining }: {
  qt: { key: QueueType; label: string; desc: string };
  status: QueueStatus | null;
  onJoin: (type: QueueType) => void;
  joining: boolean;
}) {
  const active = status?.status === "active";
  const alreadyIn = status?.already_joined;
  const position = status?.my_position;
  const queueNum = status?.my_queue_number;
  const current = status?.current_number;
  const ahead = position != null && current != null ? Math.max(0, position - 1) : null;
  const eta = ahead != null && status?.time_per_student_minutes
    ? ahead * status.time_per_student_minutes
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{qt.label}</h3>
          <p className="text-xs text-slate-500">{qt.desc}</p>
        </div>
        <StatusBadge variant={active ? "success" : "muted"}>
          {status?.status ?? "No session"}
        </StatusBadge>
      </div>

      {alreadyIn && queueNum != null ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-600 font-medium mb-1">Your Number</p>
              <p className="text-3xl font-bold text-emerald-700">#{String(queueNum).padStart(3, "0")}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 font-medium mb-1">Now Serving</p>
              <p className="text-3xl font-bold text-slate-700">#{String(current ?? 0).padStart(3, "0")}</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Ahead of you</p>
              <p className="font-semibold text-slate-800">{ahead ?? "—"}</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Est. wait</p>
              <p className="font-semibold text-slate-800">{eta != null ? `~${eta} min` : "—"}</p>
            </div>
          </div>
        </div>
      ) : active && status?.is_eligible ? (
        <Button
          onClick={() => onJoin(qt.key)}
          loading={joining}
          className="w-full"
        >
          Join Queue
        </Button>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">
          {active ? "You are not eligible for this queue" : "No active session"}
        </p>
      )}
    </div>
  );
}

export default function StudentQueuePage() {
  const [statuses, setStatuses] = useState<Record<string, QueueStatus | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [joiningType, setJoiningType] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const results = await Promise.all(
        queueTypes.map(async (qt) => {
          try {
            const s = await apiRequest<QueueStatus>(`/api/queues/status/${qt.key}`);
            return { key: qt.key, status: s };
          } catch {
            return { key: qt.key, status: null };
          }
        })
      );
      const map: Record<string, QueueStatus | null> = {};
      results.forEach(({ key, status }) => { map[key] = status; });
      setStatuses(map);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const joinQueue = async (queueType: QueueType) => {
    setJoiningType(queueType);
    try {
      await apiRequest(`/api/queues/join-active/${queueType}`, { method: "POST" });
      toast.success("You have joined the queue!");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to join queue");
    } finally {
      setJoiningType(null);
    }
  };

  return (
    <AuthenticatedLayout title="Queue Status">
      <PageHeader title="Queue Status" subtitle="View and join available queues" />

      {loading ? (
        <TableSkeleton rows={3} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queueTypes.map((qt) => (
            <QueueCard
              key={qt.key}
              qt={qt}
              status={statuses[qt.key] ?? null}
              onJoin={joinQueue}
              joining={joiningType === qt.key}
            />
          ))}
        </div>
      )}
    </AuthenticatedLayout>
  );
}
