"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, formatDate, getRoleName } from "@/lib/utils";
import { StatusBadge, FormField, Input, Button, TableSkeleton } from "@/components/ui/shared";
import { User as UserIcon, Mail, Shield, KeyRound, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function StaffProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/api/staff/profile");
        setProfile(res);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPassport(true);
      const formData = new FormData();
      formData.append("file", file);
      await apiRequest("/api/staff/upload-passport", {
        method: "POST",
        body: formData,
      });
      toast.success("Staff passport uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload passport");
    } finally {
      setUploadingPassport(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingSignature(true);
      const formData = new FormData();
      formData.append("file", file);
      await apiRequest("/api/staff/upload-signature", {
        method: "POST",
        body: formData,
      });
      toast.success("Staff official signature uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload signature");
    } finally {
      setUploadingSignature(false);
    }
  };

  const displayName = profile?.name || user?.email?.split("@")[0] || "Staff Member";

  return (
    <AuthenticatedLayout title="Staff Profile">
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center border border-emerald-200">
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 capitalize">{displayName}</h1>
                <StatusBadge variant="success">Approved</StatusBadge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                {getRoleName(user?.role || "staff", user?.sub_role)}
              </p>
            </div>
          </div>

          <Link href="/reset-password">
            <Button variant="outline" size="sm">
              <KeyRound size={14} className="mr-1.5" />
              Reset Password
            </Button>
          </Link>
        </div>

        {/* Identity Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
            Staff Identity & Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Official Sub-Role</span>
              <span className="font-semibold text-slate-900 capitalize">
                {user?.sub_role === "lab_attendant" ? "Laboratory Attendant" : "Registering Nurse"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Staff ID Number</span>
              <span className="font-mono font-bold text-slate-900">
                {profile?.staff_id || `STF-${user?.id?.slice(-4) || "001"}`}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Registered Since</span>
              <span className="font-semibold text-slate-900">{formatDate(user?.created_at)}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Assigned Department</span>
              <span className="font-semibold text-slate-900">
                {user?.sub_role === "lab_attendant" ? "Clinical Pathology & Diagnostic Lab" : "University Health Center Clinic"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Authorization Clearance</span>
              <span className="font-semibold text-emerald-700">Level 2 Clinical Officer</span>
            </div>
          </div>
        </div>

        {/* Biometrics & Verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
            Official Endorsements & Digital Signature
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-700 mb-1">Official Passport Photograph</span>
              <p className="text-[11px] text-slate-400 mb-4">Affixed to signed laboratory and examination records</p>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm">
                <Upload size={13} />
                <span>{uploadingPassport ? "Uploading..." : "Upload Passport"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePassportUpload}
                  disabled={uploadingPassport}
                />
              </label>
            </div>

            <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-700 mb-1">Digital Stamp & Signature</span>
              <p className="text-[11px] text-slate-400 mb-4">Required for certifying health cards and exam notes</p>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm">
                <Upload size={13} />
                <span>{uploadingSignature ? "Uploading..." : "Upload Signature"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSignatureUpload}
                  disabled={uploadingSignature}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
