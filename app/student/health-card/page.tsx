"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/utils";
import { ErrorState, TableSkeleton, PageHeader, Button } from "@/components/ui/shared";

export default function HealthCardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const d = await apiRequest<Record<string, unknown>>("/api/students/health-card");
      setData(d);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const p = data as Record<string, Record<string, unknown>> | null;
  const student = p?.student;
  const basicInfo = p?.basic_info;
  const caseNotes = p?.case_notes;

  const fullName = basicInfo
    ? `${basicInfo.surname ?? ""} ${basicInfo.first_name ?? ""} ${basicInfo.last_name ?? ""}`.trim()
    : "—";

  return (
    <AuthenticatedLayout title="Health Center Card">
      <PageHeader
        title="Health Center Card"
        action={
          <Button onClick={() => window.print()} variant="secondary" size="sm">
            🖨 Print Card
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="max-w-xl">
          {/* Health Card */}
          <div
            id="health-card"
            className="bg-white border-2 border-slate-800 rounded-xl overflow-hidden print:shadow-none print:rounded-none"
          >
            {/* Front */}
            <div className="p-6 border-b-2 border-slate-800">
              <div className="text-center mb-4">
                <div className="text-sm font-bold uppercase tracking-wider text-slate-800">EKITI STATE UNIVERSITY</div>
                <div className="text-xs text-slate-600">ADO-EKITI</div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mt-1">University Health Services</div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Registration Card</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{String(student?.registration_number ?? "—")}</p>
              </div>
            </div>

            {/* Back */}
            <div className="p-6">
              <div className="flex gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2 text-sm">
                  <Row label="H.C. Number" value={String(caseNotes?.hc_number ?? "—")} />
                  <Row label="Surname" value={String(basicInfo?.surname ?? "—")} />
                  <Row label="First Names" value={`${String(basicInfo?.first_name ?? "")} ${String(basicInfo?.last_name ?? "")}`.trim() || "—"} />
                  <Row label="Faculty" value={String(student?.faculty ?? "—")} />
                  <Row label="Department" value={String(student?.department ?? "—")} />
                  <Row label="Level" value={String(student?.level ?? "—")} />
                  <Row label="Matric No." value={String(student?.registration_number ?? "—")} />
                </div>
                {/* Passport placeholder */}
                <div className="shrink-0">
                  <div className="h-24 w-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400 text-center">
                    Passport Photo
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center border-t border-slate-200 pt-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-relaxed">
                  KEEP THIS CARD CAREFULLY AND BRING IT WITH YOU WHENEVER YOU COME FOR TREATMENT
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #health-card, #health-card * { visibility: visible; }
          #health-card { position: fixed; inset: 0; margin: auto; }
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
