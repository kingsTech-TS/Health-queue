"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, getGreeting, formatDateTime, cn } from "@/lib/utils";
import { StatCard, CardSkeleton, ErrorState, StatusBadge, Button } from "@/components/ui/shared";
import {
  Users, Clock, CheckCircle2, AlertCircle, FlaskConical,
  Stethoscope, ArrowRight, UserCheck, Play, Eye
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
  created_at?: string;
}

interface StaffStats {
  students_today: number;
  waiting: number;
  attended: number;
  missed: number;
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StaffStats>({
    students_today: 0,
    waiting: 0,
    attended: 0,
    missed: 0,
  });
  const [activeQueue, setActiveQueue] = useState<QueueEntry[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callingNext, setCallingNext] = useState(false);

  const isLabAttendant = user?.sub_role === "lab_attendant";
  const queueType = isLabAttendant ? "lab" : "registration";
  const staffRoleTitle = isLabAttendant ? "Lab Attendant" : "Registering Nurse";

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch queue stats / session
      try {
        const session = await apiRequest<any>(`/api/queues/sessions/active/${queueType}`);
        setActiveSession(session);
        if (session && session.id) {
          const entries = await apiRequest<QueueEntry[]>(`/api/queues/sessions/${session.id}/entries`);
          setActiveQueue(entries || []);

          const todayCount = entries?.length || 0;
          const waitingCount = entries?.filter((e) => e.status === "waiting").length || 0;
          const attendedCount = entries?.filter((e) => e.status === "completed").length || 0;
          const missedCount = entries?.filter((e) => e.status === "missed").length || 0;

          setStats({
            students_today: todayCount,
            waiting: waitingCount,
            attended: attendedCount,
            missed: missedCount,
          });
        }
      } catch (err: any) {
        // Fallback to queue status endpoint
        try {
          const queueData = await apiRequest<any>(`/api/queues/status/${queueType}`);
          if (queueData) {
            setStats({
              students_today: queueData.total_today || 0,
              waiting: queueData.waiting_count || 0,
              attended: queueData.completed_count || 0,
              missed: queueData.missed_count || 0,
            });
          }
        } catch {}
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleCallNext = async () => {
    if (!activeSession?.id) {
      toast.error("No active queue session found. Please configure a session first.");
      return;
    }
    try {
      setCallingNext(true);
      const called = await apiRequest<any>(`/api/queues/sessions/${activeSession.id}/call-next`, {
        method: "POST",
      });
      toast.success(`Calling Queue #${called?.queue_number || "Next"}!`);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to call next student");
    } finally {
      setCallingNext(false);
    }
  };

  const currentCalled = activeQueue.find((e) => e.status === "called");

  return (
    <AuthenticatedLayout title="Staff Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                {staffRoleTitle}
              </span>
              <span className="text-xs text-slate-400">• Health Center Staff</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {getGreeting()}, {user?.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isLabAttendant
                ? "Manage blood tests, specimen collection, and antibiotic sensitivity."
                : "Manage physical examinations, biometric verification, and registration queues."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/staff/queue">
              <Button variant="secondary" size="md">
                Manage Queue
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              onClick={handleCallNext}
              loading={callingNext}
            >
              <Play size={15} className="mr-1 fill-white" />
              Call Next Student
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState onRetry={loadDashboardData} description={error} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Students Today"
              value={stats.students_today}
              sub="Scheduled or queued"
              icon={<Users size={18} />}
            />
            <StatCard
              label="Waiting"
              value={stats.waiting}
              sub="In queue right now"
              icon={<Clock size={18} />}
            />
            <StatCard
              label="Attended"
              value={stats.attended}
              sub="Successfully completed"
              icon={<CheckCircle2 size={18} />}
            />
            <StatCard
              label="Missed"
              value={stats.missed}
              sub="Did not respond"
              icon={<AlertCircle size={18} />}
            />
          </div>
        )}

        {/* Now Serving Banner (Prompt #25) */}
        {currentCalled && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">QUEUE</span>
                  <span className="text-2xl font-black">#{String(currentCalled.queue_number).padStart(3, "0")}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-400/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/20">
                      NOW SERVING
                    </span>
                    <span className="text-xs text-emerald-100">{currentCalled.department || "Student"}</span>
                  </div>
                  <h3 className="text-xl font-bold mt-0.5">{currentCalled.student_name || "Enrolled Student"}</h3>
                  <p className="text-xs text-emerald-100">
                    {currentCalled.hc_number ? `HC Number: ${currentCalled.hc_number}` : ""} {currentCalled.matric_number ? `• Matric: ${currentCalled.matric_number}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/staff/students/${currentCalled.matric_number || currentCalled.id}`}>
                  <Button variant="secondary" size="md" className="bg-white text-emerald-800 border-none font-semibold hover:bg-emerald-50">
                    <Eye size={15} className="mr-1.5" />
                    Open Record
                  </Button>
                </Link>
                <Link href="/staff/queue">
                  <Button variant="ghost" size="md" className="text-white hover:bg-white/10">
                    Queue Actions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Live Queue Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Queue Session</h2>
              <p className="text-xs text-slate-500">Live roster for {staffRoleTitle}</p>
            </div>
            <Link
              href="/staff/queue"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Full Queue View
              <ArrowRight size={13} />
            </Link>
          </div>

          {activeQueue.length === 0 ? (
            <div className="py-12 text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <UserCheck size={22} />
              </div>
              <p className="text-sm font-medium text-slate-700">No active students in queue</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Students will populate here once a queue session is started or when students join for verification.
              </p>
              <div className="mt-4">
                <Link href="/staff/queue">
                  <Button variant="outline" size="sm">
                    Configure / Start Queue
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Queue #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Identifier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeQueue.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{String(item.queue_number).padStart(3, "0")}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{item.student_name || "Student"}</p>
                        <p className="text-xs text-slate-400">{item.department || "Undergraduate"}</p>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        {item.hc_number || item.matric_number || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          variant={
                            item.status === "completed"
                              ? "success"
                              : item.status === "called"
                              ? "warning"
                              : item.status === "missed"
                              ? "danger"
                              : "pending"
                          }
                        >
                          {item.status}
                        </StatusBadge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/staff/students/${item.matric_number || item.id}`}>
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/staff/students"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Users size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Student Directory</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search students by name, matric number, or Health Center ID.
            </p>
          </Link>

          <Link
            href="/staff/pink-files"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              {isLabAttendant ? <FlaskConical size={20} /> : <Stethoscope size={20} />}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Digital Pink Files</h3>
            <p className="text-xs text-slate-500 mt-1">
              Access comprehensive university medical registration records.
            </p>
          </Link>

          <Link
            href="/staff/activity"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Clock size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Operational Activity</h3>
            <p className="text-xs text-slate-500 mt-1">
              Review history of attended queue calls and saved examinations.
            </p>
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
