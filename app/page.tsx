const endpointGroups = [
  {
    id: "auth",
    title: "Authentication",
    icon: "🔐",
    accent: "emerald",
    description: "User identity, registration, and access-token flows.",
    total: 4,
    endpoints: [
      "POST /api/auth/register/student",
      "POST /api/auth/register/staff",
      "POST /api/auth/login",
      "GET /api/auth/me",
    ],
  },
  {
    id: "admin",
    title: "Admin",
    icon: "🛡️",
    accent: "sky",
    description: "User management, approvals, registration periods, and dashboards.",
    total: 15,
    endpoints: [
      "GET /api/admin/profile",
      "GET /api/admin/students",
      "GET /api/admin/staff",
      "GET /api/admin/admins",
      "GET /api/admin/all-users",
      "POST /api/admin/approve-staff/{staff_user_id}",
      "POST /api/admin/suspend-user/{user_id}",
      "POST /api/admin/registration-period",
      "GET /api/admin/dashboard-stats",
    ],
  },
  {
    id: "students",
    title: "Students",
    icon: "🧑‍🎓",
    accent: "violet",
    description: "Onboarding, health forms, queue status, and student profile modules.",
    total: 12,
    endpoints: [
      "GET /api/students/profile",
      "GET /api/students/basic-info",
      "POST /api/students/basic-info",
      "GET /api/students/form-prefill",
      "GET /api/students/onboarding-status",
      "GET /api/students/dashboard",
      "GET /api/students/health-card",
      "POST /api/students/upload-passport",
      "POST /api/students/upload-payment-receipt",
    ],
  },
  {
    id: "staff",
    title: "Staff",
    icon: "👩‍⚕️",
    accent: "amber",
    description: "Patient records, examination workflows, and document retrieval.",
    total: 7,
    endpoints: [
      "GET /api/staff/profile",
      "GET /api/staff/student-info/{registration_number}",
      "GET /api/staff/pink-file/{student_id}",
      "GET /api/staff/lab-request-form/{unique_number}",
      "POST /api/staff/physical-examination-form/{student_id}",
      "PUT /api/staff/lab-request-form/{form_id}",
      "PUT /api/staff/physical-examination-form/{form_id}",
    ],
  },
  {
    id: "registration",
    title: "Registration",
    icon: "🧾",
    accent: "rose",
    description: "Level registration availability and student status checks.",
    total: 2,
    endpoints: [
      "GET /api/registration/check-period/{level}",
      "GET /api/registration/student-status/{registration_number}",
    ],
  },
  {
    id: "queues",
    title: "Queues",
    icon: "📋",
    accent: "cyan",
    description: "Queue sessions, status, and active patient call flows.",
    total: 15,
    endpoints: [
      "POST /api/queues/sessions",
      "GET /api/queues/sessions",
      "GET /api/queues/sessions/active/{queue_type}",
      "POST /api/queues/sessions/{session_id}/start",
      "POST /api/queues/sessions/{session_id}/call-next",
      "GET /api/queues/status/{queue_type}",
      "POST /api/queues/join-active/{queue_type}",
      "GET /api/queues/my-position/{queue_type}",
      "GET /api/queues/my-queues",
    ],
  },
  {
    id: "medical",
    title: "Medical",
    icon: "🩺",
    accent: "teal",
    description: "Lab forms, physical examinations, and medical reporting metrics.",
    total: 5,
    endpoints: [
      "GET /api/medical/lab-request-forms/pending",
      "GET /api/medical/students-for-physical-exam",
      "GET /api/medical/statistics",
      "GET /api/students/lab-request-form",
      "GET /api/students/medical-examination-questionnaire",
    ],
  },
];

const highlights = [
  { label: "Auth flows", value: "4", detail: "Register + login + profile" },
  { label: "Admin actions", value: "15+", detail: "Approvals, suspensions, stats" },
  { label: "Queue endpoints", value: "15", detail: "Sessions + active status" },
  { label: "Medical forms", value: "7", detail: "Lab + physical exam" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#edf5f2] px-4 py-6 text-slate-800 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <aside className="flex flex-col gap-6 border-b border-slate-200 bg-[#f8fbfa] p-5 lg:min-h-[860px] lg:w-[260px] lg:border-r lg:border-b-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl text-white shadow-lg shadow-emerald-500/30">
              +
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                EKSU
              </p>
              <h1 className="text-lg font-bold text-slate-900">Health Center</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              "Overview",
              "Authentication",
              "Admin",
              "Students",
              "Staff",
              "Queues",
              "Registration",
              "Medical",
            ].map((item, index) => (
              <button
                key={item}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  index === 0
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{item}</span>
                <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-white" : "bg-slate-300"}`} />
              </button>
            ))}
          </nav>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white shadow-lg shadow-emerald-500/20">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">API status</p>
            <h2 className="mt-3 text-3xl font-bold">Healthy</h2>
            <p className="mt-2 text-sm text-emerald-50/90">
              7 core endpoint groups active across registration, queues, and clinical workflows.
            </p>
          </div>
        </aside>

        <main className="flex-1 bg-[#f7faf9] p-5 md:p-7">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                Dashboard overview
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                EKSU Health Center Management System
              </h2>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:self-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg text-emerald-700">
                ⏱
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Live</p>
                <p className="text-sm font-semibold text-slate-700">System online</p>
              </div>
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <span className="text-3xl font-bold text-slate-900">{item.value}</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Active
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </section>

          <section className="mt-7 grid gap-5 xl:grid-cols-2">
            {endpointGroups.map((group) => (
              <article
                key={group.id}
                className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className={`flex items-center justify-between border-b border-slate-200 bg-gradient-to-r ${
                  group.accent === "emerald"
                    ? "from-emerald-50 to-emerald-100"
                    : group.accent === "sky"
                      ? "from-sky-50 to-sky-100"
                      : group.accent === "violet"
                        ? "from-violet-50 to-violet-100"
                        : group.accent === "amber"
                          ? "from-amber-50 to-amber-100"
                          : group.accent === "rose"
                            ? "from-rose-50 to-rose-100"
                            : group.accent === "cyan"
                              ? "from-cyan-50 to-cyan-100"
                              : "from-teal-50 to-teal-100"
                } p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
                      {group.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{group.title}</h3>
                      <p className="text-xs text-slate-500">{group.total} endpoints</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    API
                  </span>
                </div>

                <div className="p-4">
                  <p className="mb-4 text-sm leading-6 text-slate-600">{group.description}</p>
                  <div className="space-y-2">
                    {group.endpoints.map((endpoint) => (
                      <div
                        key={endpoint}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <p className="text-sm font-medium text-slate-700">{endpoint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
