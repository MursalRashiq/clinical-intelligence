import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentDoctor, logoutDoctor } from "../../redux/doctor/doctorSlice";
import { useParams, useNavigate } from "react-router-dom";
import { appointmentService } from "../../services/AppointmentService";
import AuthService from "../../services/AuthService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { toast } from "sonner";

import TopNav from "../../components/Doctor/TopNav";
import DoctorSidebar from "../../components/Doctor/SideBar";
import type { PopulatedAppointment } from "../../types/appointment.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  if (/[APap][Mm]/.test(timeStr)) return timeStr;
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    return `${((h % 12) || 12).toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${suffix}`;
  } catch {
    return timeStr;
  }
}

function getPatientName(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.name) return appt.patientId.name;
  return appt.patientName || "Unknown Patient";
}

function getPatientEmail(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.email) return appt.patientId.email;
  return "";
}

function getPatientPhone(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.phone) return appt.patientId.phone;
  return "";
}

function getPatientId(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.customId) return appt.patientId.customId;
  if (typeof appt.patientId === "object" && appt.patientId?.id) return appt.patientId.id;
  return appt.customId || appt._id;
}

function getPatientAvatar(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.profileImage) return appt.patientId.profileImage;
  const name = getPatientName(appt);
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1560e8&color=fff&size=64&bold=true`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = "Upcoming" | "Completed" | "Cancelled";

  const TAB_TO_STATUS: Record<TabType, string> = {
    Upcoming: "confirmed",
    Completed: "completed",
    Cancelled: "cancelled",
  };

type ConsultationType = "video_call" | "general_visit" | "audio_call" | string;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConsultationBadge({ type }: { type: ConsultationType }) {
  const config: Record<string, { icon: string; label: string; bg: string; iconColor: string; textColor: string }> = {
    video: {
      icon: "videocam",
      label: "Video Call",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-800",
    },
    video_call: {
      icon: "videocam",
      label: "Video Call",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-800",
    },
    chat: {
      icon: "chat",
      label: "Chat",
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
      textColor: "text-purple-800",
    },
    general_visit: {
      icon: "home_health",
      label: "General Visit",
      bg: "bg-[#58b9fd]/20",
      iconColor: "text-[#006495]",
      textColor: "text-[#006495]",
    },
    audio_call: {
      icon: "call",
      label: "Audio Call",
      bg: "bg-slate-100",
      iconColor: "text-slate-600",
      textColor: "text-slate-600",
    },
  };

  const normalizedType = type?.toLowerCase().replace(/\s+/g, "_") || "general_visit";
  const { icon, label, bg, iconColor, textColor } = config[normalizedType] || config.general_visit;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${iconColor}`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    approved:   { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmed" },
    completed:  { bg: "bg-blue-50",    text: "text-blue-700",    label: "Completed" },
    cancelled:  { bg: "bg-red-50",     text: "text-red-700",     label: "Cancelled" },
    pending:    { bg: "bg-amber-50",   text: "text-amber-700",   label: "Pending" },
    reschedule_requested: { bg: "bg-orange-50", text: "text-orange-700", label: "Reschedule" },
  };
  const s = map[status] || { bg: "bg-slate-100", text: "text-slate-600", label: status };
  return (
    <span className={`${s.bg} ${s.text} text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg`}>
      {s.label}
    </span>
  );
}

function AppointmentRow({ appointment }: { appointment: PopulatedAppointment }) {
  const navigate = useNavigate();
  const accentColors: Record<string, string> = {
    video: "border-[#334e99]",
    video_call: "border-[#334e99]",
    chat: "border-purple-500",
    general_visit: "border-[#58b9fd]",
    audio_call: "border-slate-300",
  };
  const normalizedType = appointment.appointmentType?.toLowerCase().replace(/\s+/g, "_") || "general_visit";
  const accent = accentColors[normalizedType] || "border-slate-200";

  return (
    <tr className="group hover:-translate-y-0.5 transition-all duration-300">
      <td className={`py-4 px-4 bg-white rounded-l-2xl shadow-sm border-l-4 ${accent}`}>
        <div className="flex items-center gap-4">
          <img
            src={getPatientAvatar(appointment)}
            alt={getPatientName(appointment)}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-50"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=1560e8&color=fff&size=64&bold=true`;
            }}
          />
          <div>
            <p className="font-bold text-[#191b23] text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
              {getPatientName(appointment)}
            </p>
            <p className="text-xs text-[#424655]">ID: {getPatientId(appointment)}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 bg-white shadow-sm">
        <span className="font-semibold text-sm text-[#191b23] block">{formatDate(appointment.appointmentDate)}</span>
        <span className="text-xs text-[#334e99] font-medium">{formatTime(appointment.appointmentTime)}</span>
      </td>
      <td className="py-4 px-4 bg-white shadow-sm">
        <ConsultationBadge type={appointment.appointmentType} />
      </td>
      <td className="py-4 px-4 bg-white shadow-sm">
        <span className="text-xs font-medium text-[#191b23] block">{getPatientEmail(appointment) || "—"}</span>
        <span className="text-xs text-[#424655]">{getPatientPhone(appointment) || "—"}</span>
      </td>
      <td className="py-4 px-4 bg-white shadow-sm">
        <StatusBadge status={appointment.status} />
      </td>
      <td className="py-4 px-4 bg-white rounded-r-2xl shadow-sm text-right">
        <div className="flex items-center justify-end gap-2">
            <button
              className="p-2 text-slate-400 hover:text-[#334e99] transition-all rounded-lg hover:bg-slate-50"
              onClick={() => navigate(FRONTEND_ROUTES.APPOINTMENT_DETAILS(appointment._id || appointment.id))}
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
        </div>
      </td>
    </tr>
  );
}

function RowSkeleton() {
  return (
    <tr>
      <td colSpan={6} className="py-4 px-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-28 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClinicalAppointments() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<PopulatedAppointment | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentDoctor = useSelector(selectCurrentDoctor);

  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");
  const [activeNav, setActiveNav] = useState("Appointments");
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const LIMIT = 10;

  const tabs: TabType[] = ["Upcoming", "Completed", "Cancelled"];

  const doctorName =
    currentDoctor?.role === "doctor" && currentDoctor?.name
      ? `Dr. ${currentDoctor.name}`
      : "Doctor";

  useEffect(() => {
    if (appointmentId) {
      appointmentService.getAppointmentById(appointmentId)
        .then((res) => {
          setAppointment(res?.data || res);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load appointment details");
        })
        .finally(() => setLoadingDetail(false));
    }
  }, [appointmentId]);

  // ─── Fetch Appointments ─────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const status = TAB_TO_STATUS[activeTab];
      const result = await appointmentService.getDoctorAppointments(
        status,
        page,
        LIMIT,
        undefined,
        searchQuery || undefined
      );
      const data = result?.data ?? result;
      setAppointments(data?.appointments ?? []);
      setTotalCount(data?.total ?? 0);
      setTotalPages(Math.ceil((data?.total ?? 0) / LIMIT));
      if (data?.counts) setCounts(data.counts);
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, searchQuery]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);



  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } finally {
      dispatch(logoutDoctor());
      navigate(FRONTEND_ROUTES.DOCTOR_LOGIN);
    }
  };

  // ─── Stats ──────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Total Scheduled",
      value: String(counts.approved ?? counts.total ?? totalCount),
      badge: "Month",
      color: "text-[#006495]",
      badgeBg: "bg-[#58b9fd]/20 text-[#006495]",
    },
    {
      label: "Today",
      value: String(
        appointments.filter((a) => {
          const today = new Date().toDateString();
          return new Date(a.appointmentDate).toDateString() === today;
        }).length
      ),
      badge: "Active",
      color: "text-[#334e99]",
      badgeBg: "bg-[#4c66b3]/10 text-[#334e99]",
    },
    {
      label: "Pending Approval",
      value: String(counts.pending ?? 0).padStart(2, "0"),
      badge: "Waitlist",
      color: "text-[#913300]",
      badgeBg: "bg-[#b94300]/10 text-[#913300]",
    },
    {
      label: "Completed",
      value: String(counts.completed ?? 0),
      badge: "Done",
      color: "text-slate-500",
      badgeBg: "bg-slate-200 text-slate-500",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#faf8ff] text-[#191b23]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Universal Sidebar */}
      <DoctorSidebar
        doctorName={doctorName}
        specialty={
          (currentDoctor?.role === "doctor" && (currentDoctor as any)?.specialty) ||
          "Clinical Specialist"
        }
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Universal Top Nav */}
        <TopNav />

        <div className="pt-24 pb-12 px-8 max-w-7xl mx-auto">
          {/* Breadcrumb & Header */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-[#424655] mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Doctor</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#334e99]">
                Appointments
              </span>
            </nav>
            <div className="flex justify-between items-end">
              <div>
                <h1
                  className="text-3xl font-extrabold text-[#191b23] tracking-tight"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Appointments
                </h1>
                <p className="text-[#424655] mt-1">
                  Manage your schedule and patient consultations.
                </p>
              </div>
              <div className="flex items-center gap-3">

                <button
                  onClick={() => fetchAppointments()}
                  className="flex items-center gap-2 bg-[#f2f3fe] text-[#334e99] px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#dbe1ff] transition-all"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#f2f3fe] p-6 rounded-2xl border border-white/40 shadow-sm"
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${stat.color}`}
                >
                  {stat.label}
                </p>
                <div className="flex items-end justify-between">
                  <span
                    className="text-3xl font-black text-[#191b23]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {stat.value}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${stat.badgeBg}`}>
                    {stat.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & Table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm shadow-blue-900/5 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Tabs */}
              <div className="flex bg-[#f2f3fe] p-1.5 rounded-2xl w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${
                      activeTab === tab
                        ? "bg-white text-[#334e99] shadow-sm"
                        : "text-[#424655] hover:text-[#334e99]"
                    }`}
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[300px]">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    className="w-full bg-[#e7e7f3] border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#334e99]/20 transition-all placeholder:text-slate-500 outline-none"
                    placeholder="Search Patient Name, ID, or Contact..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left">
                    {[
                      "Patient Information",
                      "Date & Time",
                      "Consultation Type",
                      "Contact Details",
                      "Status",
                    ].map((col) => (
                      <th
                        key={col}
                        className="pb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
                        style={{ fontFamily: "Manrope, sans-serif" }}
                      >
                        {col}
                      </th>
                    ))}
                    <th
                      className="pb-2 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => <RowSkeleton key={i} />)
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-symbols-outlined text-6xl text-slate-300">
                            event_busy
                          </span>
                          <p className="text-slate-500 text-sm font-medium">
                            No {activeTab.toLowerCase()} appointments found.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <AppointmentRow key={appt._id || appt.id} appointment={appt} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && appointments.length > 0 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-xs text-[#424655] font-medium">
                  Showing <span className="text-[#191b23]">{appointments.length}</span> of{" "}
                  <span className="text-[#191b23]">{totalCount}</span> appointments
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e7e7f3] text-[#424655] hover:bg-[#334e99] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${
                          page === p
                            ? "bg-[#334e99] text-white"
                            : "bg-white border border-slate-200 text-[#424655] hover:border-[#334e99]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e7e7f3] text-[#424655] hover:bg-[#334e99] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Calendar Sync CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2" />
            <div
              className="p-8 rounded-3xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)",
              }}
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h2
                    className="font-bold text-[#1560E8] leading-tight"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {doctorName}
                  </h2>
                  <h3
                    className="text-xl font-extrabold leading-tight"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Sync your calendar
                    <br />
                    with Workspace.
                  </h3>
                  <p className="text-white/70 text-xs mt-3 leading-relaxed">
                    Integrate your medical schedule directly with Google or Outlook to stay notified
                    on all devices.
                  </p>
                </div>
                <button
                  className="mt-8 w-full bg-white text-[#334e99] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-blue-50 transition-all"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Enable Sync
                </button>
              </div>
              {/* Decorative */}
              <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12 pointer-events-none">
                <span className="material-symbols-outlined" style={{ fontSize: "9rem" }}>
                  sync
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}