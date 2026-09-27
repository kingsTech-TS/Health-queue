import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://healthcenter-bd.onrender.com";

export function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      message = err?.detail || err?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

// The API stores naive UTC datetimes and serializes them without an offset
// ("2026-09-27T07:00:00"), which browsers would otherwise read as local time.
export function parseServerDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasTime = value.includes("T");
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const date = new Date(hasTime && !hasOffset ? `${value}Z` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTime(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : parseServerDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return (parseServerDate(dateStr) ?? new Date(dateStr)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return (parseServerDate(dateStr) ?? new Date(dateStr)).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getRoleName(role: string, subRole?: string | null): string {
  if (role === "admin") return "Administrator";
  if (role === "student") return "Student";
  if (subRole === "lab_attendant") return "Lab Attendant";
  if (subRole === "registering_nurse") return "Registering Nurse";
  return "Staff";
}
