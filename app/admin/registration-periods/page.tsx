"use client";

import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, formatDate } from "@/lib/utils";
import {
  StatusBadge, TableSkeleton, EmptyState, Input,
  Button, Modal, FormField, ConfirmDialog
} from "@/components/ui/shared";
import { CalendarDays, Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RegistrationPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  academic_session?: string;
  description?: string;
}

export default function RegistrationPeriodsPage() {
  const [periods, setPeriods] = useState<RegistrationPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<RegistrationPeriod | null>(null);

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    start_time: "08:00",
    end_time: "16:00",
  });

  const [deleteTarget, setDeleteTarget] = useState<RegistrationPeriod | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<RegistrationPeriod[]>("/api/admin/registration-periods");
      setPeriods(res || []);
    } catch {
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const openCreateModal = () => {
    setEditingPeriod(null);
    setForm({
      name: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      start_time: "08:00",
      end_time: "16:00",
    });
    setModalOpen(true);
  };

  const openEditModal = (period: RegistrationPeriod) => {
    setEditingPeriod(period);
    setForm({
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
      start_time: period.start_time || "08:00",
      end_time: period.end_time || "16:00",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingPeriod) {
        await apiRequest(`/api/admin/registration-period/${editingPeriod.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast.success("Registration period updated successfully!");
      } else {
        await apiRequest("/api/admin/registration-period", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("Registration period created successfully!");
      }
      setModalOpen(false);
      fetchPeriods();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save registration period");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (period: RegistrationPeriod) => {
    try {
      await apiRequest(`/api/admin/registration-period/${period.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !period.is_active }),
      });
      toast.success(
        period.is_active
          ? "Registration period deactivated."
          : "Registration period activated!"
      );
      fetchPeriods();
    } catch (err: any) {
      toast.error(err?.message || "Failed to toggle period status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiRequest(`/api/admin/registration-period/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.success("Registration period deleted.");
      setDeleteTarget(null);
      fetchPeriods();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete period");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AuthenticatedLayout title="Registration Periods">
      <div className="space-y-6">
        {/* Header (Prompt #41) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Registration Periods</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control enrollment windows, academic session time bounds, and active health checkup seasons.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus size={14} className="mr-1.5" />
            Create Period
          </Button>
        </div>

        {/* Periods Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} />
            </div>
          ) : periods.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<CalendarDays size={36} />}
                title="No registration periods found"
                description="Create a registration period to allow students to enroll and join health clearance queues."
                action={
                  <Button variant="primary" size="sm" onClick={openCreateModal}>
                    <Plus size={14} className="mr-1.5" />
                    Create First Period
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Period Name</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4">Operating Hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periods.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.academic_session || "Current Session"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">{formatDate(p.start_date)}</td>
                      <td className="py-3.5 px-4 text-xs font-mono">{formatDate(p.end_date)}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                        {p.start_time || "08:00"} - {p.end_time || "16:00"}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge variant={p.is_active ? "success" : "muted"}>
                          {p.is_active ? "Active" : "Inactive"}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => handleToggleActive(p)}
                          >
                            {p.is_active ? (
                              <span className="text-amber-600">Deactivate</span>
                            ) : (
                              <span className="text-emerald-600">Activate</span>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-slate-600 hover:bg-slate-100"
                            onClick={() => openEditModal(p)}
                          >
                            <Edit2 size={13} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal (Prompt #41) */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingPeriod ? "Edit Registration Period" : "Create Registration Period"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Period Name" required>
              <Input
                placeholder="e.g. 2026/2027 Freshers Health Screening"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" required>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="End Date" required>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Daily Start Time" required>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Daily End Time" required>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {editingPeriod ? "Update Period" : "Create Period"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Registration Period"
          description={`Are you sure you want to remove '${deleteTarget?.name}'? Active registrations scheduled in this timeframe may be affected.`}
          confirmLabel="Delete Period"
          loading={deleting}
        />
      </div>
    </AuthenticatedLayout>
  );
}
