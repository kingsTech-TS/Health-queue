"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, formatDateTime } from "@/lib/utils";
import { StatusBadge, TableSkeleton, Modal, Button, FormField, Input, EmptyState } from "@/components/ui/shared";
import {
  CheckCircle2, XCircle, PhoneCall, Settings2,
  UserCheck, Eye, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface QueueEntry {
  id: string;
  queue_number: number;
  student_name?: string;
  matric_number?: string;
  hc_number?: string;
  level?: string;
  department?: string;
  status: "waiting" | "called" | "completed" | "missed";
  scheduled_time?: string;
}

interface ActiveSession {
  id: string;
  queue_type: string;
  title?: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  max_students?: number;
  start_datetime?: string;
  end_datetime?: string;
  time_per_student_minutes?: number;
}

export default function StaffQueuePage() {
  const { user } = useAuth();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Form states for queue configuration
  const [configForm, setConfigForm] = useState({
    max_students: 50,
    title: "",
    date: new Date().toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "16:00",
    minutes_per_student: 10,
  });

  const isLabAttendant = user?.sub_role === "lab_attendant";
  const queueType = isLabAttendant ? "lab_test" : "physical_registration";
  const pageTitle = isLabAttendant ? "Laboratory Queue" : "Registration Queue";

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const active = await apiRequest<ActiveSession>(`/api/queues/sessions/active/${queueType}`);
      setSession(active);

      if (active && active.id) {
        const queueEntries = await apiRequest<QueueEntry[]>(`/api/queues/sessions/${active.id}/entries`);
        setEntries(queueEntries || []);
      } else {
        setEntries([]);
      }
    } catch {
      setSession(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => { void fetchQueueData(); });
  }, [queueType]);

  const handleCreateOrUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading("config");
      const payload = {
        title: configForm.title || pageTitle,
        queue_type: queueType,
        max_students: Number(configForm.max_students),
        time_per_student_minutes: Number(configForm.minutes_per_student),
        start_datetime: new Date(`${configForm.date}T${configForm.start_time}:00`).toISOString(),
        end_datetime: new Date(`${configForm.date}T${configForm.end_time}:00`).toISOString(),
      };

      const res = await apiRequest<ActiveSession>("/api/queues/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Queue session created successfully!");
      setConfigModalOpen(false);
      setSession(res);
      await fetchQueueData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to configure queue session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCallNext = async () => {
    if (!session?.id) {
      toast.error("Please configure and start an active queue session first.");
      return;
    }
    try {
      setActionLoading("call-next");
      const called = await apiRequest<QueueEntry>(`/api/queues/sessions/${session.id}/call-next`, {
        method: "POST",
      });
      toast.success(`Now calling Queue #${called?.queue_number || "Next"}!`);
      fetchQueueData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to call next student");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteEntry = async (entryId: string) => {
    if (!session?.id) return;
    try {
      setActionLoading(entryId);
      await apiRequest(`/api/queues/sessions/${session.id}/entries/${entryId}/complete`, {
        method: "POST",
      });
      toast.success("Student marked as completed!");
      fetchQueueData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to complete entry");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkMissed = async (entryId: string) => {
    if (!session?.id) return;
    try {
      setActionLoading(entryId);
      await apiRequest(`/api/queues/sessions/${session.id}/entries/${entryId}/mark-missed`, {
        method: "POST",
      });
      toast.info("Student marked as missed.");
      fetchQueueData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to mark missed");
    } finally {
      setActionLoading(null);
    }
  };

  const currentServing = entries.find((e) => e.status === "called");

  return (
    <AuthenticatedLayout title={pageTitle}>
      <div className="space-y-6">
        {/* Top Header & Actions (Prompt #24) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{pageTitle}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {session ? "Queue session created and ready for students" : "No queue session configured"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfigModalOpen(true)}
            >
              <Settings2 size={14} className="mr-1.5" />
              Configure Queue
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCallNext}
              loading={actionLoading === "call-next"}
              disabled={!session || session.status !== "active"}
            >
              <PhoneCall size={14} className="mr-1.5" />
              Call Next
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchQueueData}
              title="Refresh Queue"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {session && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusBadge variant={session.status === "active" ? "success" : "warning"}>
                    {session.status === "active" ? "Active" : session.status}
                  </StatusBadge>
                  <span className="text-xs text-slate-400">Queue session created</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">{session.title || pageTitle}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDateTime(session.start_datetime)} - {formatDateTime(session.end_datetime)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center sm:min-w-56">
                <div className="rounded-lg bg-slate-50 px-4 py-2">
                  <p className="text-lg font-bold text-slate-900">{session.max_students ?? "-"}</p>
                  <p className="text-[11px] text-slate-500">Capacity</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-4 py-2">
                  <p className="text-lg font-bold text-slate-900">{session.time_per_student_minutes ?? "-"}</p>
                  <p className="text-[11px] text-slate-500">Minutes/student</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOW SERVING CARD (Prompt #25) */}
        {currentServing && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">NOW SERVING</span>
                  <span className="text-3xl font-black">#{String(currentServing.queue_number).padStart(3, "0")}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wide">
                      Active Consultation
                    </span>
                    <span className="text-xs text-emerald-100">{currentServing.level || "Undergraduate"}</span>
                  </div>
                  <h2 className="text-2xl font-bold mt-1">{currentServing.student_name || "Assigned Student"}</h2>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {currentServing.hc_number ? `HC Number: ${currentServing.hc_number}` : ""} {currentServing.department ? `• Department: ${currentServing.department}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link href={`/staff/students/${currentServing.matric_number || currentServing.id}`}>
                  <Button variant="secondary" size="md" className="bg-white text-emerald-800 font-bold border-none hover:bg-emerald-50">
                    <Eye size={15} className="mr-1.5" />
                    Open Student Record
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="md"
                  className="bg-emerald-700/80 text-white border-white/20 hover:bg-emerald-700"
                  onClick={() => handleCompleteEntry(currentServing.id)}
                  loading={actionLoading === currentServing.id}
                >
                  <CheckCircle2 size={15} className="mr-1.5" />
                  Mark Completed
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  className="text-red-100 hover:bg-red-500/20"
                  onClick={() => handleMarkMissed(currentServing.id)}
                  loading={actionLoading === currentServing.id}
                >
                  <XCircle size={15} className="mr-1.5" />
                  Mark Missed
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Queue Roster</h2>
              <p className="text-xs text-slate-500">All registered students in this session</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {entries.length} Students Total
            </span>
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={<UserCheck size={36} />}
              title="No students in queue"
              description="Configure and start a queue session, or wait for students to join for medical evaluation."
              action={
                <Button variant="primary" size="sm" onClick={() => setConfigModalOpen(true)}>
                  Configure Queue Now
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Queue #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">HC Number</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Scheduled</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={entry.status === "called" ? "bg-emerald-50/50" : "hover:bg-slate-50/80 transition"}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{String(entry.queue_number).padStart(3, "0")}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{entry.student_name || "Student"}</p>
                        <p className="text-xs text-slate-400 font-mono">{entry.matric_number || "—"}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700">
                        {entry.hc_number || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs">{entry.level || "100L"}</td>
                      <td className="py-3.5 px-4 text-xs">{entry.department || "General"}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          variant={
                            entry.status === "completed"
                              ? "success"
                              : entry.status === "called"
                              ? "warning"
                              : entry.status === "missed"
                              ? "danger"
                              : "pending"
                          }
                        >
                          {entry.status}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {entry.scheduled_time || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/staff/students/${entry.matric_number || entry.id}`}>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                              Open
                            </Button>
                          </Link>

                          {entry.status === "called" && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleCompleteEntry(entry.id)}
                                loading={actionLoading === entry.id}
                              >
                                Done
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
                                onClick={() => handleMarkMissed(entry.id)}
                                loading={actionLoading === entry.id}
                              >
                                Missed
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Configuration Modal (Prompt #24) */}
        <Modal
          open={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          title={`Configure ${pageTitle}`}
        >
          <form onSubmit={handleCreateOrUpdateSession} className="space-y-4">
            <FormField label="Session Title" required>
              <Input value={configForm.title} onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })} placeholder={pageTitle} required />
            </FormField>
            <FormField label="Queue Date" required>
              <Input
                type="date"
                value={configForm.date}
                onChange={(e) => setConfigForm({ ...configForm, date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Starting Time" required>
              <Input
                type="time"
                value={configForm.start_time}
                onChange={(e) => setConfigForm({ ...configForm, start_time: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Ending Time" required>
              <Input type="time" value={configForm.end_time} onChange={(e) => setConfigForm({ ...configForm, end_time: e.target.value })} required />
            </FormField>

            <FormField label="Maximum Number of Students" required>
              <Input
                type="number"
                min="1"
                max="500"
                value={configForm.max_students}
                onChange={(e) => setConfigForm({ ...configForm, max_students: Number(e.target.value) })}
                required
              />
            </FormField>

            <FormField label="Estimated Minutes per Student" required>
              <Input
                type="number"
                min="1"
                max="60"
                value={configForm.minutes_per_student}
                onChange={(e) => setConfigForm({ ...configForm, minutes_per_student: Number(e.target.value) })}
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfigModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={actionLoading === "config"}
              >
                Save Queue Session
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
}
