"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest, formatDate } from "@/lib/utils";
import { ErrorState, TableSkeleton, PageHeader, StatusBadge } from "@/components/ui/shared";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiRequest<Record<string, unknown>>("/api/students/profile");
      setProfile(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const p = profile as Record<string, Record<string, unknown>> | null;
  const student = p?.student;
  const user = p?.user;
  const basicInfo = p?.basic_info;
  const caseNotes = p?.case_notes;

  return (
    <AuthenticatedLayout title="My Profile">
      <PageHeader title="My Profile" subtitle="Your student and health center information" />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* Identity card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl text-emerald-600 font-bold shrink-0">
                {String(basicInfo?.first_name ?? "?")[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-900">
                  {basicInfo
                    ? `${basicInfo.surname} ${basicInfo.first_name} ${basicInfo.last_name ?? ""}`
                    : String(user?.email ?? "Unknown")}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{String(user?.email ?? "")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Boolean(caseNotes?.hc_number) && (
                    <StatusBadge variant="success">HC: {String(caseNotes?.hc_number)}</StatusBadge>
                  )}
                  {Boolean(student?.level) && (
                    <StatusBadge variant="info">{String(student?.level)} Level</StatusBadge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Student Details</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                { label: "Registration No.", value: student?.registration_number },
                { label: "Level", value: student?.level },
                { label: "Faculty", value: student?.faculty },
                { label: "Department", value: student?.department },
                { label: "HC Number", value: caseNotes?.hc_number },
                { label: "Blood Group", value: caseNotes?.blood_group },
                { label: "Genotype", value: caseNotes?.genotype },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-slate-400 font-medium">{item.label}</dt>
                  <dd className="text-slate-800 font-medium mt-0.5">{String(item.value ?? "—")}</dd>
                </div>
              ))}
            </dl>
          </div>

          {basicInfo && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal Information</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  { label: "Date of Birth", value: formatDate(String(basicInfo.date_of_birth ?? "")) },
                  { label: "Nationality", value: basicInfo.nationality },
                  { label: "State of Origin", value: basicInfo.state_of_origin },
                  { label: "Religion", value: basicInfo.religion },
                  { label: "Marital Status", value: basicInfo.marital_status },
                  { label: "Phone", value: basicInfo.phone_number },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs text-slate-400 font-medium">{item.label}</dt>
                    <dd className="text-slate-800 font-medium mt-0.5">{String(item.value ?? "—")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}
    </AuthenticatedLayout>
  );
}
