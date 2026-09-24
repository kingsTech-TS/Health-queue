"use client";

import { AuthenticatedLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/utils";
import {
  StatusBadge, TableSkeleton, EmptyState, Input, Select,
  Button, Modal, FormField, ConfirmDialog
} from "@/components/ui/shared";
import {
  Search, Upload, UserPlus, Trash2, Eye,
  CheckCircle2, AlertCircle, FileSpreadsheet, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkStudentUploadModal } from "@/components/admin/BulkStudentUploadModal";

interface Student {
  id: string;
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Single Add Student Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    registration_number: "",
    email: "",
    faculty: "Science",
    department: "Computer Science",
    level: "100",
    password: "Password123!",
  });

  // Bulk Upload Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<Student[]>("/api/admin/students");
      setStudents(res || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddLoading(true);
      await apiRequest("/api/auth/register/student", {
        method: "POST",
        body: JSON.stringify({
          email: addForm.email,
          password: addForm.password,
          registration_number: addForm.registration_number,
        }),
      });
      toast.success("Student added successfully!");
      setAddModalOpen(false);
      setAddForm({
        registration_number: "",
        email: "",
        faculty: "Science",
        department: "Computer Science",
        level: "100",
        password: "Password123!",
      });
      fetchStudents();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add student");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiRequest(`/api/admin/user/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Student removed successfully.");
      setDeleteTarget(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete student record");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = students.filter((s) => {
    const fullName = `${s.surname || ""} ${s.first_name || ""}`.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(query) ||
      (s.registration_number && s.registration_number.toLowerCase().includes(query)) ||
      (s.hc_number && s.hc_number.toLowerCase().includes(query));

    const matchesLevel = levelFilter === "all" || s.level === levelFilter;
    const matchesFaculty = facultyFilter === "all" || s.faculty === facultyFilter;
    const matchesStatus = statusFilter === "all" || s.registration_status === statusFilter;

    return matchesSearch && matchesLevel && matchesFaculty && matchesStatus;
  });

  return (
    <AuthenticatedLayout title="Student Management">
      <div className="space-y-6">
        {/* Header (Prompt #37) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Administer student matric rosters, upload batch cohorts, and manage registration records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkModalOpen(true)}
            >
              <Upload size={14} className="mr-1.5" />
              Upload Students
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              <UserPlus size={14} className="mr-1.5" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search name, matric, HC #..."
              className="pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select className="text-xs" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="500">500 Level</option>
          </Select>

          <Select className="text-xs" value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)}>
            <option value="all">All Faculties</option>
            <option value="Science">Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Arts">Arts</option>
            <option value="Law">Law</option>
            <option value="Social Sciences">Social Sciences</option>
          </Select>

          <Select className="text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Registration Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
          </Select>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Search size={36} />}
                title="No students found"
                description="There are no student records matching your current filters."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setLevelFilter("all");
                      setFacultyFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Identifier / Matric</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Faculty & Department</th>
                    <th className="py-3 px-4">Registration Status</th>
                    <th className="py-3 px-4">HC Number</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => {
                    const name = `${s.surname || ""} ${s.first_name || ""}`.trim() || s.email?.split("@")[0] || "Student";
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{name}</p>
                          <p className="text-xs text-slate-400">{s.email || "No email"}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                          {s.registration_number}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium">{s.level || "100"}L</td>
                        <td className="py-3.5 px-4 text-xs">
                          <p className="text-slate-800">{s.department || "General"}</p>
                          <p className="text-[11px] text-slate-400">{s.faculty || "Science"}</p>
                        </td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">
                          {s.hc_number || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/staff/students/${s.registration_number || s.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                                <Eye size={13} className="mr-1" />
                                View
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(s)}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Student">
          <form onSubmit={handleAddStudent} className="space-y-4">
            <FormField label="Registration / Matric Number" required>
              <Input
                placeholder="e.g. EKSU/2026/0491"
                value={addForm.registration_number}
                onChange={(e) => setAddForm({ ...addForm, registration_number: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Email Address" required>
              <Input
                type="email"
                placeholder="student@eksu.edu.ng"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Faculty" required>
                <Input
                  value={addForm.faculty}
                  onChange={(e) => setAddForm({ ...addForm, faculty: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Department" required>
                <Input
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                  required
                />
              </FormField>
            </div>

            <FormField label="Academic Level" required>
              <Select
                value={addForm.level}
                onChange={(e) => setAddForm({ ...addForm, level: e.target.value })}
              >
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </Select>
            </FormField>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={addLoading}>
                Add Student
              </Button>
            </div>
          </form>
        </Modal>

        {/* Bulk Student Upload Wizard Modal (Prompt #38) */}
        <BulkStudentUploadModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onSuccess={fetchStudents}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteStudent}
          title="Delete Student Record"
          description={`Are you sure you want to delete ${deleteTarget?.surname || ""} ${deleteTarget?.first_name || ""}? This will remove their registration files and queue position.`}
          confirmLabel="Delete Student"
          loading={deleting}
        />
      </div>
    </AuthenticatedLayout>
  );
}
