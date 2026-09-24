"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, formatDate } from "@/lib/utils";
import { StatusBadge, Button } from "@/components/ui/shared";
import { Shield, KeyRound, Mail, UserCheck } from "lucide-react";
import Link from "next/link";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest("/api/admin/profile");
        setProfile(res);
      } catch {
        // Fallback
      }
    };
    fetchProfile();
  }, []);

  const displayName = profile?.name || user?.email?.split("@")[0] || "Administrator";

  return (
    <AuthenticatedLayout title="Admin Profile">
      <div className="max-w-3xl space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center shadow-sm">
              <Shield size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 capitalize">{displayName}</h1>
                <StatusBadge variant="success">Super Administrator</StatusBadge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">Health Center Operations & Approvals</p>
            </div>
          </div>

          <Link href="/reset-password">
            <Button variant="outline" size="sm">
              <KeyRound size={14} className="mr-1.5" />
              Reset Password
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
            Administrator Clearance & Roles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-1">Account Role</span>
              <span className="font-bold text-slate-900">System Administrator</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-1">Created Date</span>
              <span className="font-bold text-slate-900">{formatDate(user?.created_at)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-1">Staff Approvals</span>
              <span className="font-bold text-emerald-700">Full Authority (Approve, Suspend, Unsuspend)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-1">Student Management</span>
              <span className="font-bold text-emerald-700">Bulk Upload & Batch Import Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
