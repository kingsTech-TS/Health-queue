"use client";

import { useEffect, useState, useMemo } from "react";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/utils";
import {
  Button,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  Modal,
  PageHeader,
  StatusBadge,
  TableSkeleton,
  Textarea,
} from "@/components/ui/shared";
import {
  CheckCircle2,
  FileImage,
  FileText,
  RefreshCw,
  Search,
  XCircle,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

type FilterTab =
  | "pending"
  | "likely_valid"
  | "suspicious"
  | "manual_review"
  | "confirmed"
  | "rejected"
  | "all";

interface PaymentAiReview {
  decision?: "likely_valid" | "likely_invalid" | "needs_manual_review";
  confidence?: number;
  rrr_or_reference?: string | null;
  amount?: string | null;
  payment_date?: string | null;
  institution?: string | null;
  receipt_number?: string | null;
  reason?: string | null;
  extracted_fields?: Record<string, unknown>;
  status?: string;
  model?: string;
}

interface PaymentRecord {
  id: string;
  full_name?: string;
  registration_number?: string;
  faculty?: string;
  department?: string;
  level?: string | number;
  payment_receipt_url?: string;
  payment_receipt_uploaded_at?: string;
  payment_confirmed?: boolean;
  payment_rejected?: boolean;
  payment_rejection_remark?: string | null;
  payment_ai_review?: PaymentAiReview | null;
  payment_ai_reviewed_at?: string | null;
}

interface ReviewQueueResponse {
  counts: {
    likely_valid: number;
    suspicious: number;
    manual_review: number;
  };
  groups: {
    likely_valid: PaymentRecord[];
    suspicious: PaymentRecord[];
    manual_review: PaymentRecord[];
  };
}

function ReceiptPreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const isPdf = /\.pdf(?:$|[?#])/i.test(url);

  if (isPdf) {
    return (
      <iframe
        src={url}
        title="Student payment receipt"
        className="h-[520px] w-full rounded-lg border border-slate-200 bg-white"
      />
    );
  }

  if (failed) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
        <FileText size={32} className="mb-2 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">Receipt preview unavailable</p>
        <p className="mt-1 text-xs text-slate-500">The uploaded file could not be displayed in the browser.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
        >
          Open in new tab <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={url}
        alt="Student payment receipt"
        onError={() => setFailed(true)}
        className="max-h-[520px] w-full rounded-lg border border-slate-200 bg-white object-contain"
      />
      <div className="mt-2 text-right">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 hover:underline"
        >
          View full size <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

function AiDecisionBadge({ review }: { review?: PaymentAiReview | null }) {
  if (!review || !review.decision) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        <HelpCircle size={12} /> Not Analyzed
      </span>
    );
  }

  const confidencePct =
    review.confidence !== undefined ? `${Math.round(review.confidence * 100)}%` : null;

  if (review.decision === "likely_valid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
        <ShieldCheck size={13} className="text-emerald-600" />
        Likely Valid {confidencePct && <span className="opacity-75 font-normal">({confidencePct})</span>}
      </span>
    );
  }

  if (review.decision === "likely_invalid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-semibold text-red-800">
        <ShieldAlert size={13} className="text-red-600" />
        Suspicious {confidencePct && <span className="opacity-75 font-normal">({confidencePct})</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
      <AlertTriangle size={13} className="text-amber-600" />
      Manual Review {confidencePct && <span className="opacity-75 font-normal">({confidencePct})</span>}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [queueCounts, setQueueCounts] = useState<{
    likely_valid: number;
    suspicious: number;
    manual_review: number;
  }>({ likely_valid: 0, suspicious: 0, manual_review: 0 });

  const [loading, setLoading] = useState(true);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("pending");

  // Selection for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"confirm" | "reject" | null>(null);
  const [bulkRemark, setBulkRemark] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Single review modal
  const [selected, setSelected] = useState<PaymentRecord | null>(null);
  const [processing, setProcessing] = useState<"confirm" | "reject" | null>(null);
  const [rejectionRemark, setRejectionRemark] = useState("");

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [allStudents, reviewQueue] = await Promise.all([
        apiRequest<PaymentRecord[]>("/api/admin/students"),
        apiRequest<ReviewQueueResponse>("/api/admin/payment-review-queue").catch(() => null),
      ]);

      setPayments(allStudents || []);
      if (reviewQueue?.counts) {
        setQueueCounts(reviewQueue.counts);
      }
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

  // Run or refresh AI analysis
  const runAiAnalysis = async (specificIds?: string[]) => {
    try {
      setAnalyzingAi(true);
      const res = await apiRequest<{
        message: string;
        analyzed_count: number;
        failed_count: number;
      }>("/api/admin/payment-review/analyze", {
        method: "POST",
        body: JSON.stringify(specificIds ? { student_ids: specificIds } : {}),
      });
      toast.success(
        res?.message || `AI Review analyzed ${res?.analyzed_count || 0} receipt(s).`
      );
      await load();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to run AI receipt analysis"
      );
    } finally {
      setAnalyzingAi(false);
    }
  };

  // Filtered payments
  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      if (!payment.payment_receipt_url) return false;

      // Tab filter
      if (tab === "pending") {
        if (payment.payment_confirmed || payment.payment_rejected) return false;
      } else if (tab === "likely_valid") {
        if (payment.payment_confirmed || payment.payment_rejected) return false;
        if (payment.payment_ai_review?.decision !== "likely_valid") return false;
      } else if (tab === "suspicious") {
        if (payment.payment_confirmed || payment.payment_rejected) return false;
        if (payment.payment_ai_review?.decision !== "likely_invalid") return false;
      } else if (tab === "manual_review") {
        if (payment.payment_confirmed || payment.payment_rejected) return false;
        const dec = payment.payment_ai_review?.decision;
        if (dec === "likely_valid" || dec === "likely_invalid") return false;
      } else if (tab === "confirmed") {
        if (!payment.payment_confirmed) return false;
      } else if (tab === "rejected") {
        if (!payment.payment_rejected) return false;
      }

      // Search query
      const query = search.trim().toLowerCase();
      if (!query) return true;

      const review = payment.payment_ai_review;
      return [
        payment.full_name,
        payment.registration_number,
        payment.faculty,
        payment.department,
        review?.rrr_or_reference,
        review?.receipt_number,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(query));
    });
  }, [payments, tab, search]);

  // Bulk selection helpers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectable = filtered
        .filter((p) => !p.payment_confirmed && !p.payment_rejected)
        .map((p) => p.id);
      setSelectedIds(selectable);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Confirm
  const executeBulkConfirm = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkSubmitting(true);
      const res = await apiRequest<{ confirmed_count: number; message: string }>(
        "/api/admin/confirm-payments/bulk",
        {
          method: "POST",
          body: JSON.stringify({ student_ids: selectedIds }),
        }
      );
      toast.success(res?.message || `Confirmed ${res?.confirmed_count} payment(s).`);
      setSelectedIds([]);
      setBulkAction(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm payments");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Bulk Reject
  const executeBulkReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !bulkRemark.trim()) return;
    try {
      setBulkSubmitting(true);
      const res = await apiRequest<{ rejected_count: number; message: string }>(
        "/api/admin/reject-payments/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            student_ids: selectedIds,
            remark: bulkRemark.trim(),
          }),
        }
      );
      toast.success(res?.message || `Rejected ${res?.rejected_count} receipt(s).`);
      setSelectedIds([]);
      setBulkRemark("");
      setBulkAction(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject payments");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Single review actions
  const closeReview = () => {
    if (processing) return;
    setSelected(null);
    setRejectionRemark("");
  };

  const confirmSinglePayment = async () => {
    if (!selected) return;
    try {
      setProcessing("confirm");
      await apiRequest(`/api/admin/confirm-payment/${selected.id}`, { method: "POST" });
      toast.success("Payment confirmed successfully.");
      closeReview();
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm payment");
    } finally {
      setProcessing(null);
    }
  };

  const rejectSinglePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !rejectionRemark.trim()) return;
    try {
      setProcessing("reject");
      await apiRequest(`/api/admin/reject-payment/${selected.id}`, {
        method: "POST",
        body: JSON.stringify({ remark: rejectionRemark.trim() }),
      });
      toast.success("Payment receipt rejected.");
      closeReview();
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject payment");
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = payments.filter(
    (p) => p.payment_receipt_url && !p.payment_confirmed && !p.payment_rejected
  ).length;

  return (
    <AuthenticatedLayout title="Payment Verification">
      <PageHeader
        title="Student Payment Verification"
        subtitle="Review uploaded receipts, inspect AI advisory assessments, and process single or bulk confirmations."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAiAnalysis()}
              loading={analyzingAi}
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            >
              <Sparkles size={14} className="text-emerald-600 mr-1" /> Run AI Analysis
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
          </div>
        }
      />

      {/* AI Advisory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-6">
        <div
          onClick={() => setTab("pending")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            tab === "pending"
              ? "border-slate-800 bg-slate-900 text-white shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
          }`}
        >
          <p className="text-xs uppercase tracking-wider font-semibold opacity-75">
            Total Pending
          </p>
          <p className="text-2xl font-bold mt-1">{pendingCount}</p>
          <p className="text-[11px] opacity-70 mt-1">Awaiting admin review</p>
        </div>

        <div
          onClick={() => setTab("likely_valid")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            tab === "likely_valid"
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-semibold opacity-85">
              Likely Valid (AI)
            </p>
            <ShieldCheck size={16} className={tab === "likely_valid" ? "text-white" : "text-emerald-700"} />
          </div>
          <p className="text-2xl font-bold mt-1">{queueCounts.likely_valid}</p>
          <p className="text-[11px] opacity-80 mt-1">Verified references & format</p>
        </div>

        <div
          onClick={() => setTab("suspicious")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            tab === "suspicious"
              ? "border-red-600 bg-red-600 text-white shadow-sm"
              : "border-red-200 bg-red-50/60 hover:bg-red-50 text-red-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-semibold opacity-85">
              Suspicious (AI)
            </p>
            <ShieldAlert size={16} className={tab === "suspicious" ? "text-white" : "text-red-700"} />
          </div>
          <p className="text-2xl font-bold mt-1">{queueCounts.suspicious}</p>
          <p className="text-[11px] opacity-80 mt-1">Flagged for potential mismatch</p>
        </div>

        <div
          onClick={() => setTab("manual_review")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            tab === "manual_review"
              ? "border-amber-600 bg-amber-600 text-white shadow-sm"
              : "border-amber-200 bg-amber-50/60 hover:bg-amber-50 text-amber-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider font-semibold opacity-85">
              Manual Review (AI)
            </p>
            <AlertTriangle size={16} className={tab === "manual_review" ? "text-white" : "text-amber-700"} />
          </div>
          <p className="text-2xl font-bold mt-1">{queueCounts.manual_review}</p>
          <p className="text-[11px] opacity-80 mt-1">Low confidence or blur</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
        {[
          { key: "pending", label: "Pending Review" },
          { key: "likely_valid", label: `Likely Valid (${queueCounts.likely_valid})` },
          { key: "suspicious", label: `Suspicious (${queueCounts.suspicious})` },
          { key: "manual_review", label: `Manual Review (${queueCounts.manual_review})` },
          { key: "confirmed", label: "Confirmed" },
          { key: "rejected", label: "Rejected" },
          { key: "all", label: "All Receipts" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key as FilterTab);
              setSelectedIds([]);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              tab === item.key
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search and Bulk Action Toolbar */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, matric, RRR, receipt..."
            className="pl-9"
          />
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-emerald-900">
              {selectedIds.length} selected
            </span>
            <Button
              size="sm"
              variant="primary"
              className="bg-emerald-700 hover:bg-emerald-800 text-white h-7 text-xs"
              onClick={executeBulkConfirm}
              loading={bulkSubmitting && bulkAction === "confirm"}
            >
              <CheckCircle2 size={13} className="mr-1" /> Confirm Selected
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="h-7 text-xs"
              onClick={() => setBulkAction("reject")}
              disabled={bulkSubmitting}
            >
              <XCircle size={13} className="mr-1" /> Reject Selected
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 ml-1 underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={<CheckCircle2 size={36} />}
            title={search ? "No matching receipts" : "No receipts in this view"}
            description={
              search
                ? "Try searching for a different keyword or identifier."
                : "There are currently no receipts matching the selected filter."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={
                        selectedIds.length > 0 &&
                        filtered
                          .filter((p) => !p.payment_confirmed && !p.payment_rejected)
                          .every((p) => selectedIds.includes(p.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Faculty / Department</th>
                  <th className="px-4 py-3">Matric / Reg No.</th>
                  <th className="px-4 py-3">AI Review</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((payment) => {
                  const isSelected = selectedIds.includes(payment.id);
                  const isPending = !payment.payment_confirmed && !payment.payment_rejected;

                  return (
                    <tr
                      key={payment.id}
                      className={`hover:bg-slate-50 transition ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(payment.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {payment.full_name || "Student"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {payment.level ? `${payment.level} Level` : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-medium text-slate-800">
                          {payment.faculty || "—"}
                        </p>
                        <p className="text-xs text-slate-400">{payment.department || "—"}</p>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-medium text-slate-700">
                        {payment.registration_number || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <AiDecisionBadge review={payment.payment_ai_review} />
                        {payment.payment_ai_review?.rrr_or_reference && (
                          <p className="text-[11px] font-mono text-slate-500 mt-1">
                            Ref: {payment.payment_ai_review.rrr_or_reference}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <PaymentBadge payment={payment} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(payment)}
                        >
                          <FileImage size={14} className="mr-1" /> Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single Review Modal */}
      <Modal
        open={!!selected}
        onClose={closeReview}
        title="Review Student Payment Receipt"
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            {/* Student metadata */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-4">
              <Detail label="Student" value={selected.full_name || "—"} />
              <Detail label="Faculty" value={selected.faculty || "—"} />
              <Detail label="Department" value={selected.department || "—"} />
              <Detail label="Matric / Reg No." value={selected.registration_number || "—"} />
            </div>

            {/* AI Advisory Panel */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    AI Due-Diligence Analysis
                  </h3>
                </div>
                <AiDecisionBadge review={selected.payment_ai_review} />
              </div>

              {selected.payment_ai_review ? (
                <div className="space-y-3 text-xs">
                  {selected.payment_ai_review.reason && (
                    <div className="rounded-lg bg-white p-3 border border-slate-200">
                      <p className="font-semibold text-slate-700">AI Assessment:</p>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {selected.payment_ai_review.reason}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">
                        RRR / Reference
                      </p>
                      <p className="font-mono font-medium text-slate-800 truncate mt-0.5">
                        {selected.payment_ai_review.rrr_or_reference || "—"}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">
                        Extracted Amount
                      </p>
                      <p className="font-semibold text-slate-800 truncate mt-0.5">
                        {selected.payment_ai_review.amount || "—"}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">
                        Payment Date
                      </p>
                      <p className="text-slate-800 truncate mt-0.5">
                        {selected.payment_ai_review.payment_date || "—"}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">
                        Institution / Merchant
                      </p>
                      <p className="text-slate-800 truncate mt-0.5">
                        {selected.payment_ai_review.institution || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500 py-1">
                  <span>No AI review has been conducted for this receipt yet.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runAiAnalysis([selected.id])}
                    loading={analyzingAi}
                  >
                    Analyze with AI
                  </Button>
                </div>
              )}
            </div>

            {/* Receipt Preview */}
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Uploaded Receipt Document</p>
              {selected.payment_receipt_url ? (
                <ReceiptPreview url={selected.payment_receipt_url} />
              ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  No receipt was uploaded.
                </p>
              )}
            </div>

            {/* Status alerts */}
            {selected.payment_rejected && selected.payment_rejection_remark && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                <span className="font-bold">Rejection Reason:</span>{" "}
                {selected.payment_rejection_remark}
              </div>
            )}

            {/* Actions */}
            {!selected.payment_confirmed && !selected.payment_rejected && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  variant="danger"
                  onClick={() => setProcessing("reject")}
                  disabled={!!processing}
                >
                  <XCircle size={15} className="mr-1" /> Reject receipt
                </Button>
                <Button
                  onClick={confirmSinglePayment}
                  loading={processing === "confirm"}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  <CheckCircle2 size={15} className="mr-1" /> Confirm payment
                </Button>
              </div>
            )}

            {/* Rejection input form */}
            {processing === "reject" && (
              <form
                onSubmit={rejectSinglePayment}
                className="space-y-3 rounded-lg border border-red-100 bg-red-50 p-4"
              >
                <FormField label="Rejection reason for student" required>
                  <Textarea
                    value={rejectionRemark}
                    onChange={(e) => setRejectionRemark(e.target.value)}
                    placeholder="Specify why this receipt is invalid (e.g., blurred image, mismatched RRR, invalid amount)..."
                    required
                  />
                </FormField>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setProcessing(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    loading={processing === "reject"}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Bulk Reject Modal */}
      <Modal
        open={bulkAction === "reject"}
        onClose={() => setBulkAction(null)}
        title={`Reject ${selectedIds.length} Payment Receipts`}
        size="md"
      >
        <form onSubmit={executeBulkReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            Provide a clear remark explaining why these {selectedIds.length} receipts are being rejected. This note will be visible to the affected students.
          </p>
          <FormField label="Rejection Remark" required>
            <Textarea
              value={bulkRemark}
              onChange={(e) => setBulkRemark(e.target.value)}
              placeholder="e.g. Unreadable receipt image or payment reference mismatch. Please re-upload your valid receipt."
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkAction(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={bulkSubmitting}
            >
              Reject {selectedIds.length} Receipts
            </Button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 break-words text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function PaymentBadge({ payment }: { payment: PaymentRecord }) {
  if (payment.payment_confirmed)
    return <StatusBadge variant="success">Confirmed</StatusBadge>;
  if (payment.payment_rejected)
    return <StatusBadge variant="danger">Rejected</StatusBadge>;
  return <StatusBadge variant="warning">Pending review</StatusBadge>;
}
