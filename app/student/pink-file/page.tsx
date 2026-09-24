"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest, formatDate } from "@/lib/utils";
import { ErrorState, TableSkeleton, PageHeader, StatusBadge } from "@/components/ui/shared";

export default function StudentPinkFilePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const profile = await apiRequest<Record<string, unknown>>("/api/students/profile");
      setData(profile);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const p = data as Record<string, Record<string, unknown>> | null;

  return (
    <AuthenticatedLayout title="Pink File">
      <PageHeader title="Pink File" subtitle="Your complete health center medical record" />

      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-l-4 border-l-pink-400 border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-pink-500 text-lg">🩺</span>
              <h2 className="text-base font-semibold text-slate-900">PINK FILE</h2>
            </div>
            <p className="text-sm text-slate-500">Health Center Medical Record — EKSU Health Services</p>
            {Boolean(p?.case_notes?.hc_number) && (
              <div className="mt-3">
                <StatusBadge variant="success">HC: {String(p?.case_notes?.hc_number)}</StatusBadge>
              </div>
            )}
          </div>

          {/* Personal Info */}
          {p?.basic_info && (
            <Section title="Personal Information">
              <Grid items={[
                { label: "Surname", value: p.basic_info.surname },
                { label: "First Name", value: p.basic_info.first_name },
                { label: "Last Name", value: p.basic_info.last_name },
                { label: "Age", value: p.basic_info.age },
                { label: "Date of Birth", value: formatDate(String(p.basic_info.date_of_birth ?? "")) },
                { label: "Sex", value: p.basic_info.sex },
                { label: "Marital Status", value: p.basic_info.marital_status },
                { label: "Nationality", value: p.basic_info.nationality },
                { label: "State of Origin", value: p.basic_info.state_of_origin },
                { label: "Religion", value: p.basic_info.religion },
                { label: "Phone", value: p.basic_info.phone_number },
                { label: "Home Address", value: p.basic_info.home_address },
              ]} />
            </Section>
          )}

          {/* Case Notes */}
          {p?.case_notes && (
            <Section title="Case Notes">
              <Grid items={[
                { label: "HC Number", value: p.case_notes.hc_number },
                { label: "Blood Group", value: p.case_notes.blood_group },
                { label: "Genotype", value: p.case_notes.genotype },
                { label: "Rhesus Factor", value: p.case_notes.rhesus_factor },
                { label: "Blood Pressure", value: p.case_notes.bp },
                { label: "Hepatitis B", value: p.case_notes.hepatitis_b },
                { label: "Next of Kin", value: p.case_notes.next_of_kin },
                { label: "Relationship", value: p.case_notes.relationship },
              ]} />
            </Section>
          )}

          {/* Lab */}
          {p?.lab_request && (
            <Section title="Laboratory Record">
              <Grid items={[
                { label: "Lab Number", value: (p.lab_request as Record<string, unknown>).laboratory_number },
                { label: "Test Required", value: (p.lab_request as Record<string, unknown>).test_required },
                { label: "Specimen", value: (p.lab_request as Record<string, unknown>).specimen },
                { label: "Date", value: formatDate(String((p.lab_request as Record<string, unknown>).date ?? "")) },
              ]} />
            </Section>
          )}

          {/* Physical Exam */}
          {p?.physical_exam && (
            <Section title="Physical Examination">
              <Grid items={[
                { label: "Weight (kg)", value: (p.physical_exam as Record<string, unknown>).weight_kg },
                { label: "Height (cm)", value: (p.physical_exam as Record<string, unknown>).height_cm },
                { label: "Blood Pressure", value: (p.physical_exam as Record<string, unknown>).blood_pressure },
                { label: "Pulse", value: (p.physical_exam as Record<string, unknown>).pulse },
                { label: "Blood Group", value: (p.physical_exam as Record<string, unknown>).blood_group },
                { label: "Genotype", value: (p.physical_exam as Record<string, unknown>).haemoglobin_genotype },
                { label: "Diagnosis", value: (p.physical_exam as Record<string, unknown>).diagnosis },
              ]} />
            </Section>
          )}
        </div>
      )}
    </AuthenticatedLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ items }: { items: { label: string; value: unknown }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs text-slate-400">{item.label}</dt>
          <dd className="text-slate-800 font-medium mt-0.5">{String(item.value ?? "—")}</dd>
        </div>
      ))}
    </dl>
  );
}
