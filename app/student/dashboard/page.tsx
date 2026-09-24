"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, getGreeting, formatDateTime, cn } from "@/lib/utils";
import { StatCard, ErrorState, CardSkeleton } from "@/components/ui/shared";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OnboardingStatus {
  current_step?: string;
  steps?: Record<string, boolean>;
  is_complete?: boolean;
  can_join_queue?: boolean;
  payment_status?: string;
  registration_status?: string;
}

interface DashboardData {
  student?: { level?: number; faculty?: string; department?: string; registration_number?: string };
  case_notes?: { hc_number?: string };
  onboarding?: OnboardingStatus;
}

const steps = [
  { key: "account", label: "Account Created", desc: "Your account has been set up" },
  { key: "basic_info", label: "Personal Information", desc: "Basic details completed" },
  { key: "passport", label: "Passport & Signature", desc: "Documents uploaded" },
  { key: "payment", label: "Payment", desc: "Health center fee paid" },
  { key: "lab_request", label: "Laboratory Form", desc: "Lab request submitted" },
  { key: "physical_exam", label: "Physical Examination", desc: "Physical exam completed" },
  { key: "pink_file", label: "Pink File", desc: "Medical record created" },
  { key: "registered", label: "Registration Completed", desc: "All steps done" },
];

function ProgressTimeline({ completed }: { completed: Record<string, boolean> }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const done = completed[step.key] ?? (i === 0);
        const current = !done && (i === 0 || completed[steps[i - 1]?.key]);
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                done ? "bg-emerald-100 text-emerald-600" : current ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
              )}>
                {done ? <CheckCircle2 size={16} /> : current ? <Circle size={16} /> : <Lock size={14} />}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-0.5 h-8", done ? "bg-emerald-200" : "bg-slate-100")} />
              )}
            </div>
            <div className="pb-6">
              <p className={cn("text-sm font-medium", done ? "text-slate-700" : current ? "text-emerald-700" : "text-slate-400")}>
                {step.label}
                {current && <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Current</span>}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [dash, onboarding] = await Promise.all([
        apiRequest<DashboardData>("/api/students/dashboard").catch(() => ({})),
        apiRequest<OnboardingStatus>("/api/students/onboarding-status").catch(() => ({})),
      ]);
      setData({ ...(dash as DashboardData), onboarding: onboarding as OnboardingStatus });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Redirect unapproved/suspended staff (shouldn't be here, but guard)
  if (!user) return null;

  const greeting = `${getGreeting()}, ${user.email.split("@")[0]}`;
  const completedSteps: Record<string, boolean> = {
    account: true,
    ...(data?.onboarding?.steps ?? {}),
  };

  return (
    <AuthenticatedLayout title="Student Dashboard">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 capitalize">{greeting}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track your health center registration progress</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Level" value={data?.student?.level ?? "—"} sub="Academic level" />
            <StatCard label="Faculty" value={data?.student?.faculty ?? "—"} sub="Your faculty" />
            <StatCard label="HC Number" value={data?.case_notes?.hc_number ?? "Not assigned"} sub="Health center ID" variant={data?.case_notes?.hc_number ? "primary" : "default"} />
            <StatCard label="Status" value={data?.onboarding?.registration_status ?? "In Progress"} sub="Registration state" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Progress */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Registration Progress</h2>
              <ProgressTimeline completed={completedSteps} />
            </div>

            {/* Quick actions */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
              {[
                { label: "Continue Registration", href: "/student/registration", show: !data?.onboarding?.is_complete },
                { label: "View Queue Status", href: "/student/queue", show: data?.onboarding?.can_join_queue },
                { label: "View Pink File", href: "/student/pink-file", show: !!data?.case_notes?.hc_number },
                { label: "My Profile", href: "/student/profile", show: true },
                { label: "Health Center Card", href: "/student/health-card", show: data?.onboarding?.is_complete },
              ].filter(a => a.show).map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition group"
                >
                  {action.label}
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
}
