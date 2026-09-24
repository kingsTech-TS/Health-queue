"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { Button, FormField, Input } from "@/components/ui/shared";
import { apiRequest } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    registration_number: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    if (!form.registration_number) e.registration_number = "Registration number is required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRequest("/api/auth/register/student", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          registration_number: form.registration_number,
        }),
      });
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-xl font-bold text-slate-900 mb-1">Student Registration</h1>
        <p className="text-sm text-slate-500 mb-6">Create your health center account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Registration / Matric Number" required error={errors.registration_number}>
            <Input
              placeholder="e.g. EKS/2021/001"
              value={form.registration_number}
              onChange={(e) => set("registration_number", e.target.value)}
            />
          </FormField>

          <FormField label="Email address" required error={errors.email}>
            <Input
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
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
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
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

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-5 text-sm text-center text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-emerald-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
