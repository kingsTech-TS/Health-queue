"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/utils";
import { TableSkeleton, PageHeader, Button } from "@/components/ui/shared";
import { AlertCircle, ArrowRight, Printer } from "lucide-react";
import Link from "next/link";

interface HealthCardData {
  registration_number?: string;
  hc_number?: string;
  surname?: string;
  other_names?: string;
  matric_number?: string;
  faculty?: string;
  department?: string;
  passport_url?: string;
  signature_url?: string;
}

export default function HealthCardPage() {
  const [data, setData] = useState<HealthCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiRequest<HealthCardData>("/api/students/health-card");
      setData(d);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load health card";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, []);

  return (
    <AuthenticatedLayout title="Health Center Card">
      <PageHeader
        title="Health Center Card"
        action={
          data ? (
            <Button onClick={() => window.print()} variant="secondary" size="sm">
              <Printer size={14} className="mr-1.5" /> Print / Download
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : error || !data ? (
        <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Health Card Not Ready
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {error && error.toLowerCase().includes("case notes")
              ? "Your case notes have not been completed yet. Once you complete the final registration step, your official Health Center Card will be issued automatically."
              : "Your Health Center Registration must be completed through all required steps before your card is issued."}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/student/registration">
              <Button variant="primary">
                Continue Registration <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </Link>
            <Button variant="outline" onClick={load}>
              Check Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl rounded-3xl bg-slate-200/80 p-5 sm:p-8 print:max-w-none print:bg-white print:p-0">
          <div
            id="health-card"
            className="mx-auto flex max-w-[720px] flex-col gap-6 print:gap-4"
          >
            <section className="relative aspect-[1.75/1] overflow-hidden rounded-[22px] bg-[#087e78] shadow-xl print:shadow-none">
              <div className="absolute inset-y-0 left-0 w-[68%] bg-white [clip-path:polygon(0_0,68%_0,88%_18%,78%_35%,88%_52%,70%_72%,82%_100%,0_100%)]" />
              <div className="absolute left-7 top-1/2 z-10 w-[54%] -translate-y-1/2 sm:left-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">EKITI STATE UNIVERSITY</p>
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-[10px]">ADO-EKITI</p>
                <p className="mt-4 text-sm font-bold uppercase text-slate-900 sm:text-lg">{data?.surname || "STUDENT"} <span className="font-normal">{data?.other_names || "NAME"}</span></p>
                <p className="text-[8px] uppercase tracking-[0.16em] text-emerald-700 sm:text-[10px]">UNIVERSITY HEALTH SERVICES</p>
                <div className="mt-4 space-y-1.5 text-[8px] text-slate-500 sm:text-[10px]">
                  <p><span className="mr-2 text-emerald-700">●</span>H.C. NUMBER: {data?.hc_number || "—"}</p>
                  <p><span className="mr-2 text-emerald-700">●</span>REGISTRATION: {data?.registration_number || "—"}</p>
                  <p><span className="mr-2 text-emerald-700">●</span>{data?.faculty || "Faculty"} / {data?.department || "Department"}</p>
                </div>
              </div>
              <div className="absolute right-[7%] top-1/2 z-10 flex h-[57%] w-[24%] -translate-y-1/2 items-center justify-center overflow-hidden rounded-[28%] border-[3px] border-[#087e78] bg-white/20 [clip-path:polygon(50%_0,90%_18%,90%_80%,50%_100%,10%_80%,10%_18%)] sm:border-4">
                {data?.passport_url ? <img src={data.passport_url} alt="Student passport photograph" className="h-full w-full object-cover" /> : <span className="px-2 text-center text-[8px] text-white sm:text-[10px]">PASSPORT PHOTO</span>}
              </div>
              <p className="absolute bottom-4 right-8 z-10 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">REGISTRATION CARD</p>
            </section>

            <section className="relative flex aspect-[1.75/1] items-center justify-center overflow-hidden rounded-[22px] bg-[#087e78] shadow-xl print:shadow-none">
              <div className="absolute right-8 top-5 h-20 w-20 rounded-full border border-dotted border-white/20" />
              <div className="absolute bottom-7 left-8 h-20 w-20 rounded-full border border-dotted border-white/20" />
              <svg viewBox="0 0 720 180" preserveAspectRatio="none" className="absolute left-0 top-1/2 h-20 w-full -translate-y-1/2 text-white" aria-hidden="true">
                <path d="M0 94 H36 L50 94 L62 42 L78 145 L94 68 L108 112 L126 94 H720" fill="none" stroke="currentColor" strokeWidth="4" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="relative z-10 mt-14 text-center text-white">
                <p className="text-base font-bold uppercase tracking-[0.18em] sm:text-xl">HEALTH CENTER</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/75 sm:text-[11px]">REGISTRATION CARD</p>
                <p className="mt-5 max-w-xs text-[8px] uppercase leading-relaxed tracking-[0.12em] text-white/80 sm:text-[10px]">KEEP THIS CARD CAREFULLY AND BRING IT WITH YOU WHENEVER YOU COME FOR TREATMENT</p>
              </div>
              <div className="absolute bottom-5 right-8 text-right text-[8px] uppercase tracking-wider text-white/75 sm:text-[10px]">
                <p>{data?.faculty || "Faculty"}</p>
                <p>{data?.department || "Department"}</p>
              </div>
              <div className="absolute bottom-5 left-8 text-[8px] uppercase tracking-wider text-white/75 sm:text-[10px]">
                <p>H.C. {data?.hc_number || "—"}</p>
                <p>Matric {data?.matric_number || data?.registration_number || "—"}</p>
                <div className="mt-1 border-t border-white/50 pt-1">HRO / SIGNATURE</div>
                {data?.signature_url && <img src={data.signature_url} alt="Student signature" className="mt-1 h-5 max-w-20 object-contain object-left brightness-0 invert" />}
              </div>
            </section>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #health-card, #health-card * { visibility: visible; }
          #health-card { position: fixed; inset: 0; margin: auto; width: 720px; max-width: 94vw; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
