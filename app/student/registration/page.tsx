"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { QueueTimingPanel } from "@/components/queue/QueueTiming";
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
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react";
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

// Form steps the backend locks after first submission.
const LOCKED_FORM_STEPS = [0, 3, 5, 7];

interface OnboardingStatus {
  registration_period_active?: boolean;
  message?: string;
  basic_info_submitted?: boolean;
  payment_uploaded?: boolean;
  payment_confirmed?: boolean;
  payment_rejected?: boolean;
  payment_rejection_remark?: string | null;
  payment_receipt_url?: string | null;
  passport_uploaded?: boolean;
  signature_uploaded?: boolean;
  passport_url?: string | null;
  signature_url?: string | null;
  lab_form_submitted?: boolean;
  lab_queue_attended?: boolean;
  med_questionnaire_submitted?: boolean;
  physical_reg_queue_attended?: boolean;
  case_notes_submitted?: boolean;
  registration_complete?: boolean;
}

type PaymentState = "none" | "pending" | "confirmed" | "rejected";

function paymentStateOf(status: OnboardingStatus | null): PaymentState {
  if (!status) return "none";
  if (status.payment_confirmed) return "confirmed";
  if (status.payment_rejected) return "rejected";
  if (status.payment_uploaded) return "pending";
  return "none";
}

function completedStepsOf(status: OnboardingStatus): number[] {
  const checks = [
    status.basic_info_submitted,
    status.payment_confirmed,
    status.passport_uploaded && status.signature_uploaded,
    status.lab_form_submitted,
    status.lab_queue_attended,
    status.med_questionnaire_submitted,
    status.physical_reg_queue_attended,
    status.case_notes_submitted,
    status.registration_complete,
  ];
  return checks.flatMap((done, i) => (done ? [i] : []));
}

// Personal info stores "Male"/"Female"; later forms use "M"/"F".
function toSexCode(sex: string) {
  return sex === "Male" ? "M" : sex === "Female" ? "F" : sex;
}

function isPdfUrl(url: string) {
  return /\.pdf(?:$|[?#])/i.test(url);
}

function StepIndicator({
  current,
  completed,
  reachable,
  paymentState,
  onSelect,
}: {
  current: number;
  completed: number[];
  reachable: number;
  paymentState: PaymentState;
  onSelect: (index: number) => void;
}) {
  const doneCount = completed.filter((i) => i < STEPS.length - 1).length;
  const percent = Math.round((doneCount / (STEPS.length - 1)) * 100);

  const hintFor = (i: number) => {
    if (i !== 1 || completed.includes(1)) return null;
    if (paymentState === "pending") return { text: "Under review", tone: "text-amber-600" };
    if (paymentState === "rejected") return { text: "Rejected", tone: "text-red-600" };
    return null;
  };

  return (
    <nav aria-label="Registration progress" className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">
          Step {current + 1} of {STEPS.length}
        </span>
        <span className="text-slate-500">{percent}% complete</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {STEPS.map((step, i) => {
          const done = completed.includes(i);
          const active = i === current;
          const locked = i > reachable;
          const hint = hintFor(i);
          return (
            <li key={step.key} className="shrink-0">
              <button
                type="button"
                disabled={locked}
                onClick={() => onSelect(i)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition",
                  active && "bg-emerald-50 ring-1 ring-emerald-200",
                  !active && !locked && "hover:bg-slate-50",
                  locked && "cursor-not-allowed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={14} />
                  ) : locked ? (
                    <Lock size={11} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block whitespace-nowrap font-medium",
                      active ? "text-emerald-800" : done ? "text-slate-700" : "text-slate-500",
                    )}
                  >
                    {step.label}
                  </span>
                  {hint && (
                    <span className={cn("block whitespace-nowrap text-[10px] font-medium", hint.tone)}>
                      {hint.text}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepCard({
  step,
  title,
  description,
  children,
  footer,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
          Step {step + 1}
        </p>
        <h2 className="mt-0.5 text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && (
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  );
}

function Notice({
  tone,
  icon,
  title,
  children,
}: {
  tone: "success" | "warning" | "danger" | "info";
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-900",
    info: "border-blue-200 bg-blue-50 text-blue-900",
  };
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", styles[tone])}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  );
}

function UploadDropzone({
  accept,
  hint,
  uploading,
  onFile,
  label = "Choose file",
}: {
  accept: string;
  hint: string;
  uploading: boolean;
  onFile: (file: File) => void;
  label?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30",
        uploading && "pointer-events-none opacity-70",
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        {uploading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        ) : (
          <Upload size={18} />
        )}
      </span>
      <span className="text-sm text-slate-600">
        {uploading ? (
          "Uploading…"
        ) : (
          <>
            <span className="font-medium text-emerald-700">{label}</span> to upload
          </>
        )}
      </span>
      <span className="text-xs text-slate-400">{hint}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function DocumentUploadCard({
  label,
  description,
  existingUrl,
  onUpload,
}: {
  label: string;
  description: string;
  existingUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const imageUrl = preview || existingUrl || null;
  const uploaded = Boolean(existingUrl) && !uploading;

  const handle = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    try {
      await onUpload(file);
      toast.success(`${label} uploaded successfully`);
    } catch (err: unknown) {
      setPreview(null);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-4 transition",
        uploaded ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {uploading ? (
          <StatusBadge variant="info">Uploading…</StatusBadge>
        ) : uploaded ? (
          <StatusBadge variant="success">
            <CheckCircle2 size={12} /> Uploaded
          </StatusBadge>
        ) : (
          <StatusBadge variant="muted">Required</StatusBadge>
        )}
      </div>

      {imageUrl ? (
        <div className="flex flex-1 flex-col items-center gap-3">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${label} preview`}
              className="h-40 w-32 rounded-lg border border-slate-200 bg-white object-contain"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </div>
            )}
            {uploaded && (
              <span className="absolute -right-2 -top-2 rounded-full bg-white text-emerald-500 shadow">
                <CheckCircle2 size={22} />
              </span>
            )}
          </div>
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50",
              uploading && "pointer-events-none opacity-50",
            )}
          >
            <RefreshCw size={12} /> Replace
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void handle(file);
              }}
            />
          </label>
        </div>
      ) : (
        <UploadDropzone
          accept="image/*"
          hint="JPG or PNG, max 5MB"
          uploading={uploading}
          onFile={(file) => void handle(file)}
        />
      )}
    </div>
  );
}

function AlreadySubmitted({
  step,
  title,
  onContinue,
}: {
  step: number;
  title: string;
  onContinue: () => void;
}) {
  return (
    <StepCard
      step={step}
      title={title}
      footer={
        <>
          <span />
          <Button onClick={onContinue}>Continue</Button>
        </>
      }
    >
      <Notice
        tone="success"
        icon={<CheckCircle2 size={18} className="text-emerald-600" />}
        title="Already submitted"
      >
        This form has been submitted and can no longer be edited.
      </Notice>
    </StepCard>
  );
}

export default function StudentRegistrationPage() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const prevPaymentState = useRef<PaymentState | null>(null);

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

  // Fetch onboarding status without the full-page spinner. When `advance` is
  // set, jump to the first incomplete step.
  const refreshStatus = useCallback(async (advance = false) => {
    const next = await apiRequest<OnboardingStatus>(
      "/api/students/onboarding-status",
    );
    const done = completedStepsOf(next);
    setStatus(next);
    setCompleted(done);

    const payment = paymentStateOf(next);
    const previous = prevPaymentState.current;
    if (previous === "pending" && payment === "confirmed") {
      toast.success("Your payment has been confirmed. You can now continue.");
    } else if (previous === "pending" && payment === "rejected") {
      toast.error("Your payment receipt was rejected. Please upload a new one.");
      setCurrentStep(1);
    }
    prevPaymentState.current = payment;

    if (advance) {
      setCurrentStep(
        [0, 1, 2, 3, 4, 5, 6, 7, 8].find((i) => !done.includes(i)) ?? 8,
      );
    }
    return next;
  }, []);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      await refreshStatus(true);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paymentState = paymentStateOf(status);

  // While a receipt is under review, poll so the student sees the admin's
  // decision without reloading.
  useEffect(() => {
    if (currentStep !== 1 || paymentState !== "pending") return;
    const timer = setInterval(() => {
      void refreshStatus().catch(() => {});
    }, 20000);
    return () => clearInterval(timer);
  }, [currentStep, paymentState, refreshStatus]);

  const markDone = (idx: number) =>
    setCompleted((prev) => Array.from(new Set([...prev, idx])));

  const reachable =
    [0, 1, 2, 3, 4, 5, 6, 7, 8].find((i) => !completed.includes(i)) ?? 8;

  const goTo = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveBasicInfo = async () => {
    setSaving(true);
    try {
      await apiRequest("/api/students/basic-info", {
        method: "POST",
        body: JSON.stringify({ ...basicInfo, age: Number(basicInfo.age) }),
      });
      markDone(0);
      goTo(1);
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

  const documentsReady = Boolean(
    status?.passport_uploaded && status?.signature_uploaded,
  );
  const showLocked =
    LOCKED_FORM_STEPS.includes(currentStep) && completed.includes(currentStep);

  return (
    <AuthenticatedLayout title="Registration">
      <PageHeader
        title="Registration"
        subtitle="Complete all steps to finish your health center registration"
      />

      {status?.message && (
        <div className="mb-4">
          <Notice
            tone="info"
            icon={<AlertCircle size={18} className="text-blue-600" />}
            title="Registration notice"
          >
            {status.message}
          </Notice>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-4">
          <StepIndicator
            current={currentStep}
            completed={completed}
            reachable={reachable}
            paymentState={paymentState}
            onSelect={goTo}
          />
        </div>

        <div className="min-w-0 max-w-3xl">
          {showLocked ? (
            <AlreadySubmitted
              step={currentStep}
              title={STEPS[currentStep].label}
              onContinue={() => goTo(Math.min(currentStep + 1, reachable))}
            />
          ) : (
            <>
              {/* Step 0: Basic Info */}
              {currentStep === 0 && (
                <StepCard
                  step={0}
                  title="Personal Information"
                  description="Tell us about yourself. This information is used across your health records."
                  footer={
                    <>
                      <span />
                      <Button onClick={saveBasicInfo} loading={saving}>
                        Save & Continue
                      </Button>
                    </>
                  }
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <div className="sm:col-span-2">
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
                    <div className="sm:col-span-2">
                      <FormField label="Home Address">
                        <Textarea
                          value={basicInfo.home_address}
                          onChange={(e) => setBi("home_address", e.target.value)}
                          placeholder="Home address"
                        />
                      </FormField>
                    </div>
                  </div>
                </StepCard>
              )}

              {/* Step 1: Payment */}
              {currentStep === 1 && (
                <PaymentStep
                  state={paymentState}
                  receiptUrl={status?.payment_receipt_url}
                  rejectionRemark={status?.payment_rejection_remark}
                  onCheckStatus={async () => {
                    await refreshStatus();
                  }}
                  onUpload={async (file) => {
                    await uploadFile("/api/students/upload-payment-receipt", file);
                    toast.success("Receipt uploaded. It is now under review.");
                    await refreshStatus();
                  }}
                  onBack={() => goTo(0)}
                  onContinue={() => goTo(2)}
                />
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <StepCard
                  step={2}
                  title="Upload Documents"
                  description="Upload a recent passport photograph and a clear signature on a white background."
                  footer={
                    <>
                      <Button variant="secondary" onClick={() => goTo(1)}>
                        Back
                      </Button>
                      <div className="flex flex-col items-stretch gap-1 sm:items-end">
                        <Button
                          disabled={!documentsReady}
                          onClick={() => {
                            markDone(2);
                            goTo(3);
                          }}
                        >
                          Continue
                        </Button>
                        {!documentsReady && (
                          <span className="text-center text-[11px] text-slate-500 sm:text-right">
                            Upload both documents to continue
                          </span>
                        )}
                      </div>
                    </>
                  }
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DocumentUploadCard
                      label="Passport Photograph"
                      description="Front-facing, plain background"
                      existingUrl={status?.passport_url}
                      onUpload={async (file) => {
                        await uploadFile("/api/students/upload-passport", file);
                        await refreshStatus();
                      }}
                    />
                    <DocumentUploadCard
                      label="Signature"
                      description="Sign on white paper and snap it"
                      existingUrl={status?.signature_url}
                      onUpload={async (file) => {
                        await uploadFile("/api/students/upload-signature", file);
                        await refreshStatus();
                      }}
                    />
                  </div>
                </StepCard>
              )}

              {/* Step 3: Lab Form */}
              {currentStep === 3 && (
                <LabFormStep
                  basicInfo={basicInfo}
                  onBack={() => goTo(2)}
                  onDone={() => {
                    markDone(3);
                    goTo(4);
                  }}
                />
              )}

              {currentStep === 4 && (
                <QueueStep
                  step={4}
                  title="Laboratory Queue"
                  description="Join the laboratory queue when a session is active. Your lab result is recorded by the lab attendant."
                  queueType="lab_test"
                  onBack={() => goTo(3)}
                  onDone={() => {
                    void refreshStatus(true).catch(() => {});
                  }}
                />
              )}

              {currentStep === 5 && (
                <MedicalQuestionnaireStep
                  basicInfo={basicInfo}
                  onBack={() => goTo(4)}
                  onDone={() => {
                    markDone(5);
                    goTo(6);
                  }}
                />
              )}

              {currentStep === 6 && (
                <QueueStep
                  step={6}
                  title="Physical Registration Queue"
                  description="Join the physical registration queue after your medical questionnaire is submitted."
                  queueType="physical_registration"
                  onBack={() => goTo(5)}
                  onDone={() => {
                    void refreshStatus(true).catch(() => {});
                  }}
                />
              )}

              {/* Step 7: Case Notes */}
              {currentStep === 7 && (
                <CaseNotesStep
                  basicInfo={basicInfo}
                  onBack={() => goTo(6)}
                  onDone={() => {
                    markDone(7);
                    goTo(8);
                  }}
                />
              )}

              {/* Step 8: Complete */}
              {currentStep === 8 && (
                <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 size={36} className="text-emerald-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    Registration Complete!
                  </h2>
                  <p className="mx-auto max-w-sm text-sm text-slate-500 mb-6">
                    Your registration is complete. You can now join the queue
                    when sessions are available.
                  </p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/student/dashboard">
                      <Button variant="secondary" className="w-full">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link href="/student/queue">
                      <Button className="w-full">View Queues</Button>
                    </Link>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function PaymentStep({
  state,
  receiptUrl,
  rejectionRemark,
  onUpload,
  onCheckStatus,
  onBack,
  onContinue,
}: {
  state: PaymentState;
  receiptUrl?: string | null;
  rejectionRemark?: string | null;
  onUpload: (file: File) => Promise<void>;
  onCheckStatus: () => Promise<void>;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const check = async () => {
    setChecking(true);
    try {
      await onCheckStatus();
    } catch {
      toast.error("Could not check payment status. Try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <StepCard
      step={1}
      title="Payment Receipt"
      description="Upload your health center payment receipt. An administrator reviews it before you can continue."
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          {state === "confirmed" ? (
            <Button onClick={onContinue}>Continue to Documents</Button>
          ) : state === "pending" ? (
            <Button variant="outline" onClick={check} loading={checking}>
              <RefreshCw size={14} /> Check Status
            </Button>
          ) : (
            <Button disabled>Continue</Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {state === "confirmed" && (
          <Notice
            tone="success"
            icon={<CheckCircle2 size={18} className="text-emerald-600" />}
            title="Payment confirmed"
          >
            An administrator has confirmed your payment. You can now continue
            to the next step.
          </Notice>
        )}

        {state === "pending" && (
          <Notice
            tone="warning"
            icon={<Clock size={18} className="text-amber-600" />}
            title="Your payment is under review"
          >
            <p>
              Your receipt has been submitted and is waiting for an
              administrator to review it.
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5">
              <li>If it is confirmed, you can move on to the next step.</li>
              <li>If it is rejected, you will be asked to upload a new receipt.</li>
            </ul>
            <p className="mt-2 text-xs opacity-80">
              This page checks for updates automatically.
            </p>
          </Notice>
        )}

        {state === "rejected" && (
          <Notice
            tone="danger"
            icon={<XCircle size={18} className="text-red-600" />}
            title="Your receipt was rejected"
          >
            {rejectionRemark ? (
              <p>
                <span className="font-medium">Reason:</span> {rejectionRemark}
              </p>
            ) : (
              <p>The administrator could not confirm this receipt.</p>
            )}
            <p className="mt-1">Please upload a new, clear receipt below.</p>
          </Notice>
        )}

        {state === "none" && (
          <Notice
            tone="info"
            icon={<AlertCircle size={18} className="text-blue-600" />}
            title="What to upload"
          >
            A clear photo or PDF of your payment receipt showing the RRR or
            receipt number, amount, and date.
          </Notice>
        )}

        {receiptUrl && state !== "rejected" && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
          >
            {isPdfUrl(receiptUrl) ? (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FileText size={22} />
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={receiptUrl}
                alt="Submitted receipt"
                className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-800">
                Submitted receipt
              </span>
              <span className="block text-xs text-slate-500">
                Click to view the file you uploaded
              </span>
            </span>
            <ExternalLink size={14} className="shrink-0 text-slate-400" />
          </a>
        )}

        {(state === "none" || state === "rejected") && (
          <UploadDropzone
            accept="image/*,application/pdf"
            hint="JPG, PNG or PDF, max 5MB"
            label={state === "rejected" ? "Choose a new receipt" : "Choose receipt"}
            uploading={uploading}
            onFile={(file) => void upload(file)}
          />
        )}
      </div>
    </StepCard>
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
    sex: toSexCode(basicInfo.sex),
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
    <StepCard
      step={3}
      title="Laboratory Request Form"
      description="Tell the lab what tests you need. Details from your personal info are filled in for you."
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={save} loading={saving}>
            Save & Continue
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="sm:col-span-2">
          <FormField label="Complaint">
            <Textarea
              value={form.complaint}
              onChange={(e) => set("complaint", e.target.value)}
              placeholder="Describe your complaint..."
            />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField label="Test Required">
            <Input
              value={form.test_required}
              onChange={(e) => set("test_required", e.target.value)}
              placeholder="e.g. Full blood count, urinalysis..."
            />
          </FormField>
        </div>
      </div>
    </StepCard>
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
  start_datetime?: string;
  end_datetime?: string;
  time_per_student_minutes?: number;
}

interface OnboardingQueueEntry {
  id: string;
  queue_number?: number;
  student_name?: string;
  status?: string;
}

function QueueStep({
  step,
  title,
  description,
  queueType,
  onBack,
  onDone,
}: {
  step: number;
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

  const loadQueue = async (silent = false) => {
    if (!silent) setLoading(true);
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
    const timer = setInterval(() => {
      void loadQueue(true);
    }, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const ahead = status?.my_position != null
    ? Math.max(0, status.my_position - 1)
    : null;

  return (
    <StepCard
      step={step}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button variant="outline" onClick={() => { void loadQueue(); onDone(); }}>
            <RefreshCw size={14} /> Refresh Status
          </Button>
        </>
      }
    >
      <div className="space-y-4">
      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
      ) : !status?.session_id ? (
        <Notice tone="info" icon={<Clock size={18} className="text-blue-600" />} title="No active queue session yet">
          Check back later or tap Refresh Status. You can join as soon as a session opens.
        </Notice>
      ) : (
        <>
          <QueueTimingPanel status={status} />
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
      </div>
    </StepCard>
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
    sex: toSexCode(basicInfo.sex),
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
    <StepCard
      step={5}
      title="Medical Examination Questionnaire"
      description="Answer honestly. Use commas to separate multiple history entries."
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={save} loading={saving}>
            Submit Questionnaire
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:col-span-2">Personal details</h3>
        {[
          ["full_name", "Full Name"],
          ["age_last_birthday", "Age"],
          ["date_of_birth", "Date of Birth"],
          ["nationality", "Nationality"],
          ["occupation_of_parent_guardian", "Parent/Guardian Occupation"],
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
        <div className="mt-2 border-t border-slate-100 pt-4 sm:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Medical history</h3>
        </div>
        {[
          ["medical_illness_history", "Previous Illnesses"],
          ["previous_surgeries", "Previous Surgeries"],
          ["previous_hospital_admissions", "Previous Hospital Admissions"],
          ["reasons_for_admission", "Reasons for Admission"],
        ].map(([key, label]) => (
          <div className="sm:col-span-2" key={key}>
            <FormField label={label} required>
              <Textarea
                value={form[key as keyof typeof form]}
                onChange={(e) => set(key, e.target.value)}
                placeholder="Separate entries with commas"
              />
            </FormField>
          </div>
        ))}
        <div className="mt-2 border-t border-slate-100 pt-4 sm:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Have you ever had any of the following?</h3>
        </div>
        {questions.map((key) => (
          <FormField
            key={key}
            label={key.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
            required
          >
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
    </StepCard>
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
    sex: toSexCode(basicInfo.sex),
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
    <StepCard
      step={7}
      title="Student Case Notes"
      description="Final step. Confirm your details and next of kin to complete registration."
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={save} loading={saving}>
            Complete Registration
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="sm:col-span-2">
          <FormField label="Home Address" required>
            <Textarea
              value={form.home_address}
              onChange={(e) => set("home_address", e.target.value)}
            />
          </FormField>
        </div>
      </div>
    </StepCard>
  );
}
