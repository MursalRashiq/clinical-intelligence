import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Search, ChevronLeft, ChevronRight, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "../../components/Admin/Sidebar";
import TopNav from "../../components/Admin/TopNav";
import { theme as t } from "../../theme";
import { appointmentService } from "../../services/AppointmentService";
import type { PopulatedAppointment } from "../../types/appointment.types";
import ConfirmModal from "../../components/Ui/ConfirmModal";

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

function getPatientGender(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.gender) return appt.patientId.gender;
  return "—";
}

function getDoctorName(appt: PopulatedAppointment): string {
  if (typeof appt.doctorId === "object" && appt.doctorId?.name) return appt.doctorId.name;
  return appt.doctorName || "Unknown Doctor";
}

function getDoctorSpecialty(appt: PopulatedAppointment): string {
  if (typeof appt.doctorId === "object") {
    return appt.doctorId?.specialty || appt.doctorId?.department || "";
  }
  return appt.specialty || "";
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarUrl(name: string, bg = "1560e8"): string {
  const initials = getInitials(name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=fff&size=64&bold=true`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  confirmed: { bg: "#e8f5e9", text: "#2e7d32", dot: "#4caf50" },
  completed: { bg: "#e3f2fd", text: "#1565c0", dot: "#1976d2" },
  cancelled: { bg: "#ffebee", text: "#c62828", dot: "#ef5350" },
  pending: { bg: "#fff8e1", text: "#f57f17", dot: "#ffb300" },
  rejected: { bg: "#fce4ec", text: "#ad1457", dot: "#e91e63" },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status?.toLowerCase()] || statusStyles.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 100,
      background: s.bg, color: s.text,
      fontSize: 11, fontWeight: 700, textTransform: "capitalize",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ appointment, onClose }: { appointment: PopulatedAppointment; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(15,28,46,0.45)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "white", borderRadius: 20, width: "100%", maxWidth: 520,
            boxShadow: "0 24px 80px rgba(0,0,0,0.18)", overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "24px 28px 20px",
            background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
            color: "white", position: "relative",
          }}>
            <button onClick={onClose} style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", cursor: "pointer",
            }}>
              <X size={16} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                src={getAvatarUrl(getPatientName(appointment), "ffffff")}
                alt=""
                style={{ width: 56, height: 56, borderRadius: 14, border: "3px solid rgba(255,255,255,0.3)" }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{getPatientName(appointment)}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>{getPatientEmail(appointment)}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Date", value: formatDate(appointment.appointmentDate) },
                { label: "Time", value: formatTime(appointment.appointmentTime) },
                { label: "Doctor", value: getDoctorName(appointment) },
                { label: "Specialty", value: getDoctorSpecialty(appointment) || "—" },
                { label: "Type", value: appointment.appointmentType?.replace("_", " ") || "—" },
                { label: "Status", value: appointment.status },
                { label: "Payment", value: appointment.paymentStatus || "—" },
                { label: "Fee", value: appointment.consultationFees ? `₹${appointment.consultationFees}` : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 600, color: t.text, textTransform: "capitalize" }}>{value}</p>
                </div>
              ))}
            </div>

            {appointment.reason && (
              <div style={{ marginTop: 20, padding: 16, background: t.blueXLight, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.5px" }}>Reason</p>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: t.text, lineHeight: 1.5 }}>{appointment.reason}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{
            height: 14, width: i === 0 ? 20 : i === 8 ? 32 : `${50 + Math.random() * 50}%`,
            background: t.blueXLight, borderRadius: 6,
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type StatusFilter = "all" | "confirmed" | "completed" | "cancelled" | "pending" | "rejected";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<PopulatedAppointment | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cancelData, setCancelData] = useState<{ isOpen: boolean; id: string; loading: boolean }>({ isOpen: false, id: "", loading: false });
  const [cancelReason, setCancelReason] = useState("Cancelled by Admin");
  const LIMIT = 10;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const res = await appointmentService.getAllAppointments(page, LIMIT, filters);
      const data = res?.data ?? res;
      setAppointments(data?.appointments || []);
      setTotalPages(data?.totalPages || 1);
      setTotalCount(data?.total || 0);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async () => {
    if (!cancelData.id) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    setCancelData(prev => ({ ...prev, loading: true }));
    try {
      await appointmentService.cancelAppointment(cancelData.id, cancelReason);
      toast.success("Appointment cancelled successfully");
      setCancelData({ isOpen: false, id: "", loading: false });
      setCancelReason("Cancelled by Admin");
      fetchAppointments();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to cancel appointment");
      setCancelData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const statusTabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar – Desktop */}
      <div style={{ width: 256, position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50 }} className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar – Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(15,28,46,0.4)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: "spring", damping: 30, stiffness: 450 }}
              style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 256, background: "white", boxShadow: "24px 0 48px rgba(0,0,0,0.1)" }}
            >
              <Sidebar onMobileClose={() => setSidebarOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 256 }} className="lg:pl-64">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        <main style={{ flex: 1, padding: "32px clamp(16px, 4vw, 48px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            {/* Page Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: t.blueLight, border: `1px solid ${t.border}`,
                borderRadius: 100, padding: "6px 16px", marginBottom: 8,
              }}>
                <Calendar size={13} style={{ color: t.blue }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: t.blue, textTransform: "uppercase", letterSpacing: "0.5px" }}>Appointment Management</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: t.text, fontFamily: "Fraunces, serif" }}>
                All Appointments
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: t.sub, fontWeight: 500 }}>
                {totalCount} total appointment{totalCount !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Filters Bar */}
            <div style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12,
              marginBottom: 24, padding: "16px 20px",
              background: "white", borderRadius: 16,
              border: `1px solid ${t.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              {/* Search */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: t.blueXLight, borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 200,
              }}>
                <Search size={15} style={{ color: t.sub }} />
                <input
                  type="text"
                  placeholder="Search patient or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none", background: "transparent", outline: "none",
                    fontSize: 13, color: t.text, fontWeight: 500, width: "100%",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Status Tabs */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Filter size={14} style={{ color: t.sub, marginRight: 4 }} />
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                      transition: "all 0.2s",
                      background: statusFilter === tab.value ? t.blue : "transparent",
                      color: statusFilter === tab.value ? "white" : t.sub,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: "white", borderRadius: 16,
              border: `1px solid ${t.border}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${t.border}` }}>
                      {["#", "Patient", "Email", "Gender", "Date", "Time", "Doctor", "Fees", "Status", ""].map((col) => (
                        <th key={col} style={{
                          padding: "14px 16px", textAlign: "left",
                          fontSize: 10, fontWeight: 800, color: t.sub,
                          textTransform: "uppercase", letterSpacing: "0.8px",
                          whiteSpace: "nowrap",
                        }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : appointments.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: "60px 20px" }}>
                          <Calendar size={40} style={{ color: t.border, marginBottom: 12 }} />
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>No appointments found</p>
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: t.sub }}>Try adjusting your filters or search query</p>
                        </td>
                      </tr>
                    ) : (
                      appointments.map((apt, i) => (
                        <motion.tr
                          key={apt._id || apt.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          style={{
                            borderBottom: `1px solid ${t.blueXLight}`,
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = t.blueXLight)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "14px 16px", color: t.sub, fontSize: 11, fontWeight: 600 }}>
                            {(page - 1) * LIMIT + i + 1}
                          </td>

                          {/* Patient */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <img
                                src={getAvatarUrl(getPatientName(apt))}
                                alt=""
                                style={{ width: 32, height: 32, borderRadius: 8 }}
                              />
                              <span style={{ fontWeight: 600, color: t.text, whiteSpace: "nowrap", fontSize: 13 }}>
                                {getPatientName(apt)}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: "14px 16px", color: t.sub, fontSize: 12, whiteSpace: "nowrap" }}>
                            {getPatientEmail(apt)}
                          </td>

                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                              background: getPatientGender(apt).toLowerCase() === "female" ? "#fce4ec" : "#e3f2fd",
                              color: getPatientGender(apt).toLowerCase() === "female" ? "#c62828" : "#1565c0",
                              textTransform: "capitalize",
                            }}>
                              {getPatientGender(apt)}
                            </span>
                          </td>

                          <td style={{ padding: "14px 16px", color: t.text, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>
                            {formatDate(apt.appointmentDate)}
                          </td>

                          <td style={{ padding: "14px 16px", color: t.text, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {formatTime(apt.appointmentTime)}
                          </td>

                          {/* Doctor */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <img
                                src={getAvatarUrl(getDoctorName(apt), "0d4bc4")}
                                alt=""
                                style={{ width: 28, height: 28, borderRadius: 7 }}
                              />
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: "nowrap", display: "block" }}>
                                  {getDoctorName(apt)}
                                </span>
                                {getDoctorSpecialty(apt) && (
                                  <span style={{ fontSize: 10, color: t.sub, whiteSpace: "nowrap" }}>
                                    {getDoctorSpecialty(apt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: "14px 16px", fontWeight: 700, color: t.text, fontSize: 12 }}>
                            {apt.consultationFees ? `₹${apt.consultationFees}` : "—"}
                          </td>

                          <td style={{ padding: "14px 16px" }}>
                            <StatusBadge status={apt.status} />
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); }}
                                title="View Details"
                                style={{
                                  width: 32, height: 32, borderRadius: 8,
                                  background: t.blueLight, border: "none",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: t.blue, cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = t.blue; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = t.blueLight; e.currentTarget.style.color = t.blue; }}
                              >
                                <Eye size={15} />
                              </button>
                              
                              {["pending", "confirmed", "reschedule_requested"].includes(apt.status.toLowerCase()) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setCancelData({ isOpen: true, id: apt._id || apt.id, loading: false }); }}
                                  title="Reject / Cancel"
                                  style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: "#ffebee", border: "none",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#c62828", cursor: "pointer",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "#ef5350"; e.currentTarget.style.color = "white"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffebee"; e.currentTarget.style.color = "#c62828"; }}
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "16px 20px", borderTop: `1px solid ${t.blueXLight}`,
                }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: `1px solid ${t.border}`,
                      background: "white", display: "flex", alignItems: "center", justifyContent: "center",
                      color: page === 1 ? t.border : t.sub, cursor: page === 1 ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        style={{
                          width: 34, height: 34, borderRadius: 8, border: "none",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          transition: "all 0.2s",
                          background: page === pageNum ? t.blue : "transparent",
                          color: page === pageNum ? "white" : t.sub,
                          boxShadow: page === pageNum ? "0 2px 8px rgba(21,96,232,0.25)" : "none",
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: `1px solid ${t.border}`,
                      background: "white", display: "flex", alignItems: "center", justifyContent: "center",
                      color: page === totalPages ? t.border : t.sub, cursor: page === totalPages ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedAppointment && (
        <DetailModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
      )}

      <ConfirmModal
        isOpen={cancelData.isOpen}
        onClose={() => { setCancelData({ isOpen: false, id: "", loading: false }); setCancelReason("Cancelled by Admin"); }}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment"
        message={
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 m-0">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reason for Cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none text-sm"
                rows={3}
                placeholder="Enter the reason here..."
              />
            </div>
          </div>
        }
        confirmText="Yes, Cancel"
        type="danger"
        isLoading={cancelData.loading}
      />

      <style>{`
        .hidden.lg\\:block { display: block !important; }
        .lg\\:hidden { display: none !important; }
        .lg\\:pl-64 { padding-left: 256px !important; }
        @media (max-width: 1024px) {
          .hidden.lg\\:block { display: none !important; }
          .lg\\:hidden { display: flex !important; }
          .lg\\:pl-64 { padding-left: 0 !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}