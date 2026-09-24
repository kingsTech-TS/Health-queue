"use client";

import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/utils";
import { StatusBadge, TableSkeleton, EmptyState, Input, Select, Button } from "@/components/ui/shared";
import { Search, Filter, Eye, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

interface StudentRecord {
  id: string;
  user_id?: string;
  registration_number: string;
  surname?: string;
  first_name?: string;
  other_names?: string;
  email?: string;
  faculty?: string;
  department?: string;
  level?: string;
  hc_number?: string;
  registration_status?: string;
}

export default function StaffStudentDirectoryPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Try /api/admin/students or /api/medical/students-for-physical-exam
      const res = await apiRequest<StudentRecord[]>("/api/admin/students");
      setStudents(res || []);
    } catch {
      // Fallback
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const fullName = `${s.surname || ""} ${s.first_name || ""} ${s.other_names || ""}`.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(query) ||
      (s.registration_number && s.registration_number.toLowerCase().includes(query)) ||
      (s.hc_number && s.hc_number.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query));

    const matchesLevel = selectedLevel === "all" || s.level === selectedLevel;
    const matchesFaculty = selectedFaculty === "all" || s.faculty === selectedFaculty;
    const matchesStatus = selectedStatus === "all" || s.registration_status === selectedStatus;

    return matchesSearch && matchesLevel && matchesFaculty && matchesStatus;
  });

  return (
    <AuthenticatedLayout title="Student Directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Directory</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse registered student profiles, medical statuses, and clinic identifiers.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 self-start sm:self-auto">
            {filtered.length} Students Listed
          </span>
        </div>

        {/* Search & Filter Bar (Prompt #32) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Search name, HC #, matric..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              className="text-xs"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </Select>

            <Select
              className="text-xs"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              <option value="all">All Faculties</option>
              <option value="Science">Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Social Sciences">Social Sciences</option>
              <option value="Arts">Arts</option>
              <option value="Law">Law</option>
              <option value="Basic Medical Sciences">Basic Medical Sciences</option>
              <option value="Clinical Sciences">Clinical Sciences</option>
              <option value="Education">Education</option>
            </Select>

            <Select
              className="text-xs"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Registration Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </Select>
          </div>
        </div>

        {/* Content Section: Desktop Table, Mobile Cards */}
        {loading ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <TableSkeleton rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <EmptyState
              icon={<Users size={36} />}
              title="No students match the criteria"
              description="Try adjusting your search query or reset the filter dropdowns."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedLevel("all");
                    setSelectedFaculty("all");
                    setSelectedStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Registration #</th>
                    <th className="py-3 px-4">HC Number</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Faculty / Dept</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => {
                    const name = `${s.surname || ""} ${s.first_name || ""}`.trim() || s.email?.split("@")[0] || "Student";
                    return (
                      <tr key={s.id || s.registration_number} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{name}</p>
                          <p className="text-xs text-slate-400">{s.email || "No email"}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                          {s.registration_number}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-700">
                          {s.hc_number || "—"}
                        </td>
                        <td className="py-3 px-4 text-xs">{s.level || "—"}</td>
                        <td className="py-3 px-4 text-xs">
                          <p className="text-slate-800">{s.department || "General"}</p>
                          <p className="text-[11px] text-slate-400">{s.faculty || "—"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge
                            variant={
                              s.registration_status === "completed"
                                ? "success"
                                : s.registration_status === "in_progress"
                                ? "warning"
                                : "pending"
                            }
                          >
                            {s.registration_status || "Pending"}
                          </StatusBadge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/staff/students/${s.registration_number || s.id}`}>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                              <Eye size={13} className="mr-1" />
                              View Record
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Prompt #32: cards on mobile) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filtered.map((s) => {
                const name = `${s.surname || ""} ${s.first_name || ""}`.trim() || s.email?.split("@")[0] || "Student";
                return (
                  <Link
                    key={s.id || s.registration_number}
                    href={`/staff/students/${s.registration_number || s.id}`}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{name}</span>
                        <StatusBadge
                          variant={
                            s.registration_status === "completed"
                              ? "success"
                              : s.registration_status === "in_progress"
                              ? "warning"
                              : "pending"
                          }
                        >
                          {s.registration_status || "Pending"}
                        </StatusBadge>
                      </div>
                      <p className="text-xs font-mono text-slate-500">
                        Matric: {s.registration_number} {s.hc_number ? `• HC: ${s.hc_number}` : ""}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.level ? `${s.level}L • ` : ""}{s.department || "Undergraduate"}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
