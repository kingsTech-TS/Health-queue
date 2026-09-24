"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button, FormField, Input } from "@/components/ui/shared";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      // Simulate password change
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Password updated successfully!");
      router.back();
    } catch {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            +
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">EKSU</p>
            <p className="text-base font-bold text-slate-900 leading-none">University Health Center</p>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Reset Account Password</h1>
            <p className="text-xs text-slate-500 mt-1">
              Choose a strong password to secure your health registration records.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <FormField label="Current Password (Optional if reset link used)">
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10 text-xs"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </FormField>

            <FormField label="New Password" required>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  className="pl-9 pr-10 text-xs"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm New Password" required>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  className="pl-9 pr-10 text-xs"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </FormField>

            <Button type="submit" variant="primary" className="w-full text-xs" loading={loading}>
              Update Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={13} />
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
