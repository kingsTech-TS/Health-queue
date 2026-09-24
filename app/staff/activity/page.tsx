"use client";

import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, formatDateTime } from "@/lib/utils";
import { TableSkeleton, EmptyState, StatusBadge } from "@/components/ui/shared";
import { Activity, Clock, UserCheck, ShieldCheck } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  details?: string;
  user_email?: string;
  created_at: string;
}

export default function StaffActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await apiRequest<ActivityLog[]>("/api/admin/activity-logs");
        setLogs(res || []);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <AuthenticatedLayout title="Operational Activity">
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Activity size={18} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Activity Log</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of queue calls, completed medical reviews, and status updates.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Clock size={36} />}
                title="No operational logs yet"
                description="Activities will record automatically as queue actions and examinations take place."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Staff Operator</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 text-xs">{log.action}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{log.details || "—"}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{log.user_email || "System"}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 text-right font-mono">
                        {formatDateTime(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
