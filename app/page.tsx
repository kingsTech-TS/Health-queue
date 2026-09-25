"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FlaskConical,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user?.role === "student") {
      router.replace("/student/dashboard");
    } else if (user?.role === "admin") {
      router.replace("/admin/dashboard");
    } else if (user) {
      router.replace("/staff/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f8f4]">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f8f4] text-slate-900">
      <section className="relative isolate px-5 pb-16 pt-5 sm:px-8 lg:px-12 lg:pb-24">
        <div className="absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_75%_20%,rgba(187,227,194,0.62),transparent_34%),linear-gradient(135deg,#f4f8f4_12%,#e7f2e7_100%)]" />
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center justify-between border-b border-emerald-950/10 pb-5" aria-label="Main navigation">
            <Link href="/" className="flex items-center gap-3" aria-label="EKSU Health Center home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/10">
                <HeartPulse size={21} />
              </span>
              <span>
                <span className="block text-sm font-bold leading-none text-slate-800">Health Center</span>
              </span>
            </Link>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Link href="/login" className="hidden px-3 py-2 text-slate-600 transition hover:text-emerald-800 sm:block">Sign in</Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2.5 text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900">
                Get started <ArrowRight size={15} />
              </Link>
            </div>
          </nav>

          <div className="grid items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-24">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="max-w-2xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.75rem]">
                Your health journey, <span className="text-emerald-700">in one place.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Register with EKSU Health Center, submit your details securely, and move through every required step with a clear view of what comes next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900">
                  Create student account <ArrowRight size={17} />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/60 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800">
                  I already have an account
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-700" /> Secure student records</span>
                <span className="inline-flex items-center gap-2"><Clock3 size={15} className="text-emerald-700" /> See your queue status</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-5 rounded-[2.5rem] border border-emerald-900/10 bg-white/25 rotate-3" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#143f35] p-4 shadow-2xl shadow-emerald-950/20 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/15 pb-5 text-white">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">Student portal</p>
                    <p className="mt-1 text-lg font-semibold">Registration overview</p>
                  </div>
                  <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-[11px] font-medium text-emerald-100">In progress</span>
                </div>
                <div className="mt-5 rounded-2xl bg-[#f6faf5] p-5 text-slate-900">
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs text-slate-500">Current stage</p><p className="mt-1 text-xl font-bold">Lab screening</p></div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><FlaskConical size={21} /></div>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full w-[58%] rounded-full bg-emerald-700" /></div>
                  <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-500"><span>4 of 7 steps complete</span><span className="text-emerald-700">58%</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4 text-white"><Activity size={18} className="text-emerald-200" /><p className="mt-5 text-2xl font-bold">#12</p><p className="mt-1 text-xs text-emerald-100/70">Queue position</p></div>
                  <div className="rounded-2xl bg-white/10 p-4 text-white"><CalendarCheck2 size={18} className="text-emerald-200" /><p className="mt-5 text-2xl font-bold">Today</p><p className="mt-1 text-xs text-emerald-100/70">Next appointment</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="registration" className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">A clear path from sign-up to care.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Everything is organized into manageable steps, so you can prepare ahead and spend less time wondering what happens next.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { number: "01", icon: UserRoundPlus, title: "Create your account", text: "Use your matric number and email to create a secure student profile." },
              { number: "02", icon: ClipboardCheck, title: "Complete your profile", text: "Add personal, academic, emergency contact, and health information." },
              { number: "03", icon: FileCheck2, title: "Submit documents", text: "Upload the required documents and confirm your payment details." },
              { number: "04", icon: Stethoscope, title: "Join the queue", text: "Track lab screening, medical review, and physical registration in order." },
            ].map((step, index) => {
              const Icon = step.icon;
              return <motion.div key={step.number} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45, delay: index * 0.08 }} className="group border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[0.2em] text-emerald-700">{step.number}</span><Icon size={20} className="text-slate-400 transition group-hover:text-emerald-700" /></div>
                <h3 className="mt-8 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
              </motion.div>;
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] bg-[#dcecdf] px-7 py-9 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Ready when you are</p><h2 className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.04em] text-slate-950">Start your health center registration today.</h2></div>
          <Link href="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900">Begin registration <ArrowRight size={17} /></Link>
        </div>
        <footer className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Ekiti State University Health Services</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-700" /> Care, organized</span></footer>
      </section>
    </main>
  );
}
