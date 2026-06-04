import { useState, useEffect, useCallback } from "react";
import { toast as toastAlert } from "sonner";
import { appointmentService } from "../../services/AppointmentService";
import { doctorService } from "../../services/DoctorService";
import ConfirmModal from "../../components/Ui/ConfirmModal";

const PAGE_SIZE = 8;

const mapBackendAppointmentToUi = (apt: any) => {
  const doctorData = typeof apt.doctorId === 'object' ? apt.doctorId : {};
  const userData = doctorData?.user || doctorData?.userId || {};
  
  // Format appointmentDate nicely
  let formattedDate = "";
  try {
    const d = new Date(apt.appointmentDate);
    formattedDate = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }); // e.g. "11 Nov 2024"
  } catch (e) {
    formattedDate = String(apt.appointmentDate);
  }

  // Format type nicely
  const typeMap: Record<string, string> = {
    video: "Video Call",
    chat: "Chat",
    //audio: "Audio Call"
  };
  const uiType = typeMap[apt.appointmentType?.toLowerCase()] || apt.appointmentType || "Chat";

  return {
    _raw: apt,
    id: apt.customId || apt.id || apt._id,
    doctor: doctorData?.name || userData?.name || apt.doctorName || "Doctor",
    specialty: doctorData?.specialty || doctorData?.department || apt.specialty || "General Visit",
    type: uiType,
    date: formattedDate,
    time: apt.appointmentTime,
    email: userData?.email || apt.doctorEmail || "contact@takecare.com",
    phone: userData?.phone || apt.doctorPhone || "",
    avatar: doctorData?.profileImage || userData?.profileImage || apt.doctorImage || null
  };
};

// ─── Call Type Icon ─────────────────────────────────────────────────────────────
function CallTypeBadge({ type }: { type: string }) {
  const configs: Record<string, { icon: string; color: string }> = {
    "Video Call": { icon: "M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14v-4zM3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z", color: "#1560e8" },
    "Audio Call": { icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z", color: "#00bfa5" },
    "Chat": { icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", color: "#f59e0b" },
  };
  const cfg = configs[type] || configs["Chat"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: cfg.color, fontWeight: 600 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth={2} width={13} height={13}>
        <path d={cfg.icon} />
      </svg>
      {type}
    </span>
  );
}

// ─── Doctor Avatar ──────────────────────────────────────────────────────────────
function DoctorAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <img src={avatar} alt={name} style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "1.5px solid var(--border)" }} />
    );
  }
  const initials = name.replace("Dr.", "").replace("Dr ", "").trim().slice(0, 2).toUpperCase();
  const colors = ["#e8f0fe", "#e6faf7", "#fff7ed", "#fdf2f8", "#f0fdf4"];
  const strokes = ["#1560e8", "#00bfa5", "#f59e0b", "#ec4899", "#16a34a"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
      background: colors[idx], border: `1.5px solid ${strokes[idx]}22`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color: strokes[idx],
    }}>
      {initials}
    </div>
  );
}

// ─── Action Button (icon circle) ───────────────────────────────────────────────
function ActionBtn({ icon, title, onClick, danger = false, color }: { icon: string; title: string; onClick?: () => void; danger?: boolean; color?: string }) {
  const [h, setH] = useState(false);
  const activeColor = danger ? "#ef4444" : (color || "#1560e8");
  const activeBg   = danger ? "#fef2f2" : (color ? `${color}18` : "#e8f0fe");
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 34, height: 34, borderRadius: "50%",
        border: `1.5px solid ${h ? activeColor : "#dde6f5"}`,
        background: h ? activeBg : "white",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .18s", flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke={h ? activeColor : "#5a6a80"} strokeWidth={2} width={14} height={14}>
        <path d={icon} />
      </svg>
    </button>
  );
}

// ─── Reschedule Modal ────────────────────────────────────────────────────────────
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function convertTo12h(t: string) {
  if (!t) return t;
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${ampm}`;
}

function RescheduleModal({
  apt, onClose, onSuccess
}: {
  apt: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selDay,    setSelDay]    = useState<number | null>(null);
  const [slots,     setSlots]     = useState<any[]>([]);
  const [loadSlots, setLoadSlots] = useState(false);
  const [selSlot,   setSelSlot]   = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const doctorId = apt._raw?.doctorId?._id || apt._raw?.doctorId?.id || apt._raw?.doctorId;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelDay(null); setSelSlot(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelDay(null); setSelSlot(null);
  };

  const isPast = (d: number) => {
    const check = new Date(viewYear, viewMonth, d, 23, 59, 59);
    return check < today;
  };

  // Fetch slots when a date is selected
  useEffect(() => {
    if (selDay === null || !doctorId) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(selDay).padStart(2,"0")}`;
    setLoadSlots(true);
    setSlots([]);
    setSelSlot(null);
    doctorService.getAvailableSlots(String(doctorId), dateStr)
      .then(res => {
        let slotsData = [];
        if (Array.isArray(res)) slotsData = res;
        else if (res && Array.isArray(res.data)) slotsData = res.data, console.log("1");
        else if (res && res.data && Array.isArray(res.data.data)) slotsData = res.data.data, console.log("2");
        else if (res && res.data && Array.isArray(res.data.availableSlots)) slotsData = res.data.availableSlots, console.log("3");
        else if (res && Array.isArray(res.slots)) slotsData = res.slots, console.log("4");
        else if (res && Array.isArray(res.availableSlots)) slotsData = res.availableSlots, console.log("5");
        setSlots(slotsData);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadSlots(false));
  }, [selDay, viewYear, viewMonth, doctorId]);
  

  const morning   = slots.filter(s => parseInt(s.startTime) < 12);
  const afternoon = slots.filter(s => { const h = parseInt(s.startTime); return h >= 12 && h < 17; });
  const evening   = slots.filter(s => parseInt(s.startTime) >= 17);

  const handleSubmit = async () => {
    if (!selDay || !selSlot) return;
    setSubmitting(true);
    try {
      const appointmentId = apt._raw?._id || apt._raw?.id || apt.id;
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(selDay).padStart(2,"0")}`;
      await appointmentService.rescheduleAppointment(appointmentId, {
        appointmentDate: dateStr,
        appointmentTime: selSlot.startTime,
        slotId: selSlot.slotId,
      });
      toastAlert.success("Reschedule request sent! Waiting for doctor approval.");
      onSuccess();
    } catch (err: any) {
      toastAlert.error(err?.message || err?.response?.data?.message || "Failed to reschedule. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const SlotBtn = ({ slot }: { slot: any }) => {
    const booked = !slot.isAvailable;
    const sel    = selSlot?.startTime === slot.startTime;
    return (
      <button
        disabled={booked}
        onClick={() => !booked && setSelSlot(slot)}
        style={{
          padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
          border: sel ? "2px solid #1560e8" : "1.5px solid #dde6f5",
          background: sel ? "#1560e8" : booked ? "#f8fafc" : "#fff",
          color:  sel ? "#fff" : booked ? "#b0bec5" : "#374151",
          cursor: booked ? "not-allowed" : "pointer",
          textDecoration: booked ? "line-through" : "none",
          opacity: booked ? 0.6 : 1,
          transition: "all .15s",
        }}
      >{convertTo12h(slot.startTime)}</button>
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(3px)",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "min(520px, 95vw)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #f0f4fc",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0f1c2e" }}>Reschedule Appointment</div>
            <div style={{ fontSize: 12, color: "#5a6a80", marginTop: 3 }}>with {apt.doctor}</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "1.5px solid #dde6f5", background: "#f8fafc",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#5a6a80" strokeWidth={2.5} width={14} height={14}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Calendar */}
          <div style={{ background: "#f8faff", borderRadius: 14, padding: "16px", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#5a6a80" strokeWidth={2.5} width={16} height={16}><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f1c2e" }}>
                {MONTHS_SHORT[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#5a6a80" strokeWidth={2.5} width={16} height={16}><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
              {DAYS_SHORT.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const past = isPast(d);
                const sel  = d === selDay;
                const isT  = viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate();
                return (
                  <button key={d} disabled={past} onClick={() => !past && setSelDay(d)} style={{
                    aspectRatio: "1", borderRadius: "50%", border: "none",
                    background: sel ? "#1560e8" : "transparent",
                    color: sel ? "#fff" : isT ? "#1560e8" : past ? "#cbd5e1" : "#0f1c2e",
                    fontWeight: sel || isT ? 700 : 500, fontSize: 13,
                    cursor: past ? "default" : "pointer",
                    opacity: past ? 0.4 : 1,
                    transition: "background .15s",
                  }}>{d}</button>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          {selDay && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1c2e", marginBottom: 10 }}>Available Slots</div>
              {loadSlots ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#5a6a80", fontSize: 13 }}>Loading slots...</div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#5a6a80", fontSize: 13 }}>No slots available for this date.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {morning.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, marginBottom: 6 }}>MORNING</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                        {morning.map((s: any) => <SlotBtn key={s.slotId || s.startTime} slot={s} />)}
                      </div>
                    </div>
                  )}
                  {afternoon.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, marginBottom: 6 }}>AFTERNOON</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                        {afternoon.map((s: any) => <SlotBtn key={s.slotId || s.startTime} slot={s} />)}
                      </div>
                    </div>
                  )}
                  {evening.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, marginBottom: 6 }}>EVENING</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                        {evening.map((s: any) => <SlotBtn key={s.slotId || s.startTime} slot={s} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Selected summary */}
          {selSlot && selDay && (
            <div style={{
              background: "#f0f6ff", border: "1.5px solid #c7d9f8", borderRadius: 10,
              padding: "12px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1560e8" strokeWidth={2} width={16} height={16}><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
              <div style={{ fontSize: 13, color: "#1560e8", fontWeight: 600 }}>
                {MONTHS_SHORT[viewMonth]} {selDay}, {viewYear} · {convertTo12h(selSlot.startTime)}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px 0", borderRadius: 10,
              border: "1.5px solid #dde6f5", background: "#f8fafc",
              fontSize: 13, fontWeight: 600, color: "#5a6a80", cursor: "pointer",
            }}>Cancel</button>
            <button
              disabled={!selSlot || submitting}
              onClick={handleSubmit}
              style={{
                flex: 2, padding: "11px 0", borderRadius: 10, border: "none",
                background: (!selSlot || submitting) ? "#c7d9f8" : "linear-gradient(135deg,#1560e8,#0d4bc4)",
                fontSize: 13, fontWeight: 700, color: "#fff",
                cursor: (!selSlot || submitting) ? "not-allowed" : "pointer",
                boxShadow: (!selSlot || submitting) ? "none" : "0 4px 12px rgba(21,96,232,.3)",
                transition: "all .2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {submitting ? "Requesting..." : "Request Reschedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Row ────────────────────────────────────────────────────────────
function AppointmentRow({ apt, status, onCancel, onReschedule, onAcceptReschedule, onRejectReschedule, onViewDetails }: { apt: any; status: string; onCancel: (apt: any) => void; onReschedule: (apt: any) => void; onAcceptReschedule?: (apt: any) => void; onRejectReschedule?: (apt: any) => void; onViewDetails?: (apt: any) => void; }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 20px",
      borderBottom: "1px solid #f0f4fc",
      background: "white",
      transition: "background .15s",
      flexWrap: "wrap"
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "#f8faff")}
      onMouseLeave={e => (e.currentTarget.style.background = "white")}
    >
      {/* Avatar */}
      <DoctorAvatar name={apt.doctor} avatar={apt.avatar} />

      {/* Doctor + apt id */}
      <div style={{ minWidth: 110, flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: "#1560e8", fontWeight: 700, marginBottom: 3 }}>#{apt.id}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1c2e" }}>{apt.doctor}</div>
      </div>

      {/* Date + type */}
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#5a6a80" strokeWidth={2} width={12} height={12}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontSize: 12, color: "#5a6a80", fontWeight: 600, textDecoration: apt._raw?.status === "reschedule_requested" ? "line-through" : "none", opacity: apt._raw?.status === "reschedule_requested" ? 0.7 : 1 }}>{apt.date} {convertTo12h(apt.time)}</span>
          </div>
          {apt._raw?.status === "reschedule_requested" && apt._raw?.rescheduleRequest?.appointmentDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2} width={12} height={12}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 700 }}>
                New: {new Date(apt._raw.rescheduleRequest.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} {convertTo12h(apt._raw.rescheduleRequest.appointmentTime)}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#5a6a80", fontWeight: 500 }}>{apt.specialty}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#dde6f5", display: "inline-block" }} />
          <CallTypeBadge type={apt.type} />
        </div>
      </div>

      {/* Contact */}
      <div style={{ minWidth: 180, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#5a6a80" strokeWidth={2} width={12} height={12}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
          </svg>
          <span style={{ fontSize: 12, color: "#0f1c2e", fontWeight: 500 }}>{apt.email}</span>
        </div>
        {apt.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#5a6a80" strokeWidth={2} width={12} height={12}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span style={{ fontSize: 12, color: "#0f1c2e", fontWeight: 500 }}>{apt.phone}</span>
          </div>
        )}
      </div>

      {/* Action icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {onViewDetails && (
          <ActionBtn
            icon="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0 M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
            title="View Details"
            color="#3b82f6"
            onClick={() => onViewDetails(apt)}
          />
        )}
        {apt._raw?.status === "reschedule_requested" && (
          <>
            <ActionBtn
              icon="M5 13l4 4L19 7"
              title="Accept Reschedule"
              color="#16a34a"
              onClick={() => onAcceptReschedule && onAcceptReschedule(apt)}
            />
            <ActionBtn
              icon="M18 6L6 18M6 6l12 12"
              title="Reject Reschedule"
              danger
              onClick={() => onRejectReschedule && onRejectReschedule(apt)}
            />
          </>
        )}
        {status === "upcoming" && apt._raw?.status !== "reschedule_requested" && (
          <>
            <ActionBtn
              icon="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
              title="Reschedule Appointment"
              color="#8b5cf6"
              onClick={() => onReschedule(apt)}
            />
            <ActionBtn
              icon="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"
              title="Cancel Appointment"
              danger
              onClick={() => onCancel(apt)}
            />
          </>
        )}
      </div>

      {/* Status Badge */}
      {status === "upcoming" && (
        <span style={{
          padding: "7px 14px", borderRadius: 10,
          background: apt._raw?.status === "confirmed" ? "#e8f0fe" : apt._raw?.status === "reschedule_requested" ? "#f3e8ff" : "#fff7ed",
          color: apt._raw?.status === "confirmed" ? "#1560e8" : apt._raw?.status === "reschedule_requested" ? "#8b5cf6" : "#f59e0b",
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          border: `1.5px solid ${apt._raw?.status === "confirmed" ? "#bfdbfe" : apt._raw?.status === "reschedule_requested" ? "#d8b4fe" : "#ffedd5"}`,
          textTransform: "capitalize",
        }}>
          {apt._raw?.status?.replace("_", " ") || "Pending"}
        </span>
      )}
      {status === "cancelled" && (
        <span style={{
          padding: "7px 14px", borderRadius: 10,
          background: "#fef2f2", color: "#ef4444",
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          border: "1.5px solid #fee2e2",
        }}>
          Cancelled
        </span>
      )}
      {status === "completed" && (
        <span style={{
          padding: "7px 14px", borderRadius: 10,
          background: "#f0fdf4", color: "#16a34a",
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          border: "1.5px solid #dcfce7",
        }}>
          Completed
        </span>
      )}
    </div>
  );
}

// ─── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "20px 0" }}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{
          padding: "7px 14px", borderRadius: 8,
          border: "1.5px solid #dde6f5", background: "white",
          color: page === 1 ? "#bcc8dc" : "#5a6a80",
          fontSize: 13, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer",
        }}
      >
        Prev
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <span key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {prev && p - prev > 1 && <span style={{ color: "#5a6a80", fontSize: 13 }}>…</span>}
            <button
              onClick={() => onChange(p)}
              style={{
                width: 34, height: 34, borderRadius: 8,
                border: p === page ? "none" : "1.5px solid #dde6f5",
                background: p === page ? "linear-gradient(135deg,#1560e8,#0d4bc4)" : "white",
                color: p === page ? "white" : "#5a6a80",
                fontSize: 13, fontWeight: p === page ? 700 : 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: p === page ? "0 3px 10px rgba(21,96,232,.28)" : "none",
              }}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{
          padding: "7px 14px", borderRadius: 8,
          border: "1.5px solid #dde6f5", background: "white",
          color: page === totalPages ? "#bcc8dc" : "#5a6a80",
          fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer",
        }}
      >
        Next
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ upcoming: 0, completed: 0, cancelled: 0, missed: 0 });
  const [loading, setLoading] = useState(false);

  // Cancellation Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Reschedule Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any | null>(null);

  // Accept/Reject Reschedule states
  const [showRejectRescheduleModal, setShowRejectRescheduleModal] = useState(false);
  const [appointmentToRejectReschedule, setAppointmentToRejectReschedule] = useState<any | null>(null);
  const [rejectRescheduleReason, setRejectRescheduleReason] = useState("");

  // View Details Modal state
  const [viewApt, setViewApt] = useState<any | null>(null);

  const handleRescheduleClick = useCallback((apt: any) => {
    setAppointmentToReschedule(apt);
    setShowRescheduleModal(true);
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Map UI tab names to actual DB status values
      // (must match how getStatusCounts aggregates them in the repository)
      const STATUS_MAP: Record<string, string> = {
        upcoming: "pending,confirmed,reschedule_requested",
        cancelled: "cancelled,rejected",
        completed: "completed",
        missed: "no_show",
      };
      const statusParam = STATUS_MAP[activeTab] ?? activeTab;

      const res = await appointmentService.getMyAppointments(
        statusParam,
        page,
        PAGE_SIZE,
        debouncedSearch || undefined
      );

      if (res) {
        const mapped = (res.appointments || []).map(mapBackendAppointmentToUi);
        setAppointments(mapped);
        setTotal(res.total || 0);
        if (res.counts) {
          setCounts(res.counts);
        }
      }
    } catch (err: any) {
      console.error("Failed to load appointments:", err);
      toastAlert.error(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, page, debouncedSearch]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleCancelClick = (apt: any) => {
    setAppointmentToCancel(apt);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;
    if (!cancelReason.trim()) {
      toastAlert.warning("Please provide a reason for cancellation");
      return;
    }

    try {
      const id = appointmentToCancel._raw?._id || appointmentToCancel._raw?.id || appointmentToCancel.id;
      await appointmentService.cancelAppointment(id, cancelReason);
      toastAlert.success("Appointment cancelled successfully");
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setCancelReason("");
      fetchAppointments();
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err);
      toastAlert.error(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleAcceptReschedule = async (apt: any) => {
    try {
      const id = apt._raw?._id || apt._raw?.id || apt.id;
      await appointmentService.acceptReschedule(id);
      toastAlert.success("Reschedule request accepted successfully");
      fetchAppointments();
    } catch (err: any) {
      toastAlert.error(err.response?.data?.message || "Failed to accept reschedule");
    }
  };

  const handleRejectRescheduleClick = (apt: any) => {
    setAppointmentToRejectReschedule(apt);
    setRejectRescheduleReason("");
    setShowRejectRescheduleModal(true);
  };

  const handleRejectRescheduleConfirm = async () => {
    if (!appointmentToRejectReschedule) return;
    if (!rejectRescheduleReason.trim()) {
      toastAlert.warning("Please provide a reason for rejecting the reschedule");
      return;
    }
    try {
      const id = appointmentToRejectReschedule._raw?._id || appointmentToRejectReschedule._raw?.id || appointmentToRejectReschedule.id;
      await appointmentService.rejectReschedule(id, rejectRescheduleReason);
      toastAlert.success("Reschedule request rejected");
      setShowRejectRescheduleModal(false);
      setAppointmentToRejectReschedule(null);
      setRejectRescheduleReason("");
      fetchAppointments();
    } catch (err: any) {
      toastAlert.error(err.response?.data?.message || "Failed to reject reschedule");
    }
  };

  const tabsConfig = [
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "missed", label: "Missed", count: counts.missed || 0 },
  ];

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .search-input:focus { outline: none; border-color: var(--blue) !important; box-shadow: 0 0 0 3px rgba(21,96,232,.12); }
        .apt-card { animation: fade-up .4s ease both; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="apt-card" style={{
        background: "white", borderRadius: 20,
        border: "1.5px solid var(--border)",
        boxShadow: "0 4px 24px rgba(21,96,232,.06)",
        overflow: "hidden",
      }}>

        {/* ── Top bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #f0f4fc",
          flexWrap: "wrap", gap: 12,
        }}>
          {/* Title */}
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
            Appointments
          </h2>

          {/* Search + view toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#5a6a80" strokeWidth={2} width={14} height={14}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search appointments..."
                style={{
                  paddingLeft: 34, paddingRight: 14, height: 36,
                  border: "1.5px solid var(--border)", borderRadius: 9,
                  fontSize: 13, color: "var(--text)", background: "var(--bg)",
                  fontFamily: "inherit", width: 220,
                  transition: "all .2s",
                }}
              />
            </div>

            {/* View toggle */}
            {[
              { id: "list", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
              { id: "grid", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
            ].map(({ id, icon }) => (
              <button key={id} onClick={() => setViewMode(id)} style={{
                width: 36, height: 36, borderRadius: 9, cursor: "pointer",
                border: "1.5px solid var(--border)",
                background: viewMode === id ? "linear-gradient(135deg,var(--blue),var(--blue2))" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: viewMode === id ? "0 3px 10px rgba(21,96,232,.2)" : "none",
                transition: "all .2s",
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={viewMode === id ? "white" : "#5a6a80"} strokeWidth={2} width={14} height={14}>
                  <path d={icon} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs + Date filter row ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid #f0f4fc",
          flexWrap: "wrap", gap: 10,
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {tabsConfig.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                  border: "none",
                  background: activeTab === tab.key
                    ? "linear-gradient(135deg,var(--blue),var(--blue2))"
                    : "var(--bg)",
                  color: activeTab === tab.key ? "white" : "var(--sub)",
                  fontSize: 13, fontWeight: 700,
                  boxShadow: activeTab === tab.key ? "0 3px 10px rgba(21,96,232,.28)" : "none",
                  transition: "all .2s",
                }}
              >
                {tab.label}
                <span style={{
                  minWidth: 22, height: 20, borderRadius: 6, padding: "0 5px",
                  background: activeTab === tab.key ? "rgba(255,255,255,.25)" : "white",
                  border: activeTab === tab.key ? "none" : "1.5px solid var(--border)",
                  color: activeTab === tab.key ? "white" : "var(--sub)",
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Appointment List ── */}
        <div style={{ minHeight: 200, position: "relative" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, flexDirection: "column", gap: 12 }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: "50%",
                border: "3px solid var(--blue-xlight)",
                borderTopColor: "var(--blue)",
                animation: "spin 0.8s linear infinite"
              }} />
              <span style={{ fontSize: 13, color: "var(--sub)", fontWeight: 600 }}>Loading appointments...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--sub)", fontSize: 14 }}>
              No appointments found.
            </div>
          ) : (
            appointments.map((apt) => (
              <AppointmentRow key={apt.id} apt={apt} status={activeTab} onCancel={handleCancelClick} onReschedule={handleRescheduleClick} onAcceptReschedule={handleAcceptReschedule} onRejectReschedule={handleRejectRescheduleClick} onViewDetails={setViewApt} />
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {appointments.length > 0 && (
          <div style={{ borderTop: "1px solid #f0f4fc" }}>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        )}
      </div>

      {/* ── Cancellation Modal ── */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setAppointmentToCancel(null); }}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment"
        message={
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            <span>Are you sure you want to cancel your appointment with <strong>{appointmentToCancel?.doctor}</strong>? This action cannot be undone.</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)" }}>Reason for Cancellation</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Please tell us why you are cancelling..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid var(--border)", fontSize: 13,
                  fontFamily: "inherit", resize: "none", outline: "none"
                }}
              />
            </div>
          </div>
        }
        confirmText="Cancel Appointment"
        type="danger"
      />

      {/* ── Reject Reschedule Modal ── */}
      <ConfirmModal
        isOpen={showRejectRescheduleModal}
        onClose={() => { setShowRejectRescheduleModal(false); setAppointmentToRejectReschedule(null); }}
        onConfirm={handleRejectRescheduleConfirm}
        title="Reject Reschedule"
        message={
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            <span>Are you sure you want to reject the reschedule request from <strong>{appointmentToRejectReschedule?.doctor}</strong>? This will cancel the reschedule request.</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)" }}>Reason for Rejection</label>
              <textarea
                value={rejectRescheduleReason}
                onChange={e => setRejectRescheduleReason(e.target.value)}
                placeholder="Please tell the doctor why you cannot accept this time..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid var(--border)", fontSize: 13,
                  fontFamily: "inherit", resize: "none", outline: "none"
                }}
              />
            </div>
          </div>
        }
        confirmText="Reject Reschedule"
        type="danger"
      />

      {/* ── Reschedule Modal ── */}
      {showRescheduleModal && appointmentToReschedule && (
        <RescheduleModal
          apt={appointmentToReschedule}
          onClose={() => { setShowRescheduleModal(false); setAppointmentToReschedule(null); }}
          onSuccess={() => { setShowRescheduleModal(false); setAppointmentToReschedule(null); fetchAppointments(); }}
        />
      )}

      {/* ── View Details Modal ── */}
      {viewApt && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }} onClick={() => setViewApt(null)}>
          <div style={{ background: "#fff", borderRadius: 20, width: "min(400px, 95vw)", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f4fc", paddingBottom: "16px", marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Appointment Details</h2>
              <button onClick={() => setViewApt(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <DoctorAvatar name={viewApt.doctor} avatar={viewApt.avatar} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0f1c2e" }}>{viewApt.doctor}</div>
                  <div style={{ fontSize: 13, color: "#5a6a80" }}>{viewApt.specialty}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text)" }}><strong>Date:</strong> {viewApt.date}</div>
              <div style={{ fontSize: 13, color: "var(--text)" }}><strong>Time:</strong> {convertTo12h(viewApt.time)}</div>
              <div style={{ fontSize: 13, color: "var(--text)" }}><strong>Type:</strong> <CallTypeBadge type={viewApt.type} /></div>
              <div style={{ fontSize: 13, color: "var(--text)" }}><strong>Email:</strong> {viewApt.email}</div>
              {viewApt.phone && <div style={{ fontSize: 13, color: "var(--text)" }}><strong>Phone:</strong> {viewApt.phone}</div>}
              <div style={{ fontSize: 13, color: "var(--text)" }}><strong>Status:</strong> <span style={{ textTransform: "capitalize" }}>{viewApt._raw?.status?.replace("_", " ")}</span></div>
              
              {(viewApt._raw?.status === "cancelled" || viewApt._raw?.status === "rejected") && (
                <div style={{ marginTop: "8px", padding: "12px", background: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 700, marginBottom: "6px" }}>
                    {viewApt._raw?.status === "cancelled" ? "Cancellation Details" : "Rejection Details"}
                  </div>
                  {viewApt._raw?.cancelledBy && (
                    <div style={{ fontSize: 13, color: "#7f1d1d", marginBottom: "4px" }}>
                      <strong>By:</strong> <span style={{ textTransform: "capitalize" }}>{viewApt._raw?.cancelledBy}</span>
                    </div>
                  )}
                  {(viewApt._raw?.cancellationReason || viewApt._raw?.rejectionReason) && (
                    <div style={{ fontSize: 13, color: "#7f1d1d" }}>
                      <strong>Reason:</strong> {viewApt._raw?.cancellationReason || viewApt._raw?.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontSize: 11, textTransform: "uppercase", marginTop: "12px", color: "var(--blue)", fontWeight: 700 }}>ID: {viewApt.id}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}