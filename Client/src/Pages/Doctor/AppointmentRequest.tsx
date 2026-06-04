import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentDoctor, logoutDoctor } from "../../redux/doctor/doctorSlice";
import { useNavigate, useLocation } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { appointmentService } from "../../services/AppointmentService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { toast } from "sonner";

import TopNav from "../../components/Doctor/TopNav";
import DoctorSidebar from "../../components/Doctor/SideBar";
import ConfirmModal from "../../components/Ui/ConfirmModal";
import type { PopulatedAppointment } from "../../types/appointment.types";

// ─── Helper ───────────────────────────────────────────────────────────────────
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
  // If already formatted like "10:45 AM", return as-is
  if (/[APap][Mm]/.test(timeStr)) return timeStr;
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  } catch {
    return timeStr;
  }
}

function getPatientName(apt: PopulatedAppointment): string {
  if (typeof apt.patientId === "object" && apt.patientId?.name) return apt.patientId.name;
  if (apt.patientName) return apt.patientName;
  return "Patient";
}

function getPatientAvatar(apt: PopulatedAppointment): string {
  if (typeof apt.patientId === "object" && apt.patientId?.profileImage) return apt.patientId.profileImage;
  const name = getPatientName(apt);
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1560e8&color=fff&size=64&bold=true`;
}

function getAppointmentId(apt: PopulatedAppointment): string {
  return apt.customId || `#Apt${apt._id?.slice(-4)}`;
}

// ─── Custom Time Picker ──────────────────────────────────────────────────────
function CustomTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value ? value.split(":") : ["09", "00"];
  const hour24 = parseInt(h || "09", 10);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const minute = m || "00";

  const handleHour = (newH12: string) => {
    let h24 = parseInt(newH12, 10);
    if (ampm === "PM" && h24 !== 12) h24 += 12;
    if (ampm === "AM" && h24 === 12) h24 = 0;
    onChange(`${String(h24).padStart(2, "0")}:${minute}`);
  };

  const handleMinute = (newM: string) => {
    onChange(`${String(hour24).padStart(2, "0")}:${newM}`);
  };

  const handleAmpm = (newAmpm: string) => {
    let h24 = hour12;
    if (newAmpm === "PM" && h24 !== 12) h24 += 12;
    if (newAmpm === "AM" && h24 === 12) h24 = 0;
    onChange(`${String(h24).padStart(2, "0")}:${minute}`);
  };

  return (
    <div style={{ display: "flex", gap: 6, width: "100%", boxSizing: "border-box" }}>
      <select value={String(hour12).padStart(2, "0")} onChange={(e) => handleHour(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: "0.875rem", color: "#1e293b", outline: "none", background: "white", cursor: "pointer" }}>
        {Array.from({length: 12}, (_, i) => String(i+1).padStart(2,"0")).map(hr => <option key={hr} value={hr}>{hr}</option>)}
      </select>
      <span style={{ display: "flex", alignItems: "center", fontWeight: 700, color: "#64748b" }}>:</span>
      <select value={minute} onChange={(e) => handleMinute(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: "0.875rem", color: "#1e293b", outline: "none", background: "white", cursor: "pointer" }}>
        {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(min => <option key={min} value={min}>{min}</option>)}
      </select>
      <select value={ampm} onChange={(e) => handleAmpm(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: "0.875rem", color: "#1e293b", outline: "none", background: "white", cursor: "pointer" }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

// ─── TypeBadge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const isVideo = type?.toLowerCase() === "video";
  return (
    <div
      className={`flex items-center px-4 py-2 rounded-full border ${
        isVideo
          ? "bg-[#58b9fd]/10 border-[#58b9fd]/20"
          : "bg-[#dbe1ff]/30 border-[#dbe1ff]/50"
      }`}
    >
      <span
        className={`material-symbols-outlined mr-2 text-xl ${
          isVideo ? "text-[#006495]" : "text-[#334e99]"
        }`}
      >
        {isVideo ? "videocam" : "chat"}
      </span>
      <span
        className={`text-xs font-bold tracking-wide uppercase ${
          isVideo ? "text-[#00476d]" : "text-[#26428d]"
        }`}
      >
        {isVideo ? "VIDEO CALL" : "CHAT"}
      </span>
    </div>
  );
}

// ─── RequestCard ──────────────────────────────────────────────────────────────
function RequestCard({
  appointment,
  onAccept,
  onReject,
  onReschedule,
  isProcessing,
}: {
  appointment: PopulatedAppointment;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onReschedule: (id: string) => void;
  isProcessing: string | null;
}) {
  const name = getPatientName(appointment);
  const avatar = getPatientAvatar(appointment);
  const aptId = getAppointmentId(appointment);
  const date = formatDate(appointment.appointmentDate);
  const time = formatTime(appointment.appointmentTime);
  const type = appointment.appointmentType || "chat";
  const id = appointment._id || appointment.id;
  const processing = isProcessing === id;

  return (
    <div className="group bg-white p-6 rounded-2xl flex items-center justify-between transition-all hover:shadow-[0_12px_40px_rgba(10,45,120,0.06)] border border-transparent hover:border-[#c3c6d7]/10">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-[#ededf9]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1560e8&color=fff&size=64&bold=true`;
            }}
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4
              className="font-bold text-lg text-[#191b23]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {name}
            </h4>
            <span className="text-xs font-mono text-[#737686] font-medium px-2 py-0.5 bg-[#f2f3fe] rounded-md">
              {aptId}
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <span className="flex items-center text-xs text-[#424655]">
              <span className="material-symbols-outlined text-xs mr-1 text-[#334e99]">
                calendar_month
              </span>
              {date}
            </span>
            <span className="flex items-center text-xs text-[#424655]">
              <span className="material-symbols-outlined text-xs mr-1 text-[#334e99]">
                schedule
              </span>
              {time}
            </span>
            {appointment.reason && (
              <span className="flex items-center text-xs text-[#424655]">
                <span className="material-symbols-outlined text-xs mr-1 text-[#334e99]">
                  medical_information
                </span>
                {appointment.reason}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-12">
        <TypeBadge type={type} />
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onAccept(id)}
            disabled={processing}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Accept"
            title="Accept"
          >
            {processing ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">check</span>
            )}
          </button>
          <button
            onClick={() => onReschedule(id)}
            disabled={processing}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reschedule"
            title="Reschedule"
          >
            <span className="material-symbols-outlined">calendar_clock</span>
          </button>
          <button
            onClick={() => onReject(id)}
            disabled={processing}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reject"
            title="Reject"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function RequestSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl flex items-center justify-between animate-pulse">
      <div className="flex items-center space-x-6">
        <div className="w-14 h-14 rounded-full bg-slate-200" />
        <div>
          <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex items-center space-x-12">
        <div className="h-8 w-28 bg-slate-100 rounded-full" />
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClinicalRequests() {
  const { pathname } = useLocation();
  const [activeNav, setActiveNav] = useState("Requests");
  const currentDoctor = useSelector(selectCurrentDoctor);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Data state
  const [requests, setRequests] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const limit = 10;

  // Modals state
  const [acceptId, setAcceptId] = useState<string | null>(null);
  
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Sync sidebar active state with route
  useEffect(() => {
    if (pathname === FRONTEND_ROUTES.DOCTOR_REQUESTS) setActiveNav("Requests");
    else if (pathname === FRONTEND_ROUTES.DOCTOR_APPOINTMENTS) setActiveNav("Appointments");
    else if (pathname === FRONTEND_ROUTES.DOCTOR_SLOTS) setActiveNav("Available Timings");
    else if (pathname === FRONTEND_ROUTES.DOCTOR_DASHBOARD) setActiveNav("Dashboard");
    else setActiveNav("Requests");
  }, [pathname]);

  const doctorName = (currentDoctor?.role === 'doctor' && currentDoctor?.name)
    ? `Dr. ${currentDoctor.name}`
    : "Doctor";

  // ─── Fetch requests from API ────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getDoctorRequests(page, limit);
      // Handle various response shapes
      const data = response?.data || response;
      const appointments: PopulatedAppointment[] = data?.appointments || data?.requests || data || [];
      const total = data?.total || data?.totalCount || appointments.length;
      setRequests(Array.isArray(appointments) ? appointments : []);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (err: any) {
      console.error("Failed to fetch requests:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load appointment requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ─── Accept / Reject / Reschedule ───────────────────────────────────────────
  const confirmAccept = async () => {
    if (!acceptId) return;
    setProcessingId(acceptId);
    try {
      await appointmentService.approveAppointment(acceptId);
      toast.success("Appointment approved successfully");
      setRequests(prev => prev.filter(r => (r._id || r.id) !== acceptId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve appointment");
    } finally {
      setProcessingId(null);
      setAcceptId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setProcessingId(rejectId);
    try {
      await appointmentService.rejectAppointment(rejectId, rejectReason);
      toast.success("Appointment rejected");
      setRequests(prev => prev.filter(r => (r._id || r.id) !== rejectId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject appointment");
    } finally {
      setProcessingId(null);
      setRejectId(null);
      setRejectReason("");
    }
  };

  const confirmReschedule = async () => {
    if (!rescheduleId) return;
    if (!rescheduleDate || !rescheduleTime) {
      toast.error("Please provide a new date and time");
      return;
    }
    setProcessingId(rescheduleId);
    try {
      await appointmentService.rescheduleAppointment(rescheduleId, {
        appointmentDate: rescheduleDate,
        appointmentTime: rescheduleTime,
      });
      toast.success("Appointment reschedule requested");
      setRequests(prev => prev.filter(r => (r._id || r.id) !== rescheduleId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setProcessingId(null);
      setRescheduleId(null);
      setRescheduleDate("");
      setRescheduleTime("");
    }
  };

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await AuthService.logout("doctor");
      dispatch(logoutDoctor());
      toast.success("Logged out successfully");
      navigate(FRONTEND_ROUTES.DOCTOR_LOGIN);
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] font-sans text-[#191b23]">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        body { font-family: 'Inter', sans-serif; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Sidebar */}
      <DoctorSidebar
        doctorName={doctorName}
        specialty={(currentDoctor?.role === 'doctor' && (currentDoctor as any)?.specialty) || "Clinical Specialist"}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <TopNav />
        <div className="pt-32 pb-12 px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="font-headline text-3xl font-bold text-[#191b23] tracking-tight">
                Appointment Requests
              </h3>
              <p className="text-[#424655] mt-1">
                Review and manage incoming patient consultations.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchRequests()}
                className="flex items-center gap-2 bg-[#f2f3fe] text-[#334e99] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#dbe1ff] transition-all"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                Refresh
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(4)].map((_, i) => <RequestSkeleton key={i} />)}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
              </div>
              <h5 className="font-headline font-bold text-lg text-red-800">{error}</h5>
              <button
                onClick={() => fetchRequests()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && requests.length === 0 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#dbe1ff]/20 rounded-2xl mb-6">
                <span className="material-symbols-outlined text-[#334e99] text-4xl">inbox</span>
              </div>
              <h5 className="font-headline font-bold text-xl text-[#191b23]">No Pending Requests</h5>
              <p className="text-sm text-[#424655] max-w-md mx-auto mt-2">
                You have no pending appointment requests at the moment. New requests from patients will appear here automatically.
              </p>
            </div>
          )}

          {/* Request Cards */}
          {!loading && !error && requests.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#424655]">
                  {requests.length} pending request{requests.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {requests.map((apt) => (
                  <RequestCard
                    key={apt._id || apt.id}
                    appointment={apt}
                    onAccept={(id) => setAcceptId(id)}
                    onReject={(id) => {
                      setRejectId(id);
                      setRejectReason("");
                    }}
                    onReschedule={(id) => {
                      setRescheduleId(id);
                      setRescheduleDate("");
                      setRescheduleTime("");
                    }}
                    isProcessing={processingId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#424655] hover:bg-[#f2f3fe] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Previous
                  </button>
                  <span className="text-sm font-bold text-[#191b23] px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#424655] hover:bg-[#f2f3fe] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Support Section */}
          <div className="mt-12 p-8 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#dbe1ff]/20 rounded-2xl mb-4">
              <span className="material-symbols-outlined text-[#334e99] text-3xl">
                medical_information
              </span>
            </div>
            <h5 className="font-headline font-bold text-lg text-[#191b23]">
              Need help with scheduling?
            </h5>
            <p className="text-sm text-[#424655] max-w-md mx-auto mt-2">
              Our clinical intelligence engine helps you prioritize urgent
              requests based on patient symptoms and medical history.
            </p>
            <button className="mt-6 text-[#334e99] font-bold text-sm hover:underline decoration-2 underline-offset-4">
              Learn about AI-prioritization
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ConfirmModal
        isOpen={!!acceptId}
        onClose={() => setAcceptId(null)}
        onConfirm={confirmAccept}
        title="Accept Request"
        message="Are you sure you want to accept this appointment request? The patient will be notified."
        confirmText="Accept"
        type="info"
        isLoading={processingId === acceptId}
      />

      <ConfirmModal
        isOpen={!!rejectId}
        onClose={() => setRejectId(null)}
        onConfirm={confirmReject}
        title="Reject Request"
        message={
          <div className="text-left mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Rejection</label>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all text-sm"
              rows={3}
              placeholder="E.g., Fully booked, out of office..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        }
        confirmText="Reject"
        type="danger"
        isLoading={processingId === rejectId}
      />

      <ConfirmModal
        isOpen={!!rescheduleId}
        onClose={() => setRescheduleId(null)}
        onConfirm={confirmReschedule}
        title="Reschedule Request"
        message={
          <div className="text-left mt-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Date</label>
              <input
                type="date"
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Time</label>
              <CustomTimePicker value={rescheduleTime} onChange={setRescheduleTime} />
            </div>
          </div>
        }
        confirmText="Reschedule"
        type="info"
        isLoading={processingId === rescheduleId}
      />

      {/* FAB */}
      <button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        style={{ background: "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)" }}
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}