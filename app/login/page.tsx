"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { Button, FormField, Input } from "@/components/ui/shared";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
          <HeartPulse size={22} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">EKSU</p>
          <p className="text-base font-bold text-slate-800 leading-tight">Health Center</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the system</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email address" required>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" required>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="md">
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-slate-500">
            New student?{" "}
            <Link href="/register" className="text-emerald-700 font-medium hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            Staff account?{" "}
            <Link href="/register/staff" className="text-emerald-700 font-medium hover:underline">
              Staff registration
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Ekiti State University Health Services © {new Date().getFullYear()}
      </p>
    </div>
  );
}
