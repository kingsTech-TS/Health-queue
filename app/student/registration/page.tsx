"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/utils";
import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
  PageHeader,
  ErrorState,
  StatusBadge,
} from "@/components/ui/shared";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const FACULTIES = [
  "Agricultural Sciences",
  "Arts",
  "Education",
  "Engineering",
  "Environmental Sciences",
  "Law",
  "Management Sciences",
  "Medicine",
  "Nursing",
  "Pharmacy",
  "Science",
  "Social Sciences",
];
const DEPARTMENTS = [
  "Accounting",
  "Biochemistry",
  "Biological Sciences",
  "Business Administration",
  "Chemical Sciences",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Economics",
  "Education",
  "Electrical/Electronics Engineering",
  "English",
  "Law",
  "Mass Communication",
  "Mathematics",
  "Medicine",
  "Microbiology",
  "Nursing",
  "Pharmacy",
  "Physics",
  "Political Science",
  "Psychology",
  "Public Administration",
  "Sociology",
  "Statistics",
];
const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "AC", "SS", "SC"];
const RELATIONSHIPS = [
  "Parent",
  "Sibling",
  "Spouse",
  "Guardian",
  "Uncle",
  "Aunt",
  "Other",
];

function Options({ values }: { values: string[] }) {
  return (
    <>
      {values.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </>
  );
}

type Step =
  | "basic_info"
  | "payment"
  | "documents"
  | "lab_form"
  | "lab_queue"
  | "medical"
  | "physical_registration"
  | "case_notes"
  | "done";

const STEPS: { key: Step; label: string }[] = [
  { key: "basic_info", label: "Personal Info" },
  { key: "payment", label: "Payment" },
  { key: "documents", label: "Documents" },
  { key: "lab_form", label: "Lab Form" },
  { key: "lab_queue", label: "Lab Queue" },
  { key: "medical", label: "Medical History" },
  { key: "physical_registration", label: "Physical Registration" },
  { key: "case_notes", label: "Case Notes" },
  { key: "done", label: "Complete" },
];

function StepIndicator({
  current,
  completed,
}: {
  current: number;
  completed: number[];
}) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done = completed.includes(i);
        const active = i === current;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                done
                  ? "bg-emerald-100 text-emerald-700"
                  : active
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400",
              )}
            >
              {done && <CheckCircle2 size={12} />}
              <span>
                {i + 1}. {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-4 h-px bg-slate-200 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FileUploadField({
  label,
  onUpload,
  uploaded,
}: {
  label: string;
  onUpload: (file: File) => Promise<void>;
  uploaded: boolean;
}) {
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
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 transition">
        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-24 object-cover rounded-lg mx-auto border border-slate-200"
            />
            <label className="cursor-pointer text-xs text-emerald-700 hover:underline">
              Replace image{" "}
              <input
                type="file"
                accept="image/*"
                onChange={handle}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <label className="cursor-pointer space-y-2 block">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Upload size={18} />
            </div>
            <p className="text-sm text-slate-500">
              Drop file or{" "}
              <span className="text-emerald-700 font-medium">browse</span>
            </p>
            <p className="text-xs text-slate-400">JPG, PNG, max 5MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handle}
              className="hidden"
            />
          </label>
        )}
        {loading && (
          <div className="mt-2 h-1 bg-emerald-200 rounded animate-pulse" />
        )}
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
  const [paymentRejected, setPaymentRejected] = useState(false);
  const [paymentRejectionRemark, setPaymentRejectionRemark] = useState<
    string | undefined
  >();

  // BasicInfo form
  const [basicInfo, setBasicInfo] = useState({
    surname: "",
    first_name: "",
    last_name: "",
    age: "",
    nationality: "",
    state_of_origin: "",
    religion: "",
    marital_status: "",
    date_of_birth: "",
    sex: "",
    phone_number: "",
    home_address: "",
    faculty: "",
    department: "",
  });

  const setBi = (k: string, v: string) =>
    setBasicInfo((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const status = await apiRequest<Record<string, unknown>>(
        "/api/students/onboarding-status",
      );
      const isDone = (key: string) => Boolean(status[key]);
      setPaymentRejected(Boolean(status.payment_rejected));
      setPaymentRejectionRemark(
        typeof status.payment_rejection_remark === "string"
          ? status.payment_rejection_remark
          : undefined,
      );
      const done: number[] = [];
      if (isDone("basic_info_submitted")) done.push(0);
      if (isDone("payment_confirmed")) done.push(1);
      if (isDone("passport_uploaded") && isDone("signature_uploaded"))
        done.push(2);
      if (isDone("lab_form_submitted")) done.push(3);
      if (isDone("lab_queue_attended")) done.push(4);
      if (isDone("med_questionnaire_submitted")) done.push(5);
      if (isDone("physical_reg_queue_attended")) done.push(6);
      if (isDone("case_notes_submitted")) done.push(7);
      if (isDone("registration_complete")) done.push(8);
      setCompleted(done);
      // Set starting step
      const firstIncomplete =
        [0, 1, 2, 3, 4, 5, 6, 7, 8].find((i) => !done.includes(i)) ?? 8;
      setCurrentStep(firstIncomplete);

      // Prefill basic info if it exists
      try {
        const bi = await apiRequest<Record<string, unknown>>(
          "/api/students/basic-info",
        );
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

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, []);

  const markDone = (idx: number) =>
    setCompleted((prev) => Array.from(new Set([...prev, idx])));

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

  if (loading)
    return (
      <AuthenticatedLayout title="Registration">
        <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mt-20" />
      </AuthenticatedLayout>
    );
  if (error)
    return (
      <AuthenticatedLayout title="Registration">
        <ErrorState onRetry={load} />
      </AuthenticatedLayout>
    );

  return (
    <AuthenticatedLayout title="Registration">
      <PageHeader
        title="Registration"
        subtitle="Complete all steps to finish your health center registration"
      />
      <div className="max-w-2xl">
        <StepIndicator current={currentStep} completed={completed} />

        {/* Step 0: Basic Info */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Surname" required>
                <Input
                  value={basicInfo.surname}
                  onChange={(e) => setBi("surname", e.target.value)}
                  placeholder="Surname"
                />
              </FormField>
              <FormField label="First Name" required>
                <Input
                  value={basicInfo.first_name}
                  onChange={(e) => setBi("first_name", e.target.value)}
                  placeholder="First name"
                />
              </FormField>
              <FormField label="Other Name">
                <Input
                  value={basicInfo.last_name}
                  onChange={(e) => setBi("last_name", e.target.value)}
                  placeholder="Other name"
                />
              </FormField>
              <FormField label="Age" required>
                <Input
                  type="number"
                  value={basicInfo.age}
                  onChange={(e) => setBi("age", e.target.value)}
                  placeholder="Age"
                />
              </FormField>
              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={basicInfo.date_of_birth}
                  onChange={(e) => setBi("date_of_birth", e.target.value)}
                />
              </FormField>
              <FormField label="Sex">
                <Select
                  value={basicInfo.sex}
                  onChange={(e) => setBi("sex", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </Select>
              </FormField>
              <FormField label="Nationality" required>
                <Input
                  value={basicInfo.nationality}
                  onChange={(e) => setBi("nationality", e.target.value)}
                  placeholder="e.g. Nigerian"
                />
              </FormField>
              <FormField label="State of Origin" required>
                <Select
                  required
                  value={basicInfo.state_of_origin}
                  onChange={(e) => setBi("state_of_origin", e.target.value)}
                >
                  <option value="">Select state</option>
                  <Options values={NIGERIAN_STATES} />
                </Select>
              </FormField>
              <FormField label="Religion" required>
                <Select
                  value={basicInfo.religion}
                  onChange={(e) => setBi("religion", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Christianity</option>
                  <option>Islam</option>
                  <option>Traditional</option>
                  <option>Other</option>
                </Select>
              </FormField>
              <FormField label="Marital Status" required>
                <Select
                  value={basicInfo.marital_status}
                  onChange={(e) => setBi("marital_status", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </Select>
              </FormField>
              <FormField label="Phone Number">
                <Input
                  value={basicInfo.phone_number}
                  onChange={(e) => setBi("phone_number", e.target.value)}
                  placeholder="080..."
                />
              </FormField>
              <FormField label="Faculty">
                <Select
                  required
                  value={basicInfo.faculty}
                  onChange={(e) => setBi("faculty", e.target.value)}
                >
                  <option value="">Select faculty</option>
                  <Options values={FACULTIES} />
                </Select>
              </FormField>
              <div className="col-span-2">
                <FormField label="Department" required>
                  <Select
                    required
                    value={basicInfo.department}
                    onChange={(e) => setBi("department", e.target.value)}
                  >
                    <option value="">Select department</option>
                    <Options values={DEPARTMENTS} />
                  </Select>
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Home Address">
                  <Textarea
                    value={basicInfo.home_address}
                    onChange={(e) => setBi("home_address", e.target.value)}
                    placeholder="Home address"
                  />
                </FormField>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveBasicInfo} loading={saving}>
                Save & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Payment */}
        {currentStep === 1 && (
          <PaymentStep
            uploaded={Boolean(completed.includes(1))}
            rejected={paymentRejected}
            rejectionRemark={paymentRejectionRemark}
            onUpload={async (file) => {
              await uploadFile("/api/students/upload-payment-receipt", file);
              toast.success(
                "Receipt uploaded. Waiting for admin confirmation.",
              );
              await load();
            }}
          />
        )}

        {/* Step 2: Documents */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Upload Documents
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <FileUploadField
                label="Passport Photograph"
                uploaded={Boolean(completed.includes(2))}
                onUpload={async (file) => {
                  await uploadFile("/api/students/upload-passport", file);
                  await load();
                }}
              />
              <FileUploadField
                label="Signature"
                uploaded={Boolean(completed.includes(2))}
                onUpload={async (file) => {
                  await uploadFile("/api/students/upload-signature", file);
                }}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(3);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Lab Form */}
        {currentStep === 3 && (
          <LabFormStep
            basicInfo={basicInfo}
            onBack={() => setCurrentStep(2)}
            onDone={() => {
              markDone(3);
              setCurrentStep(4);
            }}
          />
        )}

        {currentStep === 4 && (
          <QueueStep
            title="Laboratory Queue"
            description="Join the laboratory queue when a session is active. Your lab result is recorded by the lab attendant."
            queueType="lab_test"
            onBack={() => setCurrentStep(3)}
            onDone={() => {
              void load();
            }}
          />
        )}

        {currentStep === 5 && (
          <MedicalQuestionnaireStep
            basicInfo={basicInfo}
            onBack={() => setCurrentStep(4)}
            onDone={() => {
              markDone(5);
              setCurrentStep(6);
            }}
          />
        )}

        {currentStep === 6 && (
          <QueueStep
            title="Physical Registration Queue"
            description="Join the physical registration queue after your medical questionnaire is submitted."
            queueType="physical_registration"
            onBack={() => setCurrentStep(5)}
            onDone={() => {
              void load();
            }}
          />
        )}

        {/* Step 7: Case Notes */}
        {currentStep === 7 && (
          <CaseNotesStep
            basicInfo={basicInfo}
            onBack={() => setCurrentStep(6)}
            onDone={() => {
              markDone(7);
              setCurrentStep(8);
            }}
          />
        )}

        {/* Step 8: Complete */}
        {currentStep === 8 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Registration Complete!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Your registration is complete. You can now join the queue when
              sessions are available.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => (window.location.href = "/student/dashboard")}
                variant="secondary"
              >
                Go to Dashboard
              </Button>
              <Button onClick={() => (window.location.href = "/student/queue")}>
                View Queues
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function LabFormStep({
  basicInfo,
  onBack,
  onDone,
}: {
  basicInfo: {
    surname: string;
    first_name: string;
    age: string;
    sex: string;
    faculty: string;
    department: string;
  };
  onBack: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    surname: basicInfo.surname,
    first_name: basicInfo.first_name,
    age: basicInfo.age,
    sex: basicInfo.sex,
    faculty: basicInfo.faculty,
    department: basicInfo.department,
    complaint: "",
    test_required: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      <h2 className="text-base font-semibold text-slate-900 mb-5">
        Laboratory Request Form
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Surname" required>
          <Input
            value={form.surname}
            onChange={(e) => set("surname", e.target.value)}
          />
        </FormField>
        <FormField label="First Name" required>
          <Input
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
          />
        </FormField>
        <FormField label="Age" required>
          <Input
            type="number"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
          />
        </FormField>
        <FormField label="Sex" required>
          <Select value={form.sex} onChange={(e) => set("sex", e.target.value)}>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </Select>
        </FormField>
        <FormField label="Faculty" required>
          <Select
            required
            value={form.faculty}
            onChange={(e) => set("faculty", e.target.value)}
          >
            <option value="">Select faculty</option>
            <Options values={FACULTIES} />
          </Select>
        </FormField>
        <div>
          <FormField label="Department" required>
            <Select
              required
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            >
              <option value="">Select department</option>
              <Options values={DEPARTMENTS} />
            </Select>
          </FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Complaint">
            <Textarea
              value={form.complaint}
              onChange={(e) => set("complaint", e.target.value)}
              placeholder="Describe your complaint..."
            />
          </FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Test Required">
            <Input
              value={form.test_required}
              onChange={(e) => set("test_required", e.target.value)}
              placeholder="e.g. Full blood count, urinalysis..."
            />
          </FormField>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={save} loading={saving}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({
  uploaded,
  rejected,
  rejectionRemark,
  onUpload,
}: {
  uploaded: boolean;
  rejected: boolean;
  rejectionRemark?: string;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-base font-semibold text-slate-900">
        Payment Receipt
      </h2>
      <p className="text-sm text-slate-500">
        Upload your health center payment receipt. An administrator must confirm
        it before the next registration step becomes available.
      </p>
      {rejected && (
        <p className="text-sm text-red-600">
          Your receipt was rejected.{" "}
          {rejectionRemark || "Upload a corrected receipt."}
        </p>
      )}
      <FileUploadField
        label="Payment Receipt"
        uploaded={uploaded}
        onUpload={onUpload}
      />
      {uploaded && (
        <p className="text-sm text-amber-600">
          Receipt submitted. This step will continue automatically after admin
          confirmation.
        </p>
      )}
    </div>
  );
}

interface OnboardingQueueStatus {
  session_id?: string;
  is_eligible?: boolean;
  already_joined?: boolean;
  my_queue_number?: number | null;
  my_position?: number | null;
  current_number?: number | null;
  total_students?: number;
  max_students?: number;
}

interface OnboardingQueueEntry {
  id: string;
  queue_number?: number;
  student_name?: string;
  status?: string;
}

function QueueStep({
  title,
  description,
  queueType,
  onBack,
  onDone,
}: {
  title: string;
  description: string;
  queueType: "lab_test" | "physical_registration";
  onBack: () => void;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<OnboardingQueueStatus | null>(null);
  const [entries, setEntries] = useState<OnboardingQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const nextStatus = await apiRequest<OnboardingQueueStatus>(
        `/api/queues/status/${queueType}`,
      );
      setStatus(nextStatus);
      if (nextStatus.session_id) {
        const nextEntries = await apiRequest<OnboardingQueueEntry[]>(
          `/api/queues/sessions/${nextStatus.session_id}/public-entries`,
        );
        setEntries(nextEntries || []);
      } else {
        setEntries([]);
      }
    } catch {
      setStatus(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadQueue();
    });
  }, [queueType]);

  const join = async () => {
    try {
      setJoining(true);
      await apiRequest(`/api/queues/join-active/${queueType}`, { method: "POST" });
      toast.success("You have joined the queue.");
      await loadQueue();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to join queue");
    } finally {
      setJoining(false);
    }
  };

  const ahead = status?.my_position != null && status.current_number != null
    ? Math.max(0, status.my_position - 1)
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
      ) : !status?.session_id ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">No active queue session is available yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-bold text-slate-900">{status.total_students ?? entries.length}</p><p className="text-[11px] text-slate-500">In queue</p></div>
            <div className="rounded-lg bg-emerald-50 p-3"><p className="text-xl font-bold text-emerald-700">{status.current_number ?? 0}</p><p className="text-[11px] text-emerald-600">Now serving</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-bold text-slate-900">{status.max_students ?? "-"}</p><p className="text-[11px] text-slate-500">Capacity</p></div>
          </div>
          {status.already_joined && <p className="rounded-lg bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700">Your queue number: #{String(status.my_queue_number ?? 0).padStart(3, "0")} {ahead != null ? `• ${ahead} ahead` : ""}</p>}
          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
            {entries.length === 0 ? <p className="p-4 text-center text-sm text-slate-400">No students have joined yet.</p> : entries.map((entry) => <div key={entry.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0"><span className="font-mono font-semibold">#{String(entry.queue_number ?? 0).padStart(3, "0")}</span><span className="text-slate-600">{entry.student_name || "Student"}</span><StatusBadge variant={entry.status === "called" ? "warning" : entry.status === "completed" ? "success" : "pending"}>{entry.status || "waiting"}</StatusBadge></div>)}
          </div>
          {status.is_eligible && !status.already_joined && <Button onClick={join} loading={joining} className="w-full">Join Queue</Button>}
        </>
      )}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button variant="outline" onClick={() => { void loadQueue(); onDone(); }}>Refresh Status</Button>
      </div>
    </div>
  );
}

function MedicalQuestionnaireStep({
  basicInfo,
  onBack,
  onDone,
}: {
  basicInfo: {
    surname: string;
    first_name: string;
    age: string;
    date_of_birth: string;
    sex: string;
    nationality: string;
    state_of_origin: string;
    religion: string;
    faculty: string;
    department: string;
  };
  onBack: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    full_name: `${basicInfo.surname} ${basicInfo.first_name}`.trim(),
    age_last_birthday: basicInfo.age,
    date_of_birth: basicInfo.date_of_birth,
    sex: basicInfo.sex,
    marital_status: "",
    nationality: basicInfo.nationality || "Nigerian",
    state_of_origin: basicInfo.state_of_origin,
    religion: basicInfo.religion,
    occupation_of_parent_guardian: "",
    faculty: basicInfo.faculty,
    department: basicInfo.department,
    medical_illness_history: "",
    previous_surgeries: "",
    previous_hospital_admissions: "",
    reasons_for_admission: "",
    tuberculosis: "no",
    diabetes: "no",
    epilepsy: "no",
    sickle_cell_disease: "no",
    asthma: "no",
    psychiatric_illness: "no",
    visual_impairment: "no",
    sexually_transmitted_disease: "no",
    menstrual_disorder: "no",
    allergies: "",
    current_medications: "",
    family_medical_history: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setSaving(true);
    try {
      const lists = (value: string) =>
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      await apiRequest("/api/students/medical-examination-questionnaire", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          age_last_birthday: Number(form.age_last_birthday),
          medical_illness_history: lists(form.medical_illness_history),
          previous_surgeries: lists(form.previous_surgeries),
          previous_hospital_admissions: lists(
            form.previous_hospital_admissions,
          ),
          reasons_for_admission: lists(form.reasons_for_admission),
        }),
      });
      toast.success("Medical questionnaire submitted!");
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };
  const questions = [
    "tuberculosis",
    "diabetes",
    "epilepsy",
    "sickle_cell_disease",
    "asthma",
    "psychiatric_illness",
    "visual_impairment",
    "sexually_transmitted_disease",
    "menstrual_disorder",
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Medical Examination Questionnaire
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Use commas to separate multiple history entries.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          ["full_name", "Full Name"],
          ["age_last_birthday", "Age"],
          ["date_of_birth", "Date of Birth"],
          ["nationality", "Nationality"],
          ["state_of_origin", "State of Origin"],
          ["religion", "Religion"],
          ["occupation_of_parent_guardian", "Parent/Guardian Occupation"],
          ["faculty", "Faculty"],
          ["department", "Department"],
        ].map(([key, label]) => (
          <FormField key={key} label={label} required>
            <Input
              type={
                key === "date_of_birth"
                  ? "date"
                  : key === "age_last_birthday"
                    ? "number"
                    : "text"
              }
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key, e.target.value)}
            />
          </FormField>
        ))}
        <FormField label="Sex" required>
          <Select value={form.sex} onChange={(e) => set("sex", e.target.value)}>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </Select>
        </FormField>
        <FormField label="Marital Status" required>
          <Select
            value={form.marital_status}
            onChange={(e) => set("marital_status", e.target.value)}
          >
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
          </Select>
        </FormField>
        <FormField label="State of Origin" required>
          <Select
            value={form.state_of_origin}
            onChange={(e) => set("state_of_origin", e.target.value)}
          >
            <option value="">Select state</option>
            <Options values={NIGERIAN_STATES} />
          </Select>
        </FormField>
        <FormField label="Religion" required>
          <Select
            value={form.religion}
            onChange={(e) => set("religion", e.target.value)}
          >
            <option value="">Select religion</option>
            <option>Christianity</option>
            <option>Islam</option>
            <option>Traditional</option>
            <option>Other</option>
          </Select>
        </FormField>
        <FormField label="Faculty" required>
          <Select
            value={form.faculty}
            onChange={(e) => set("faculty", e.target.value)}
          >
            <option value="">Select faculty</option>
            <Options values={FACULTIES} />
          </Select>
        </FormField>
        <FormField label="Department" required>
          <Select
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
          >
            <option value="">Select department</option>
            <Options values={DEPARTMENTS} />
          </Select>
        </FormField>
        {[
          ["medical_illness_history", "Previous Illnesses"],
          ["previous_surgeries", "Previous Surgeries"],
          ["previous_hospital_admissions", "Previous Hospital Admissions"],
          ["reasons_for_admission", "Reasons for Admission"],
        ].map(([key, label]) => (
          <div className="col-span-2" key={key}>
            <FormField label={label} required>
              <Textarea
                value={form[key as keyof typeof form]}
                onChange={(e) => set(key, e.target.value)}
                placeholder="Separate entries with commas"
              />
            </FormField>
          </div>
        ))}
        {questions.map((key) => (
          <FormField key={key} label={key.replaceAll("_", " ")} required>
            <Select
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key, e.target.value)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </FormField>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={save} loading={saving}>
          Submit Questionnaire
        </Button>
      </div>
    </div>
  );
}

function CaseNotesStep({
  basicInfo,
  onBack,
  onDone,
}: {
  basicInfo: {
    surname: string;
    first_name: string;
    age: string;
    date_of_birth: string;
    sex: string;
    state_of_origin: string;
    religion: string;
  };
  onBack: () => void;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    surname: basicInfo.surname,
    other_names: basicInfo.first_name,
    age: basicInfo.age,
    date_of_birth: basicInfo.date_of_birth,
    home_address: "",
    next_of_kin: "",
    relationship: "",
    phone_gsm_number: "",
    religion: basicInfo.religion,
    matric_registration_number: "",
    home_town: "",
    state_of_origin: basicInfo.state_of_origin,
    sex: basicInfo.sex,
    blood_group: "",
    genotype: "",
    rhesus_factor: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      <h2 className="text-base font-semibold text-slate-900 mb-5">
        Student Case Notes
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Surname" required>
          <Input
            value={form.surname}
            onChange={(e) => set("surname", e.target.value)}
          />
        </FormField>
        <FormField label="Other Names" required>
          <Input
            value={form.other_names}
            onChange={(e) => set("other_names", e.target.value)}
          />
        </FormField>
        <FormField label="Age" required>
          <Input
            type="number"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
          />
        </FormField>
        <FormField label="Date of Birth" required>
          <Input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => set("date_of_birth", e.target.value)}
          />
        </FormField>
        <FormField label="Sex" required>
          <Select value={form.sex} onChange={(e) => set("sex", e.target.value)}>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </Select>
        </FormField>
        <FormField label="Religion" required>
          <Select
            value={form.religion}
            onChange={(e) => set("religion", e.target.value)}
          >
            <option value="">Select</option>
            <option>Christianity</option>
            <option>Islam</option>
            <option>Traditional</option>
            <option>Other</option>
          </Select>
        </FormField>
        <FormField label="Matric/Registration No." required>
          <Input
            value={form.matric_registration_number}
            onChange={(e) => set("matric_registration_number", e.target.value)}
          />
        </FormField>
        <FormField label="Phone Number" required>
          <Input
            value={form.phone_gsm_number}
            onChange={(e) => set("phone_gsm_number", e.target.value)}
          />
        </FormField>
        <FormField label="Home Town" required>
          <Input
            value={form.home_town}
            onChange={(e) => set("home_town", e.target.value)}
          />
        </FormField>
        <FormField label="State of Origin" required>
          <Select
            value={form.state_of_origin}
            onChange={(e) => set("state_of_origin", e.target.value)}
          >
            <option value="">Select state</option>
            <Options values={NIGERIAN_STATES} />
          </Select>
        </FormField>
        <FormField label="Next of Kin" required>
          <Input
            value={form.next_of_kin}
            onChange={(e) => set("next_of_kin", e.target.value)}
          />
        </FormField>
        <FormField label="Relationship" required>
          <Select
            required
            value={form.relationship}
            onChange={(e) => set("relationship", e.target.value)}
          >
            <option value="">Select relationship</option>
            <Options values={RELATIONSHIPS} />
          </Select>
        </FormField>
        <FormField label="Blood Group">
          <Select
            value={form.blood_group}
            onChange={(e) => set("blood_group", e.target.value)}
          >
            <option value="">Select blood group</option>
            <Options values={BLOOD_GROUPS} />
          </Select>
        </FormField>
        <FormField label="Genotype">
          <Select
            value={form.genotype}
            onChange={(e) => set("genotype", e.target.value)}
          >
            <option value="">Select genotype</option>
            <Options values={GENOTYPES} />
          </Select>
        </FormField>
        <div className="col-span-2">
          <FormField label="Home Address" required>
            <Textarea
              value={form.home_address}
              onChange={(e) => set("home_address", e.target.value)}
            />
          </FormField>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={save} loading={saving}>
          Complete Registration
        </Button>
      </div>
    </div>
  );
}
