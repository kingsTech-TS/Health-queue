"use client";

import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest, formatDate } from "@/lib/utils";
import { StatusBadge, TableSkeleton, EmptyState, Input, Button } from "@/components/ui/shared";
import { Search, FileText, ChevronRight, Eye, Calendar, UserCheck } from "lucide-react";
import Link from "next/link";

interface PinkFileItem {
  student_id: string;
  registration_number: string;
  student_name?: string;
  hc_number?: string;
  level?: string;
  department?: string;
  faculty?: string;
  lab_status?: string;
  physical_exam_status?: string;
  updated_at?: string;
}

export default function StaffPinkFilesPage() {
  const [pinkFiles, setPinkFiles] = useState<PinkFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPinkFiles = async () => {
    try {
      setLoading(true);
      // Try /api/admin/pink-files
      const res = await apiRequest<PinkFileItem[]>("/api/admin/pink-files");
      setPinkFiles(res || []);
    } catch {
      // Fallback: fetch from students
      try {
        const students = await apiRequest<any[]>("/api/admin/students");
        if (students && Array.isArray(students)) {
          setPinkFiles(
            students.map((s) => ({
              student_id: s.id || s.registration_number,
              registration_number: s.registration_number,
              student_name: `${s.surname || ""} ${s.first_name || ""}`.trim() || s.email,
              hc_number: s.hc_number,
              level: s.level,
              department: s.department,
              faculty: s.faculty,
              lab_status: s.lab_status || "Pending",
              physical_exam_status: s.physical_exam_status || "Pending",
              updated_at: s.updated_at,
            }))
          );
        }
      } catch {
        setPinkFiles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPinkFiles();
  }, []);

  const filtered = pinkFiles.filter((item) => {
    const query = search.toLowerCase();
    const name = (item.student_name || "").toLowerCase();
    const reg = (item.registration_number || "").toLowerCase();
    const hc = (item.hc_number || "").toLowerCase();
    return !search || name.includes(query) || reg.includes(query) || hc.includes(query);
  });

  return (
    <AuthenticatedLayout title="Digital Pink Files">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-pink-700">Digital Archive</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Student Pink Files</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official university medical record folders containing laboratory requests and physical exams.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search HC # or Student Name..."
              className="pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Pink Files Directory */}
        {loading ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <TableSkeleton rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <EmptyState
              icon={<FileText size={36} className="text-pink-300" />}
              title="No Pink Files found"
              description="Medical folders will appear here as students complete their health registration and lab screenings."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.student_id || item.registration_number}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-pink-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-sm border border-pink-100">
                      <FileText size={20} />
                    </div>
                    <span className="font-mono text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                      {item.hc_number || "HC-PENDING"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{item.student_name || "Enrolled Student"}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{item.registration_number}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.level ? `${item.level}L • ` : ""}{item.department || "General"}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Laboratory Exam:</span>
                      <StatusBadge variant={item.lab_status === "Completed" ? "success" : "pending"}>
                        {item.lab_status || "Pending"}
                      </StatusBadge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Physical Exam:</span>
                      <StatusBadge variant={item.physical_exam_status === "Completed" ? "success" : "pending"}>
                        {item.physical_exam_status || "Pending"}
                      </StatusBadge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link href={`/staff/students/${item.registration_number || item.student_id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-medium justify-between">
                      <span>Open Medical Folder</span>
                      <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
