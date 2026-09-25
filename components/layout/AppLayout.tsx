"use client";

import { useAuth, type User } from "@/contexts/AuthContext";
import { getRoleName, cn, formatDate } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, BarChart3,
  ClipboardList, Settings, LogOut, User as UserIcon, FlaskConical,
  Stethoscope, FileText, CreditCard, Activity, Menu, X, ChevronDown,
  Clock, ShieldAlert, KeyRound, ReceiptText
} from "lucide-react";
import { StatusBadge, Button } from "@/components/ui/shared";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function getNavItems(user: User): NavItem[] {
  if (user.role === "student") {
    return [
      { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard size={16} /> },
      { label: "Registration", href: "/student/registration", icon: <ClipboardList size={16} /> },
      { label: "Pink File", href: "/student/pink-file", icon: <FileText size={16} /> },
      { label: "Health Card", href: "/student/health-card", icon: <CreditCard size={16} /> },
      { label: "Profile", href: "/student/profile", icon: <UserIcon size={16} /> },
    ];
  }

  if (user.role === "admin") {
    return [
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={16} /> },
      { label: "Students", href: "/admin/students", icon: <Users size={16} /> },
      { label: "Payment Verification", href: "/admin/payments", icon: <ReceiptText size={16} /> },
      { label: "Staff", href: "/admin/staff", icon: <UserCheck size={16} /> },
      { label: "Registration Periods", href: "/admin/registration-periods", icon: <CalendarDays size={16} /> },
      { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={16} /> },
      { label: "Activity Logs", href: "/admin/activity", icon: <Activity size={16} /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings size={16} /> },
      { label: "Profile", href: "/admin/profile", icon: <UserIcon size={16} /> },
    ];
  }

  // Staff — differentiate by sub_role
  const base: NavItem[] = [
    { label: "Dashboard", href: "/staff/dashboard", icon: <LayoutDashboard size={16} /> },
    { label: "Students", href: "/staff/students", icon: <Users size={16} /> },
    { label: "Pink Files", href: "/staff/pink-files", icon: <FileText size={16} /> },
    { label: "Activity", href: "/staff/activity", icon: <Activity size={16} /> },
    { label: "Profile", href: "/staff/profile", icon: <UserIcon size={16} /> },
  ];

  if (user.sub_role === "lab_attendant") {
    base.splice(1, 0, { label: "Laboratory Queue", href: "/staff/queue", icon: <FlaskConical size={16} /> });
  } else {
    base.splice(1, 0, { label: "Registration Queue", href: "/staff/queue", icon: <Stethoscope size={16} /> });
  }

  return base;
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold flex items-center justify-center shrink-0">
      {initials || "U"}
    </div>
  );
}

export function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;
  const navItems = getNavItems(user);
  const displayName = user.email.split("@")[0];

  return (
    <aside className={cn(
      "flex flex-col h-full bg-white border-r border-slate-200",
      mobile ? "w-72" : "w-60 min-h-screen"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            +
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">EKSU</p>
            <p className="text-xs font-semibold text-slate-800 leading-none">Health Center</p>
          </div>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/student/dashboard" && item.href !== "/staff/dashboard" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <span className={active ? "text-emerald-600" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
          <UserAvatar name={displayName} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate capitalize">{displayName}</p>
            <p className="text-[10px] text-slate-500 truncate">{getRoleName(user.role, user.sub_role)}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function Header({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.email?.split("@")[0] ?? "";
  const profileLink = user?.role === "student" ? "/student/profile" : user?.role === "admin" ? "/admin/profile" : "/staff/profile";

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 h-14 border-b border-slate-200 bg-white flex items-center px-4 md:px-6 gap-4">
        <button
          className="lg:hidden text-slate-500 hover:text-slate-700"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <p className="flex-1 text-sm font-semibold text-slate-800 truncate">{title}</p>

        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
            >
              <UserAvatar name={displayName} />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 capitalize leading-tight">{displayName}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{getRoleName(user.role, user.sub_role)}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 truncate capitalize">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      {getRoleName(user.role, user.sub_role)}
                    </span>
                  </div>

                  <Link
                    href={profileLink}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <UserIcon size={14} className="text-slate-400" />
                    Profile
                  </Link>

                  <Link
                    href="/reset-password"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <KeyRound size={14} className="text-slate-400" />
                    Reset Password
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}

function StaffPendingApprovalScreen({ user }: { user: User }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
          <Clock size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Account Pending Approval</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your staff account is currently awaiting administrator review and approval. You will receive full dashboard access once approved.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Account Email</span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Assigned Sub-role</span>
            <span className="font-semibold text-slate-800 capitalize">
              {user.sub_role === "lab_attendant" ? "Lab Attendant" : "Registering Nurse"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 font-medium">Status</span>
            <StatusBadge variant="pending">Pending Approval</StatusBadge>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Please contact the university health center administration if you need urgent activation.
        </p>

        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut size={14} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function AccountSuspendedScreen({ user }: { user: User }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-red-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Account Suspended</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your account has been temporarily suspended by an administrator. You cannot perform operational actions at this time.
        </p>

        <div className="bg-red-50/50 rounded-xl p-4 border border-red-200/80 mb-6 text-left space-y-2.5 text-xs">
          <div>
            <span className="text-slate-500 font-medium block mb-1">Reason for suspension:</span>
            <div className="p-3 bg-white rounded-lg border border-red-200 text-slate-800 font-medium">
              {user.suspension_reason || "Administrative review in progress."}
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-slate-500 font-medium">Suspended Account</span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Please contact the health center administrator for clarification and reactivation details.
        </p>

        <Button variant="outline" className="w-full text-slate-700" onClick={logout}>
          <LogOut size={14} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function AuthenticatedLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Handle Suspended account
  if (user.is_suspended) {
    return <AccountSuspendedScreen user={user} />;
  }

  // Handle Staff Pending Approval
  if (user.role === "staff" && !user.is_approved) {
    return <StaffPendingApprovalScreen user={user} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
