"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/utils";
import { ErrorState, TableSkeleton, PageHeader, Button } from "@/components/ui/shared";

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
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const d = await apiRequest<HealthCardData>("/api/students/health-card");
      setData(d);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { queueMicrotask(() => { void load(); }); }, []);

  return (
    <AuthenticatedLayout title="Health Center Card">
      <PageHeader
        title="Health Center Card"
        action={
          <Button onClick={() => window.print()} variant="secondary" size="sm">
            Print / Download
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="max-w-2xl">
          <div
            id="health-card"
            className="grid gap-5 sm:grid-cols-2 print:grid-cols-2 print:gap-3"
          >
            <section className="flex min-h-[340px] flex-col justify-between rounded-xl border-2 border-slate-800 bg-white p-6 text-center print:min-h-[300px] print:rounded-none print:p-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-900">EKITI STATE UNIVERSITY</p>
                <p className="text-xs text-slate-600">ADO-EKITI</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">UNIVERSITY HEALTH SERVICES</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">REGISTRATION CARD</p>
                <p className="mt-3 break-all text-xl font-bold text-slate-900">{data?.registration_number || "—"}</p>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Student Health Services</p>
            </section>

            <section className="min-h-[340px] rounded-xl border-2 border-slate-800 bg-white p-5 print:min-h-[300px] print:rounded-none print:p-4">
              <div className="flex h-full gap-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="space-y-3">
                    <Row label="H.C. Number" value={data?.hc_number || "—"} />
                    <Row label="Surname" value={data?.surname || "—"} />
                    <Row label="First Names" value={data?.other_names || "—"} />
                    <Row label="Matric Number" value={data?.matric_number || data?.registration_number || "—"} />
                    <Row label="Faculty" value={data?.faculty || "—"} />
                    <Row label="Department" value={data?.department || "—"} />
                    <Row label="HRO's Initials" value="—" />
                  </div>
                  <div className="mt-auto pt-5">
                    {data?.signature_url ? (
                      <img src={data.signature_url} alt="Student signature" className="mb-1 h-8 max-w-28 object-contain object-left" />
                    ) : <div className="h-8" />}
                    <div className="border-t border-slate-700 pt-1 text-[10px] text-slate-500">Signature</div>
                  </div>
                </div>
                <div className="w-24 shrink-0">
                  {data?.passport_url ? (
                    <img src={data.passport_url} alt="Student passport photograph" className="h-32 w-24 rounded-md border border-slate-300 object-cover" />
                  ) : (
                    <div className="flex h-32 w-24 items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-center text-xs text-slate-400">Passport Photo</div>
                  )}
                </div>
              </div>
              <p className="mt-5 border-t border-slate-200 pt-3 text-center text-[10px] uppercase leading-relaxed tracking-wider text-slate-500">KEEP THIS CARD CAREFULLY AND BRING IT WITH YOU WHENEVER YOU COME FOR TREATMENT</p>
            </section>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #health-card, #health-card * { visibility: visible; }
          #health-card { position: fixed; inset: 0; margin: auto; width: 100%; max-width: 760px; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-slate-400 w-28 shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800">{value}</span>
    </div>
  );
}
