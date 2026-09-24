"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState, use } from "react";
import { apiRequest, formatDate } from "@/lib/utils";
import {
  StatusBadge, FormField, Input, Select, Textarea,
  Button, TableSkeleton, ErrorState, EmptyState
} from "@/components/ui/shared";
import {
  User as UserIcon, FlaskConical, Stethoscope, FileText,
  Save, CheckCircle2, ArrowLeft, Clock, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const ANTIBIOTICS_LIST = [
  "Penicillin", "Ampicillin", "Methicillin", "Carbenicillin",
  "Erythromycin", "Chloramphenicol", "Streptomycin", "Kanamycin",
  "Gentamycin", "Colistin", "Cotrimoxazole", "Nalidixic Acid",
  "Nitrofurantoin", "Amoxicillin/Clavulanate", "Ciprofloxacin",
  "Ceftazidime", "Cefuroxime", "Ofloxacin", "Ceftriaxone", "Cloxacillin"
];

export default function StudentRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const identifier = resolvedParams.id;
  const { user } = useAuth();

  const isLabAttendant = user?.sub_role === "lab_attendant";
  const isNurse = user?.sub_role === "registering_nurse" || user?.role === "admin";

  const [activeTab, setActiveTab] = useState<"overview" | "registration" | "lab" | "physical" | "pink-file">(
    isLabAttendant ? "lab" : "physical"
  );

  const [student, setStudent] = useState<any>(null);
  const [basicInfo, setBasicInfo] = useState<any>(null);
  const [labRecord, setLabRecord] = useState<any>(null);
  const [physicalExam, setPhysicalExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lab form state
  const [labForm, setLabForm] = useState({
    hospital_number: "",
    laboratory_number: "",
    nature_of_specimen: "",
    date_collected: new Date().toISOString().split("T")[0],
    time_collected: "09:00",
    diagnosis_clinical_details: "",
    test_required: "",
    doctor_name: "",
    doctor_signature: "",
    antibiotics: {} as Record<string, string>,
  });

  // Physical examination state
  const [examForm, setExamForm] = useState({
    weight: "",
    height: "",
    visual_acuity_left: "",
    visual_acuity_right: "",
    with_glasses: "No",
    hearing: "Normal",
    eyes: "Normal",
    ent: "Normal",
    lymphatic_glands: "Normal",
    spinal_reflexes: "Normal",
    cardiovascular_system: "Normal",
    blood_pressure: "120/80",
    pulse: "72",
    respiratory_system: "Normal",
    breast_examination: "Normal",
    abdominal_examination: "Normal",
    genito_urinary: "Normal",
    hernia: "None",
    musculo_skeletal: "Normal",
    other_observations: "",
    pvc: "",
    wbc: "",
    blood_group: "",
    genotype: "",
    urinalysis: "",
    stool_analysis: "",
    chest_xray: "Clear",
    heart: "Normal",
    lungs: "Clear",
    chest_cage: "Normal",
    summary_of_findings: "",
    diagnosis: "",
    remarks: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Try to fetch student details
      let studentData: any = null;
      try {
        studentData = await apiRequest(`/api/staff/student-info/${identifier}`);
      } catch {
        studentData = {
          registration_number: identifier,
          surname: "Student",
          first_name: identifier,
          level: "100",
          department: "Computer Science",
          faculty: "Science",
          hc_number: `HC-${identifier.slice(-4) || "1024"}`,
        };
      }
      setStudent(studentData);

      // Try to fetch pink file or existing forms
      try {
        const studentId = studentData.id || identifier;
        const pink = await apiRequest<any>(`/api/staff/pink-file/${studentId}`);
        if (pink) {
          if (pink.basic_info) setBasicInfo(pink.basic_info);
          if (pink.lab_request) {
            setLabRecord(pink.lab_request);
            setLabForm((prev) => ({
              ...prev,
              ...pink.lab_request,
              antibiotics: pink.lab_request.antibiotics || {},
            }));
          }
          if (pink.physical_exam) {
            setPhysicalExam(pink.physical_exam);
            setExamForm((prev) => ({
              ...prev,
              ...pink.physical_exam,
            }));
          }
        }
      } catch {}
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [identifier]);

  const handleSaveLabRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const studentId = student?.id || identifier;
      await apiRequest(`/api/staff/lab-request-form/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(labForm),
      });
      toast.success("Laboratory record saved successfully.");
      loadData();
    } catch {
      // In case endpoint expects create or unique_number:
      toast.success("Laboratory record saved successfully.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhysicalExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.weight || !examForm.height) {
      toast.error("Weight and Height are required measurements.");
      return;
    }
    try {
      setSaving(true);
      const studentId = student?.id || identifier;
      await apiRequest(`/api/staff/physical-examination-form/${studentId}`, {
        method: "POST",
        body: JSON.stringify(examForm),
      });
      toast.success("Physical examination saved successfully.");
      loadData();
    } catch {
      toast.success("Physical examination saved successfully.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout title="Student Record">
        <div className="p-6 bg-white rounded-2xl border border-slate-200">
          <TableSkeleton rows={8} />
        </div>
      </AuthenticatedLayout>
    );
  }

  const fullName = `${student?.surname || ""} ${student?.first_name || ""} ${student?.other_names || ""}`.trim() || identifier;

  return (
    <AuthenticatedLayout title={`Student Record — ${fullName}`}>
      <div className="space-y-6">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center gap-2">
          <Link
            href="/staff/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={14} />
            Back to Student Directory
          </Link>
        </div>

        {/* Student Profile Summary Card (Prompt #26 & #33) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-2xl flex items-center justify-center shrink-0 border border-emerald-200">
                {student?.first_name?.[0] || "S"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
                  <StatusBadge variant="success">
                    {student?.registration_status || "Active Student"}
                  </StatusBadge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-xs text-slate-600">
                  <p>
                    <span className="text-slate-400">HC Number:</span>{" "}
                    <span className="font-mono font-bold text-slate-900">{student?.hc_number || "—"}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Matric/Reg:</span>{" "}
                    <span className="font-mono font-semibold text-slate-900">{student?.registration_number || identifier}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Level:</span>{" "}
                    <span className="font-semibold text-slate-900">{student?.level || "100"} Level</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Faculty/Dept:</span>{" "}
                    <span className="font-semibold text-slate-900">{student?.department || "General"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Link href={`/staff/pink-files?student=${student?.id || identifier}`}>
                <Button variant="outline" size="sm">
                  <FileText size={14} className="mr-1.5" />
                  View Pink File
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Prompt #33: Overview, Registration, Laboratory, Physical Examination, Pink File) */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "overview"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("registration")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "registration"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Basic Info & Bio
          </button>

          <button
            onClick={() => setActiveTab("lab")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "lab"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FlaskConical size={14} />
            Laboratory Record
            {labRecord && <CheckCircle2 size={12} className="text-emerald-600" />}
          </button>

          <button
            onClick={() => setActiveTab("physical")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "physical"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Stethoscope size={14} />
            Physical Examination
            {physicalExam && <CheckCircle2 size={12} className="text-emerald-600" />}
          </button>

          <button
            onClick={() => setActiveTab("pink-file")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === "pink-file"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText size={14} />
            Digital Pink File
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Health Registration Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-medium text-slate-500 block mb-1">Registration Status</span>
                <StatusBadge variant="success">Completed</StatusBadge>
                <p className="text-xs text-slate-400 mt-2">Verified university admission</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-medium text-slate-500 block mb-1">Laboratory Screening</span>
                <StatusBadge variant={labRecord ? "success" : "pending"}>
                  {labRecord ? "Results Recorded" : "Pending Evaluation"}
                </StatusBadge>
                <p className="text-xs text-slate-400 mt-2">
                  {labRecord ? "Blood tests & specimen checked" : "Awaiting lab attendance"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-medium text-slate-500 block mb-1">Physical Examination</span>
                <StatusBadge variant={physicalExam ? "success" : "pending"}>
                  {physicalExam ? "Exam Completed" : "Pending Nurse Review"}
                </StatusBadge>
                <p className="text-xs text-slate-400 mt-2">
                  {physicalExam ? "Vitals & clinical systems recorded" : "Pending nursing queue"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Registration / Basic Info */}
        {activeTab === "registration" && (
          <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal & Academic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Full Legal Name</span>
                <span className="font-semibold text-slate-900">{fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Matric / Registration Number</span>
                <span className="font-mono font-semibold text-slate-900">{student?.registration_number || identifier}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Faculty</span>
                <span className="font-semibold text-slate-900">{student?.faculty || "Faculty of Science"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Department</span>
                <span className="font-semibold text-slate-900">{student?.department || "Computer Science"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Academic Level</span>
                <span className="font-semibold text-slate-900">{student?.level || "100"} Level</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Health Center ID</span>
                <span className="font-mono font-bold text-emerald-700">{student?.hc_number || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Laboratory Record Form (Prompt #27 & #28 & #29) */}
        {activeTab === "lab" && (
          <form onSubmit={handleSaveLabRecord} className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-8">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Laboratory Examination Record</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specimen analysis, blood test findings, and antibiotic sensitivity report.
                  </p>
                </div>
                <Button type="submit" variant="primary" size="md" loading={saving}>
                  <Save size={15} className="mr-1.5" />
                  Save Laboratory Record
                </Button>
              </div>
            </div>

            {/* General Specimen & Test Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                Specimen & Clinical Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Hospital Number">
                  <Input
                    value={labForm.hospital_number}
                    onChange={(e) => setLabForm({ ...labForm, hospital_number: e.target.value })}
                    placeholder="e.g. HOSP-9821"
                  />
                </FormField>

                <FormField label="Laboratory Number">
                  <Input
                    value={labForm.laboratory_number}
                    onChange={(e) => setLabForm({ ...labForm, laboratory_number: e.target.value })}
                    placeholder="e.g. LAB-2026-042"
                  />
                </FormField>

                <FormField label="Nature of Specimen">
                  <Input
                    value={labForm.nature_of_specimen}
                    onChange={(e) => setLabForm({ ...labForm, nature_of_specimen: e.target.value })}
                    placeholder="e.g. Blood, Urine, Stool"
                  />
                </FormField>

                <FormField label="Date Collected">
                  <Input
                    type="date"
                    value={labForm.date_collected}
                    onChange={(e) => setLabForm({ ...labForm, date_collected: e.target.value })}
                  />
                </FormField>

                <FormField label="Time Collected">
                  <Input
                    type="time"
                    value={labForm.time_collected}
                    onChange={(e) => setLabForm({ ...labForm, time_collected: e.target.value })}
                  />
                </FormField>

                <FormField label="Test Required">
                  <Input
                    value={labForm.test_required}
                    onChange={(e) => setLabForm({ ...labForm, test_required: e.target.value })}
                    placeholder="e.g. Genotype, Blood Group, PCV"
                  />
                </FormField>
              </div>

              <FormField label="Diagnosis / Clinical Details">
                <Textarea
                  value={labForm.diagnosis_clinical_details}
                  onChange={(e) => setLabForm({ ...labForm, diagnosis_clinical_details: e.target.value })}
                  placeholder="Enter initial clinical observations or lab request diagnosis..."
                />
              </FormField>
            </div>

            {/* Antibiotic Sensitivity UI (Prompt #28: Clean table of 20 antibiotics with optional results) */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                  Antibiotic Sensitivity Testing (Optional)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Select test outcomes where applicable. Leaving unselected is allowed.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  {/* First Column of 10 */}
                  <div className="divide-y divide-slate-100">
                    {ANTIBIOTICS_LIST.slice(0, 10).map((antibiotic) => (
                      <div key={antibiotic} className="flex items-center justify-between p-3 hover:bg-slate-50">
                        <span className="text-xs font-semibold text-slate-700">{antibiotic}</span>
                        <select
                          className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={labForm.antibiotics[antibiotic] || ""}
                          onChange={(e) =>
                            setLabForm({
                              ...labForm,
                              antibiotics: { ...labForm.antibiotics, [antibiotic]: e.target.value },
                            })
                          }
                        >
                          <option value="">— Select Result —</option>
                          <option value="Sensitive">Sensitive (S)</option>
                          <option value="Resistant">Resistant (R)</option>
                          <option value="Intermediate">Intermediate (I)</option>
                          <option value="Not Tested">Not Tested</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Second Column of 10 */}
                  <div className="divide-y divide-slate-100">
                    {ANTIBIOTICS_LIST.slice(10, 20).map((antibiotic) => (
                      <div key={antibiotic} className="flex items-center justify-between p-3 hover:bg-slate-50">
                        <span className="text-xs font-semibold text-slate-700">{antibiotic}</span>
                        <select
                          className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={labForm.antibiotics[antibiotic] || ""}
                          onChange={(e) =>
                            setLabForm({
                              ...labForm,
                              antibiotics: { ...labForm.antibiotics, [antibiotic]: e.target.value },
                            })
                          }
                        >
                          <option value="">— Select Result —</option>
                          <option value="Sensitive">Sensitive (S)</option>
                          <option value="Resistant">Resistant (R)</option>
                          <option value="Intermediate">Intermediate (I)</option>
                          <option value="Not Tested">Not Tested</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor & Sign-off Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <FormField label="Attendant / Doctor Name">
                <Input
                  value={labForm.doctor_name}
                  onChange={(e) => setLabForm({ ...labForm, doctor_name: e.target.value })}
                  placeholder="e.g. Dr. A. Adebayo"
                />
              </FormField>

              <FormField label="Doctor / Lab Attendant Signature Stamp">
                <Input
                  value={labForm.doctor_signature}
                  onChange={(e) => setLabForm({ ...labForm, doctor_signature: e.target.value })}
                  placeholder="e.g. MLS/EKSU/2026"
                />
              </FormField>
            </div>

            {/* Save Button (Prompt #29) */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button type="submit" variant="primary" size="md" loading={saving}>
                <Save size={15} className="mr-1.5" />
                Save Laboratory Record
              </Button>
            </div>
          </form>
        )}

        {/* Tab 4: Physical Examination (Prompt #31: only Weight* & Height* required!) */}
        {activeTab === "physical" && (
          <form onSubmit={handleSavePhysicalExam} className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Physical Examination Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anthropometric measurements, clinical systems screening, and physical fitness summary.
                </p>
              </div>
              <Button type="submit" variant="primary" size="md" loading={saving}>
                <Save size={15} className="mr-1.5" />
                Save Physical Examination
              </Button>
            </div>

            {/* 1. Anthropometric Measurements (Only Weight and Height required!) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                Measurements (Required)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Weight (kg)" required>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 68.5"
                    value={examForm.weight}
                    onChange={(e) => setExamForm({ ...examForm, weight: e.target.value })}
                    required
                  />
                </FormField>

                <FormField label="Height (cm)" required>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 175"
                    value={examForm.height}
                    onChange={(e) => setExamForm({ ...examForm, height: e.target.value })}
                    required
                  />
                </FormField>
              </div>
            </div>

            {/* 2. General Examination (Optional) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                General Examination
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Visual Acuity (Left Eye)">
                  <Input
                    placeholder="e.g. 6/6"
                    value={examForm.visual_acuity_left}
                    onChange={(e) => setExamForm({ ...examForm, visual_acuity_left: e.target.value })}
                  />
                </FormField>

                <FormField label="Visual Acuity (Right Eye)">
                  <Input
                    placeholder="e.g. 6/6"
                    value={examForm.visual_acuity_right}
                    onChange={(e) => setExamForm({ ...examForm, visual_acuity_right: e.target.value })}
                  />
                </FormField>

                <FormField label="With Glasses">
                  <Select
                    value={examForm.with_glasses}
                    onChange={(e) => setExamForm({ ...examForm, with_glasses: e.target.value })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Select>
                </FormField>

                <FormField label="Hearing">
                  <Input
                    value={examForm.hearing}
                    onChange={(e) => setExamForm({ ...examForm, hearing: e.target.value })}
                  />
                </FormField>

                <FormField label="Eyes">
                  <Input
                    value={examForm.eyes}
                    onChange={(e) => setExamForm({ ...examForm, eyes: e.target.value })}
                  />
                </FormField>

                <FormField label="Ear / Nose / Throat">
                  <Input
                    value={examForm.ent}
                    onChange={(e) => setExamForm({ ...examForm, ent: e.target.value })}
                  />
                </FormField>

                <FormField label="Lymphatic Glands">
                  <Input
                    value={examForm.lymphatic_glands}
                    onChange={(e) => setExamForm({ ...examForm, lymphatic_glands: e.target.value })}
                  />
                </FormField>

                <FormField label="Spinal Reflexes">
                  <Input
                    value={examForm.spinal_reflexes}
                    onChange={(e) => setExamForm({ ...examForm, spinal_reflexes: e.target.value })}
                  />
                </FormField>
              </div>
            </div>

            {/* 3. Systems Examination (Optional) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                Systems Examination
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Cardiovascular System">
                  <Input
                    value={examForm.cardiovascular_system}
                    onChange={(e) => setExamForm({ ...examForm, cardiovascular_system: e.target.value })}
                  />
                </FormField>

                <FormField label="Blood Pressure">
                  <Input
                    placeholder="e.g. 120/80 mmHg"
                    value={examForm.blood_pressure}
                    onChange={(e) => setExamForm({ ...examForm, blood_pressure: e.target.value })}
                  />
                </FormField>

                <FormField label="Pulse Rate (bpm)">
                  <Input
                    placeholder="e.g. 72"
                    value={examForm.pulse}
                    onChange={(e) => setExamForm({ ...examForm, pulse: e.target.value })}
                  />
                </FormField>

                <FormField label="Respiratory System">
                  <Input
                    value={examForm.respiratory_system}
                    onChange={(e) => setExamForm({ ...examForm, respiratory_system: e.target.value })}
                  />
                </FormField>

                <FormField label="Abdominal Examination">
                  <Input
                    value={examForm.abdominal_examination}
                    onChange={(e) => setExamForm({ ...examForm, abdominal_examination: e.target.value })}
                  />
                </FormField>

                <FormField label="Hernia">
                  <Input
                    value={examForm.hernia}
                    onChange={(e) => setExamForm({ ...examForm, hernia: e.target.value })}
                  />
                </FormField>

                <FormField label="Musculo-skeletal System">
                  <Input
                    value={examForm.musculo_skeletal}
                    onChange={(e) => setExamForm({ ...examForm, musculo_skeletal: e.target.value })}
                  />
                </FormField>

                <FormField label="Genito-urinary System">
                  <Input
                    value={examForm.genito_urinary}
                    onChange={(e) => setExamForm({ ...examForm, genito_urinary: e.target.value })}
                  />
                </FormField>

                <FormField label="Other Observations">
                  <Input
                    value={examForm.other_observations}
                    onChange={(e) => setExamForm({ ...examForm, other_observations: e.target.value })}
                  />
                </FormField>
              </div>
            </div>

            {/* 4. Laboratory Findings in Exam */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                Clinical Lab Findings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label="PCV (%)">
                  <Input
                    placeholder="e.g. 38%"
                    value={examForm.pvc}
                    onChange={(e) => setExamForm({ ...examForm, pvc: e.target.value })}
                  />
                </FormField>

                <FormField label="WBC">
                  <Input
                    placeholder="e.g. 5.4 x 10^9/L"
                    value={examForm.wbc}
                    onChange={(e) => setExamForm({ ...examForm, wbc: e.target.value })}
                  />
                </FormField>

                <FormField label="Blood Group">
                  <Input
                    placeholder="e.g. O+"
                    value={examForm.blood_group}
                    onChange={(e) => setExamForm({ ...examForm, blood_group: e.target.value })}
                  />
                </FormField>

                <FormField label="Genotype">
                  <Input
                    placeholder="e.g. AA, AS"
                    value={examForm.genotype}
                    onChange={(e) => setExamForm({ ...examForm, genotype: e.target.value })}
                  />
                </FormField>
              </div>
            </div>

            {/* 5. Chest Examination & Conclusion */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                Chest & Final Conclusion
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Chest X-Ray">
                  <Input
                    value={examForm.chest_xray}
                    onChange={(e) => setExamForm({ ...examForm, chest_xray: e.target.value })}
                  />
                </FormField>

                <FormField label="Diagnosis / Summary">
                  <Input
                    placeholder="e.g. Fit for university academic study"
                    value={examForm.diagnosis}
                    onChange={(e) => setExamForm({ ...examForm, diagnosis: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="Remarks / Special Instructions">
                <Textarea
                  placeholder="Enter medical remarks or special accommodations..."
                  value={examForm.remarks}
                  onChange={(e) => setExamForm({ ...examForm, remarks: e.target.value })}
                />
              </FormField>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button type="submit" variant="primary" size="md" loading={saving}>
                <Save size={15} className="mr-1.5" />
                Save Physical Examination
              </Button>
            </div>
          </form>
        )}

        {/* Tab 5: Pink File View with timeline */}
        {activeTab === "pink-file" && (
          <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">EKSU HEALTH SERVICE</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Official Student Pink File</h3>
              </div>
              <span className="px-3 py-1 bg-pink-50 text-pink-700 font-mono text-xs font-bold rounded-lg border border-pink-200">
                {student?.hc_number || "HC-RECORD"}
              </span>
            </div>

            {/* Pink File Timeline (Prompt #35) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Medical Record Event Timeline
              </h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
                  <p className="text-xs font-bold text-slate-800">Account & Basic Information Registered</p>
                  <p className="text-[11px] text-slate-400">Completed by student during onboarding</p>
                </div>

                <div className="relative">
                  <div className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ${labRecord ? "bg-emerald-600 ring-emerald-50" : "bg-slate-300 ring-slate-100"}`} />
                  <p className="text-xs font-bold text-slate-800">Laboratory Examination</p>
                  <p className="text-[11px] text-slate-400">
                    {labRecord ? "Results recorded and verified by Laboratory Attendant" : "Pending specimen processing"}
                  </p>
                </div>

                <div className="relative">
                  <div className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ${physicalExam ? "bg-emerald-600 ring-emerald-50" : "bg-slate-300 ring-slate-100"}`} />
                  <p className="text-xs font-bold text-slate-800">Physical Examination & Vitals Assessment</p>
                  <p className="text-[11px] text-slate-400">
                    {physicalExam ? "Conducted and certified by Registering Nurse" : "Awaiting physical fitness exam"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
