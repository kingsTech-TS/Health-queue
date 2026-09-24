"use client";

import { useState } from "react";
import { Modal, FormField, Select, Button } from "@/components/ui/shared";
import { apiRequest } from "@/lib/utils";
import {
  Upload, CheckCircle2, AlertCircle, FileSpreadsheet,
  ArrowRight, RefreshCw, Users, FileText
} from "lucide-react";
import { toast } from "sonner";

interface BulkStudentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadResponse {
  message: string;
  level: number;
  filename: string;
  added_count: number;
  skipped_count: number;
  total_found_in_file: number;
  sample_registration_numbers?: string[];
}

export function BulkStudentUploadModal({ open, onClose, onSuccess }: BulkStudentUploadModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [level, setLevel] = useState<number>(100);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewList, setPreviewList] = useState<{ reg: string; valid: boolean }[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const resetState = () => {
    setStep(1);
    setSelectedFile(null);
    setPreviewList([]);
    setValidCount(0);
    setInvalidCount(0);
    setResult(null);
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  // Inspect and parse client-side for step 2 & 3 preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStep(2); // Validating

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

      const items: { reg: string; valid: boolean }[] = [];
      let valids = 0;
      let invalids = 0;

      // Extract numbers (similar to backend sanitize rule)
      for (const line of lines) {
        // If CSV, take first col or split by comma
        const parts = line.split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
        const candidate = parts[0];

        // Skip obvious table headers like "matric", "reg number", "registration"
        if (/^(matric|reg|registration|number|id|student|sn|s\/n)$/i.test(candidate)) {
          continue;
        }

        if (candidate.length >= 3 && candidate.length <= 40) {
          items.push({ reg: candidate, valid: true });
          valids++;
        } else if (candidate.length > 0) {
          items.push({ reg: candidate, valid: false });
          invalids++;
        }
      }

      setPreviewList(items);
      setValidCount(valids);
      setInvalidCount(invalids);

      setTimeout(() => {
        setStep(3); // Show preview
      }, 400);
    } catch {
      // In case binary/pdf read fails in client, still allow uploading
      setPreviewList([{ reg: file.name, valid: true }]);
      setValidCount(1);
      setInvalidCount(0);
      setStep(3);
    }
  };

  // Execute upload to POST /api/admin/upload-students-file
  const handleExecuteImport = async () => {
    if (!selectedFile) return;

    try {
      setStep(4); // Uploading
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("level", String(level)); // REQUIRED by backend schema

      const res = await apiRequest<UploadResponse>("/api/admin/upload-students-file", {
        method: "POST",
        body: formData,
      });

      setResult(res);
      setStep(5); // Complete
      toast.success(res.message || `Uploaded students to level ${level}!`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Failed to process students file");
      setStep(3); // Return to preview on failure
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      title="Upload Student Batch Cohort"
      size="lg"
    >
      <div className="space-y-6">
        {/* Step Indicator (Prompt #38) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-semibold">
          <span className={step >= 1 ? "text-emerald-700" : "text-slate-400"}>1. File & Level</span>
          <span className="text-slate-300">→</span>
          <span className={step >= 2 ? "text-emerald-700" : "text-slate-400"}>2. Validate</span>
          <span className="text-slate-300">→</span>
          <span className={step >= 3 ? "text-emerald-700" : "text-slate-400"}>3. Preview</span>
          <span className="text-slate-300">→</span>
          <span className={step >= 4 ? "text-emerald-700" : "text-slate-400"}>4. Import</span>
          <span className="text-slate-300">→</span>
          <span className={step >= 5 ? "text-emerald-700" : "text-slate-400"}>5. Complete</span>
        </div>

        {/* Step 1: Select File and Required Level */}
        {step === 1 && (
          <div className="space-y-5">
            <FormField
              label="Target Academic Level"
              required
              hint="Required by schema. Specify which cohort level these students belong to."
            >
              <Select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="font-medium text-xs"
              >
                <option value={100}>100 Level (Freshers)</option>
                <option value={200}>200 Level (Direct Entry)</option>
                <option value={300}>300 Level</option>
                <option value={400}>400 Level</option>
                <option value={500}>500 Level</option>
                <option value={600}>600 Level</option>
              </Select>
            </FormField>

            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center text-center hover:border-emerald-400 transition">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-sm">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Select Cohort Roster File</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
                Upload CSV, TXT, or PDF containing registration/matric numbers for {level} Level.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm">
                <Upload size={14} />
                Browse & Validate File
                <input
                  type="file"
                  accept=".csv, .txt, .pdf, text/csv, text/plain, application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Validating */}
        {step === 2 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-9 w-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-800">Validating File Structure & Entries...</p>
            <p className="text-xs text-slate-400">Extracting registration numbers for {level} Level...</p>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 size={16} />
                <span>{validCount} records ready for Level {level}</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2 text-amber-700 font-semibold">
                  <AlertCircle size={16} />
                  <span>{invalidCount} invalid rows detected</span>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Extracted Registration / Matric</th>
                    <th className="p-2.5">Assigned Level</th>
                    <th className="p-2.5 text-right">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewList.slice(0, 50).map((item, idx) => (
                    <tr key={idx} className={item.valid ? "hover:bg-slate-50" : "bg-red-50/50"}>
                      <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2.5 font-mono font-semibold text-slate-800">{item.reg}</td>
                      <td className="p-2.5">{level} Level</td>
                      <td className="p-2.5 text-right font-medium">
                        {item.valid ? (
                          <span className="text-emerald-700 font-semibold">Valid</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Invalid Format</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewList.length > 50 && (
              <p className="text-[11px] text-slate-400 text-center">
                Showing first 50 of {previewList.length} total entries found.
              </p>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
              >
                Choose Another File
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteImport}
                disabled={validCount === 0}
              >
                Confirm & Import {validCount} Students
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === 4 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-9 w-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-800">
              Sending to `/api/admin/upload-students-file`...
            </p>
            <p className="text-xs text-slate-400">Saving students into database and updating enrollment rosters.</p>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && result && (
          <div className="py-6 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Processed Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {result.message}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center">
              <div>
                <p className="font-bold text-slate-900 text-base">{result.added_count}</p>
                <p className="text-slate-500 text-[11px]">New Students Added</p>
              </div>
              <div>
                <p className="font-bold text-amber-700 text-base">{result.skipped_count}</p>
                <p className="text-slate-500 text-[11px]">Existing Duplicates</p>
              </div>
              <div>
                <p className="font-bold text-emerald-700 text-base">{result.total_found_in_file}</p>
                <p className="text-slate-500 text-[11px]">Total in File</p>
              </div>
            </div>

            {result.sample_registration_numbers && result.sample_registration_numbers.length > 0 && (
              <div className="text-left max-w-md mx-auto p-3 bg-white border border-slate-200 rounded-lg text-[11px]">
                <span className="font-bold text-slate-700 block mb-1">Sample imported registration numbers:</span>
                <p className="font-mono text-slate-500 break-words">
                  {result.sample_registration_numbers.slice(0, 5).join(", ")}
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button variant="primary" size="md" onClick={handleModalClose}>
                Finish & Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
