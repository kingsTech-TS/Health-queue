"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest, getGreeting, formatDateTime } from "@/lib/utils";
import { StatCard, ErrorState, CardSkeleton, PageHeader, StatusBadge, Button } from "@/components/ui/shared";
import { useAuth } from "@/contexts/AuthContext";
import { Users, UserCheck, UserX, Clock, FlaskConical, Stethoscope, Upload, UserPlus } from "lucide-react";
import { BulkStudentUploadModal } from "@/components/admin/BulkStudentUploadModal";
import Link from "next/link";

interface AdminStats {
  total_students: number;
  total_staff: number;
  active_staff: number;
  suspended_staff: number;
  pending_staff_approvals: number;
  pending_payment_verifications: number;
  pending_registrations: number;
  completed_registrations: number;
  lab_records_count: number;
  physical_exams_count: number;
  students_currently_in_queues: number;
  students_attended: number;
  students_missed: number;
  recent_activity_logs: Record<string, unknown>[];
  students_by_level: Record<string, number>;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiRequest<AdminStats>("/api/admin/dashboard-stats");
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { queueMicrotask(() => { void load(); }); }, []);

  const greeting = `${getGreeting()}, Administrator`;

  return (
    <AuthenticatedLayout title="Admin Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{greeting}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Health Center Registration Overview</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
          >
            <Upload size={14} className="mr-1.5" />
            Upload Students
          </Button>

          <Link href="/admin/students">
            <Button variant="outline" size="sm">
              <Users size={14} className="mr-1.5" />
              Manage Students
            </Button>
          </Link>
        </div>
      </div>

      <BulkStudentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={load}
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4,5,6,7,8].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Students" value={stats.total_students} icon={<Users size={16} />} />
            <StatCard label="Registered" value={stats.completed_registrations} icon={<UserCheck size={16} />} variant="primary" />
            <StatCard label="Pending Reg." value={stats.pending_registrations} icon={<Clock size={16} />} />
            <Link href="/admin/payments" className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <StatCard label="Pending Payments" value={stats.pending_payment_verifications} sub="Review receipts" icon={<Clock size={16} />} />
            </Link>
            <StatCard label="Active Staff" value={stats.active_staff} icon={<UserCheck size={16} />} />
            <StatCard label="Pending Approvals" value={stats.pending_staff_approvals} icon={<Clock size={16} />} />
            <StatCard label="Lab Records" value={stats.lab_records_count} icon={<FlaskConical size={16} />} />
            <StatCard label="Physical Exams" value={stats.physical_exams_count} icon={<Stethoscope size={16} />} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Students by Level */}
            {Object.keys(stats.students_by_level ?? {}).length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">Students by Level</h2>
                <div className="space-y-3">
                  {Object.entries(stats.students_by_level).map(([level, count]) => {
                    const max = Math.max(...Object.values(stats.students_by_level));
                    const pct = max > 0 ? (count / max) * 100 : 0;
                    return (
                      <div key={level} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-16">{level} Level</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h2>
              {stats.recent_activity_logs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {stats.recent_activity_logs.slice(0, 6).map((log, i) => (
                    <div key={i} className="flex items-start gap-3 py-1 border-b border-slate-50 last:border-0">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-600 shrink-0 mt-0.5">✓</div>
                      <div>
                        <p className="text-xs font-medium text-slate-700">{String(log.action ?? "")}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(String(log.created_at ?? ""))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Queue Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Queue Overview</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-blue-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-blue-700">{stats.students_currently_in_queues}</p>
                  <p className="text-xs text-blue-500 mt-1">In Queue</p>
                </div>
                <div className="text-center bg-emerald-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-emerald-700">{stats.students_attended}</p>
                  <p className="text-xs text-emerald-500 mt-1">Attended</p>
                </div>
                <div className="text-center bg-red-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-red-700">{stats.students_missed}</p>
                  <p className="text-xs text-red-500 mt-1">Missed</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </AuthenticatedLayout>
  );
}
