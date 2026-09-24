"use client";

import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { FormField, Input, Button, Select } from "@/components/ui/shared";
import { Settings, Save, Shield, Clock, Hospital } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clinic_name: "Ekiti State University Health Services Center",
    clinic_location: "Main Campus Clinic, Ado-Ekiti",
    contact_email: "healthcenter@eksu.edu.ng",
    default_minutes_per_student: "10",
    max_queue_capacity: "100",
    require_receipt_verification: "yes",
    auto_close_queues: "yes",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Health Center settings updated successfully!");
    }, 400);
  };

  return (
    <AuthenticatedLayout title="System Settings">
      <div className="max-w-4xl space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Settings size={18} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Health Center Configuration</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage global queue parameters, facility profile details, and operational rules.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center gap-2">
              <Hospital size={16} className="text-emerald-600" />
              University Clinic Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Official Center Name" required>
                <Input
                  value={form.clinic_name}
                  onChange={(e) => setForm({ ...form, clinic_name: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Clinic Address / Location" required>
                <Input
                  value={form.clinic_location}
                  onChange={(e) => setForm({ ...form, clinic_location: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Administrative Contact Email" required>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  required
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center gap-2">
              <Clock size={16} className="text-emerald-600" />
              Queue & Daily Roster Defaults
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Default Consultation Time (Minutes / Student)" required>
                <Input
                  type="number"
                  value={form.default_minutes_per_student}
                  onChange={(e) => setForm({ ...form, default_minutes_per_student: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Daily Max Queue Slots" required>
                <Input
                  type="number"
                  value={form.max_queue_capacity}
                  onChange={(e) => setForm({ ...form, max_queue_capacity: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Auto-Close Queue Sessions at 4:00 PM">
                <Select
                  value={form.auto_close_queues}
                  onChange={(e) => setForm({ ...form, auto_close_queues: e.target.value })}
                >
                  <option value="yes">Enabled (Auto-close after hours)</option>
                  <option value="no">Disabled (Manual close only)</option>
                </Select>
              </FormField>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="primary" size="md" loading={saving}>
              <Save size={15} className="mr-1.5" />
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
