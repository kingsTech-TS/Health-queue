"use client";

import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, formatDate, formatDateTime, getRoleName } from "@/lib/utils";
import {
  StatusBadge, TableSkeleton, EmptyState, Input,
  Button, Modal, FormField, Textarea, ConfirmDialog
} from "@/components/ui/shared";
import {
  UserCheck, ShieldAlert, CheckCircle2, XCircle, Search,
  AlertTriangle, Eye, Shield, KeyRound, Clock
} from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  email: string;
  role: string;
  sub_role?: string;
  staff_id?: string;
  full_name?: string;
  is_approved: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
}

export default function AdminStaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active" | "suspended">("all");
  const [search, setSearch] = useState("");

  // Suspension Modal (Prompt #40)
  const [suspendTarget, setSuspendTarget] = useState<StaffMember | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  // Unsuspend Target
  const [unsuspendTarget, setUnsuspendTarget] = useState<StaffMember | null>(null);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);

  // Approve Target
  const [approveLoading, setApproveLoading] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<StaffMember[]>("/api/admin/staff");
      setStaffList(res || []);
    } catch {
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleApprove = async (staffId: string) => {
    try {
      setApproveLoading(staffId);
      await apiRequest(`/api/admin/approve-staff/${staffId}`, { method: "POST" });
      toast.success("Staff account approved successfully!");
      fetchStaff();
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve staff account");
    } finally {
      setApproveLoading(null);
    }
  };

  const handleExecuteSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendTarget) return;
    if (!suspensionReason.trim()) {
      toast.error("Reason for suspension is required.");
      return;
    }
    try {
      setSuspensionLoading(true);
      await apiRequest(`/api/admin/suspend-user/${suspendTarget.id}`, {
        method: "POST",
        body: JSON.stringify({ reason: suspensionReason }),
      });
      toast.success("Staff account suspended.");
      setSuspendTarget(null);
      setSuspensionReason("");
      fetchStaff();
    } catch (err: any) {
      toast.error(err?.message || "Failed to suspend staff");
    } finally {
      setSuspensionLoading(false);
    }
  };

  const handleExecuteUnsuspension = async () => {
    if (!unsuspendTarget) return;
    try {
      setUnsuspendLoading(true);
      await apiRequest(`/api/admin/unsuspend-user/${unsuspendTarget.id}`, {
        method: "POST",
      });
      toast.success("Staff account unsuspended successfully!");
      setUnsuspendTarget(null);
      fetchStaff();
    } catch (err: any) {
      toast.error(err?.message || "Failed to unsuspend staff");
    } finally {
      setUnsuspendLoading(false);
    }
  };

  // Filter staff by tab and search
  const filtered = staffList.filter((s) => {
    const query = search.toLowerCase();
    const email = s.email.toLowerCase();
    const name = (s.full_name || "").toLowerCase();
    const matchesSearch = !search || email.includes(query) || name.includes(query);

    if (activeTab === "pending") return matchesSearch && !s.is_approved && !s.is_suspended;
    if (activeTab === "active") return matchesSearch && s.is_approved && !s.is_suspended;
    if (activeTab === "suspended") return matchesSearch && s.is_suspended;
    return matchesSearch;
  });

  return (
    <AuthenticatedLayout title="Staff Management">
      <div className="space-y-6">
        {/* Header (Prompt #39) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review staff credentials, verify registrations, and manage operational permissions.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search staff by email or name..."
              className="pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs: All Staff, Pending Approval, Active, Suspended (Prompt #39) */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "all"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            All Staff ({staffList.length})
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Pending Approval ({staffList.filter((s) => !s.is_approved && !s.is_suspended).length})
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "active"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Active ({staffList.filter((s) => s.is_approved && !s.is_suspended).length})
          </button>

          <button
            onClick={() => setActiveTab("suspended")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "suspended"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Suspended ({staffList.filter((s) => s.is_suspended).length})
          </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<UserCheck size={36} />}
                title="No staff members in this section"
                description="Staff accounts will show up here once registered or categorized."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Sub-Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{staff.full_name || staff.email.split("@")[0]}</p>
                        <p className="text-xs text-slate-400 font-mono">{staff.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700">
                        {staff.staff_id || `STF-${staff.id.slice(-4)}`}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 capitalize">
                        {staff.sub_role === "lab_attendant" ? "Lab Attendant" : "Registering Nurse"}
                      </td>
                      <td className="py-3.5 px-4">
                        {staff.is_suspended ? (
                          <StatusBadge variant="danger">Suspended</StatusBadge>
                        ) : !staff.is_approved ? (
                          <StatusBadge variant="pending">Pending Approval</StatusBadge>
                        ) : (
                          <StatusBadge variant="success">Active</StatusBadge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                        {formatDate(staff.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Action */}
                          {!staff.is_approved && !staff.is_suspended && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApprove(staff.id)}
                              loading={approveLoading === staff.id}
                            >
                              <CheckCircle2 size={13} className="mr-1" />
                              Approve
                            </Button>
                          )}

                          {/* Suspend Action */}
                          {!staff.is_suspended && staff.is_approved && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                              onClick={() => {
                                setSuspendTarget(staff);
                                setSuspensionReason("");
                              }}
                            >
                              <ShieldAlert size={13} className="mr-1" />
                              Suspend
                            </Button>
                          )}

                          {/* Unsuspend Action */}
                          {staff.is_suspended && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => setUnsuspendTarget(staff)}
                            >
                              <CheckCircle2 size={13} className="mr-1" />
                              Unsuspend
                            </Button>
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

        {/* Staff Suspension Modal (Prompt #40) */}
        <Modal
          open={!!suspendTarget}
          onClose={() => setSuspendTarget(null)}
          title="Suspend Staff Account"
        >
          {suspendTarget && (
            <form onSubmit={handleExecuteSuspension} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <p>
                  <span className="text-slate-500">Staff:</span>{" "}
                  <span className="font-bold text-slate-800">{suspendTarget.full_name || suspendTarget.email}</span>
                </p>
                <p>
                  <span className="text-slate-500">Staff ID:</span>{" "}
                  <span className="font-mono font-semibold text-slate-800">
                    {suspendTarget.staff_id || `STF-${suspendTarget.id.slice(-4)}`}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Sub-Role:</span>{" "}
                  <span className="font-semibold text-slate-800 capitalize">
                    {suspendTarget.sub_role || "Staff"}
                  </span>
                </p>
              </div>

              <FormField label="Reason for suspension" required hint="This reason will be shown to the suspended staff member.">
                <Textarea
                  placeholder="Enter the official reason for temporary suspension..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  required
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSuspendTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  loading={suspensionLoading}
                >
                  Suspend Staff
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Unsuspend Confirmation Dialog */}
        <ConfirmDialog
          open={!!unsuspendTarget}
          onClose={() => setUnsuspendTarget(null)}
          onConfirm={handleExecuteUnsuspension}
          title="Unsuspend Staff Account"
          description={`Are you sure you want to restore access for ${unsuspendTarget?.email}? They will regain access to their assigned operational dashboard.`}
          confirmLabel="Unsuspend Account"
          variant="default"
          loading={unsuspendLoading}
        />
      </div>
    </AuthenticatedLayout>
  );
}
