"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/utils";
import { Button, FormField, Input, Select, Textarea, PageHeader, ErrorState, StatusBadge } from "@/components/ui/shared";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "basic_info" | "documents" | "lab_form" | "case_notes" | "done";

const STEPS: { key: Step; label: string }[] = [
  { key: "basic_info", label: "Personal Info" },
  { key: "documents", label: "Documents" },
  { key: "lab_form", label: "Lab Form" },
  { key: "case_notes", label: "Case Notes" },
  { key: "done", label: "Complete" },
];

function StepIndicator({ current, completed }: { current: number; completed: number[] }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done = completed.includes(i);
        const active = i === current;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
              done ? "bg-emerald-100 text-emerald-700" :
              active ? "bg-emerald-600 text-white" :
              "bg-slate-100 text-slate-400"
            )}>
              {done && <CheckCircle2 size={12} />}
              <span>{i + 1}. {step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-slate-200 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

function FileUploadField({ label, onUpload, uploaded }: { label: string; onUpload: (file: File) => Promise<void>; uploaded: boolean }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      await onUpload(file);
      toast.success(`${label} uploaded successfully`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 transition">
        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="Preview" className="h-32 w-24 object-cover rounded-lg mx-auto border border-slate-200" />
            <label className="cursor-pointer text-xs text-emerald-700 hover:underline">
              Replace image <input type="file" accept="image/*" onChange={handle} className="hidden" />
            </label>
          </div>
        ) : (
          <label className="cursor-pointer space-y-2 block">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Upload size={18} />
            </div>
            <p className="text-sm text-slate-500">Drop file or <span className="text-emerald-700 font-medium">browse</span></p>
            <p className="text-xs text-slate-400">JPG, PNG, max 5MB</p>
            <input type="file" accept="image/*" onChange={handle} className="hidden" />
          </label>
        )}
        {loading && <div className="mt-2 h-1 bg-emerald-200 rounded animate-pulse" />}
        {uploaded && !loading && !preview && (
          <p className="mt-2 text-xs text-emerald-600">✓ Already uploaded</p>
        )}
      </div>
    </div>
  );
}

export default function StudentRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // BasicInfo form
  const [basicInfo, setBasicInfo] = useState({
    surname: "", first_name: "", last_name: "", age: "",
    nationality: "", state_of_origin: "", religion: "", marital_status: "",
    date_of_birth: "", sex: "", phone_number: "", home_address: "",
    faculty: "", department: "",
  });

  const setBi = (k: string, v: string) => setBasicInfo(f => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const status = await apiRequest<Record<string, unknown>>("/api/students/onboarding-status");
      const steps = (status.steps as Record<string, boolean>) ?? {};
      const done: number[] = [];
      if (steps.basic_info) done.push(0);
      if (steps.passport) done.push(1);
      if (steps.lab_request) done.push(2);
      if (steps.case_notes) done.push(3);
      if (status.is_complete) done.push(4);
      setCompleted(done);
      // Set starting step
      const firstIncomplete = [0, 1, 2, 3, 4].find(i => !done.includes(i)) ?? 4;
      setCurrentStep(firstIncomplete);

      // Prefill basic info if it exists
      try {
        const bi = await apiRequest<Record<string, unknown>>("/api/students/basic-info");
        if (bi) {
          setBasicInfo((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next)) {
              if (bi[key] !== undefined && bi[key] !== null) {
                next[key as keyof typeof prev] = String(bi[key]);
              }
            }
            return next;
          });
        }
      } catch {}
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markDone = (idx: number) => setCompleted(prev => Array.from(new Set([...prev, idx])));

  const saveBasicInfo = async () => {
    setSaving(true);
    try {
      await apiRequest("/api/students/basic-info", {
        method: "POST",
        body: JSON.stringify({ ...basicInfo, age: Number(basicInfo.age) }),
      });
      markDone(0);
      setCurrentStep(1);
      toast.success("Personal information saved!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (endpoint: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await apiRequest(endpoint, { method: "POST", body: fd });
  };

  if (loading) return <AuthenticatedLayout title="Registration"><div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mt-20" /></AuthenticatedLayout>;
  if (error) return <AuthenticatedLayout title="Registration"><ErrorState onRetry={load} /></AuthenticatedLayout>;

  return (
    <AuthenticatedLayout title="Registration">
      <PageHeader title="Registration" subtitle="Complete all steps to finish your health center registration" />
      <div className="max-w-2xl">
        <StepIndicator current={currentStep} completed={completed} />

        {/* Step 0: Basic Info */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Surname" required>
                <Input value={basicInfo.surname} onChange={e => setBi("surname", e.target.value)} placeholder="Surname" />
              </FormField>
              <FormField label="First Name" required>
                <Input value={basicInfo.first_name} onChange={e => setBi("first_name", e.target.value)} placeholder="First name" />
              </FormField>
              <FormField label="Other Name">
                <Input value={basicInfo.last_name} onChange={e => setBi("last_name", e.target.value)} placeholder="Other name" />
              </FormField>
              <FormField label="Age" required>
                <Input type="number" value={basicInfo.age} onChange={e => setBi("age", e.target.value)} placeholder="Age" />
              </FormField>
              <FormField label="Date of Birth">
                <Input type="date" value={basicInfo.date_of_birth} onChange={e => setBi("date_of_birth", e.target.value)} />
              </FormField>
              <FormField label="Sex">
                <Select value={basicInfo.sex} onChange={e => setBi("sex", e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option>
                </Select>
              </FormField>
              <FormField label="Nationality" required>
                <Input value={basicInfo.nationality} onChange={e => setBi("nationality", e.target.value)} placeholder="e.g. Nigerian" />
              </FormField>
              <FormField label="State of Origin" required>
                <Input value={basicInfo.state_of_origin} onChange={e => setBi("state_of_origin", e.target.value)} placeholder="State" />
              </FormField>
              <FormField label="Religion" required>
                <Select value={basicInfo.religion} onChange={e => setBi("religion", e.target.value)}>
                  <option value="">Select</option>
                  <option>Christianity</option><option>Islam</option><option>Traditional</option><option>Other</option>
                </Select>
              </FormField>
              <FormField label="Marital Status" required>
                <Select value={basicInfo.marital_status} onChange={e => setBi("marital_status", e.target.value)}>
                  <option value="">Select</option>
                  <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                </Select>
              </FormField>
              <FormField label="Phone Number">
                <Input value={basicInfo.phone_number} onChange={e => setBi("phone_number", e.target.value)} placeholder="080..." />
              </FormField>
              <FormField label="Faculty">
                <Input value={basicInfo.faculty} onChange={e => setBi("faculty", e.target.value)} placeholder="Faculty" />
              </FormField>
              <div className="col-span-2">
                <FormField label="Department">
                  <Input value={basicInfo.department} onChange={e => setBi("department", e.target.value)} placeholder="Department" />
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Home Address">
                  <Textarea value={basicInfo.home_address} onChange={e => setBi("home_address", e.target.value)} placeholder="Home address" />
                </FormField>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveBasicInfo} loading={saving}>Save & Continue</Button>
            </div>
          </div>
        )}

        {/* Step 1: Documents */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Upload Documents</h2>
            <div className="grid grid-cols-2 gap-6">
              <FileUploadField
                label="Passport Photograph"
                uploaded={completed.includes(1)}
                onUpload={async (file) => {
                  await uploadFile("/api/students/upload-passport", file);
                  markDone(1);
                }}
              />
              <FileUploadField
                label="Signature"
                uploaded={completed.includes(1)}
                onUpload={async (file) => {
                  await uploadFile("/api/students/upload-signature", file);
                }}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(0)}>Back</Button>
              <Button onClick={() => { markDone(1); setCurrentStep(2); }}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 2: Lab Form */}
        {currentStep === 2 && (
          <LabFormStep
            onBack={() => setCurrentStep(1)}
            onDone={() => { markDone(2); setCurrentStep(3); }}
          />
        )}

        {/* Step 3: Case Notes */}
        {currentStep === 3 && (
          <CaseNotesStep
            onBack={() => setCurrentStep(2)}
            onDone={() => { markDone(3); setCurrentStep(4); }}
          />
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Registration Complete!</h2>
            <p className="text-sm text-slate-500 mb-6">
              Your registration is complete. You can now join the queue when sessions are available.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => window.location.href = "/student/dashboard"} variant="secondary">Go to Dashboard</Button>
              <Button onClick={() => window.location.href = "/student/queue"}>View Queues</Button>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function LabFormStep({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ surname: "", first_name: "", age: "", sex: "", department: "", complaint: "", test_required: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await apiRequest("/api/students/lab-request-form", {
        method: "POST",
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      });
      toast.success("Lab request form submitted!");
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-5">Laboratory Request Form</h2>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Surname" required><Input value={form.surname} onChange={e => set("surname", e.target.value)} /></FormField>
        <FormField label="First Name" required><Input value={form.first_name} onChange={e => set("first_name", e.target.value)} /></FormField>
        <FormField label="Age" required><Input type="number" value={form.age} onChange={e => set("age", e.target.value)} /></FormField>
        <FormField label="Sex" required>
          <Select value={form.sex} onChange={e => set("sex", e.target.value)}>
            <option value="">Select</option><option>Male</option><option>Female</option>
          </Select>
        </FormField>
        <div className="col-span-2">
          <FormField label="Department" required><Input value={form.department} onChange={e => set("department", e.target.value)} /></FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Complaint"><Textarea value={form.complaint} onChange={e => set("complaint", e.target.value)} placeholder="Describe your complaint..." /></FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Test Required"><Input value={form.test_required} onChange={e => set("test_required", e.target.value)} placeholder="e.g. Full blood count, urinalysis..." /></FormField>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={save} loading={saving}>Save & Continue</Button>
      </div>
    </div>
  );
}

function CaseNotesStep({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [form, setForm] = useState({
    surname: "", other_names: "", age: "", date_of_birth: "", home_address: "",
    next_of_kin: "", relationship: "", phone_gsm_number: "", religion: "",
    matric_registration_number: "", home_town: "", state_of_origin: "", sex: "",
    blood_group: "", genotype: "", rhesus_factor: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await apiRequest("/api/students/student-case-notes", {
        method: "POST",
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      });
      toast.success("Case notes saved!");
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-5">Student Case Notes</h2>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Surname" required><Input value={form.surname} onChange={e => set("surname", e.target.value)} /></FormField>
        <FormField label="Other Names" required><Input value={form.other_names} onChange={e => set("other_names", e.target.value)} /></FormField>
        <FormField label="Age" required><Input type="number" value={form.age} onChange={e => set("age", e.target.value)} /></FormField>
        <FormField label="Date of Birth" required><Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} /></FormField>
        <FormField label="Sex" required>
          <Select value={form.sex} onChange={e => set("sex", e.target.value)}>
            <option value="">Select</option><option>Male</option><option>Female</option>
          </Select>
        </FormField>
        <FormField label="Religion" required>
          <Select value={form.religion} onChange={e => set("religion", e.target.value)}>
            <option value="">Select</option><option>Christianity</option><option>Islam</option><option>Traditional</option><option>Other</option>
          </Select>
        </FormField>
        <FormField label="Matric/Registration No." required><Input value={form.matric_registration_number} onChange={e => set("matric_registration_number", e.target.value)} /></FormField>
        <FormField label="Phone Number" required><Input value={form.phone_gsm_number} onChange={e => set("phone_gsm_number", e.target.value)} /></FormField>
        <FormField label="Home Town" required><Input value={form.home_town} onChange={e => set("home_town", e.target.value)} /></FormField>
        <FormField label="State of Origin" required><Input value={form.state_of_origin} onChange={e => set("state_of_origin", e.target.value)} /></FormField>
        <FormField label="Next of Kin" required><Input value={form.next_of_kin} onChange={e => set("next_of_kin", e.target.value)} /></FormField>
        <FormField label="Relationship" required><Input value={form.relationship} onChange={e => set("relationship", e.target.value)} /></FormField>
        <FormField label="Blood Group"><Input value={form.blood_group} onChange={e => set("blood_group", e.target.value)} placeholder="e.g. O+" /></FormField>
        <FormField label="Genotype"><Input value={form.genotype} onChange={e => set("genotype", e.target.value)} placeholder="e.g. AA" /></FormField>
        <div className="col-span-2">
          <FormField label="Home Address" required><Textarea value={form.home_address} onChange={e => set("home_address", e.target.value)} /></FormField>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={save} loading={saving}>Complete Registration</Button>
      </div>
    </div>
  );
}
