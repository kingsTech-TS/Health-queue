"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { Button, FormField, Input, Select } from "@/components/ui/shared";
import { apiRequest } from "@/lib/utils";

export default function StaffRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    staff_id: "",
    title: "",
    sub_role: "lab_attendant" as "lab_attendant" | "registering_nurse",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name) e.full_name = "Full name is required";
    if (!form.email) e.email = "Email is required";
    if (!form.staff_id) e.staff_id = "Staff ID is required";
    if (!form.password || form.password.length < 6) e.password = "Min. 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRequest("/api/auth/register/staff", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          staff_id: form.staff_id,
          sub_role: form.sub_role,
          title: form.title || null,
        }),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-2xl mx-auto mb-4">⏳</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Registration Submitted</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your staff account has been submitted for administrator approval. You will be able to
            access your dashboard once approved.
          </p>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-left text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Staff ID</span><span className="font-medium text-slate-800">{form.staff_id}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Sub-role</span><span className="font-medium text-slate-800 capitalize">{form.sub_role.replace("_", " ")}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-amber-600 font-medium">Pending Approval</span></div>
          </div>
          <Link href="/login" className="mt-6 inline-block text-sm text-emerald-700 hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
          <HeartPulse size={22} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">EKSU</p>
          <p className="text-base font-bold text-slate-800 leading-tight">Health Center</p>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Staff Registration</h1>
        <p className="text-sm text-slate-500 mb-6">Create a staff account — admin approval required</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Title">
              <Select value={form.title} onChange={(e) => set("title", e.target.value)}>
                <option value="">None</option>
                <option>Dr.</option><option>Mr.</option><option>Mrs.</option>
                <option>Miss</option><option>Prof.</option>
              </Select>
            </FormField>
            <FormField label="Sub-role" required>
              <Select
                value={form.sub_role}
                onChange={(e) => set("sub_role", e.target.value as "lab_attendant" | "registering_nurse")}
              >
                <option value="lab_attendant">Lab Attendant</option>
                <option value="registering_nurse">Registering Nurse</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Full Name" required error={errors.full_name}>
            <Input placeholder="Full name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </FormField>

          <FormField label="Staff ID" required error={errors.staff_id}>
            <Input placeholder="e.g. STF-001" value={form.staff_id} onChange={(e) => set("staff_id", e.target.value)} />
          </FormField>

          <FormField label="Email address" required error={errors.email}>
            <Input type="email" placeholder="you@eksu.edu.ng" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>

          <FormField label="Password" required error={errors.password}>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm Password" required error={errors.confirmPassword}>
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
            />
          </FormField>

          <Button type="submit" loading={loading} className="w-full mt-2">Submit Registration</Button>
        </form>

        <p className="mt-5 text-sm text-center text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
