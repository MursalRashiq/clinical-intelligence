import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser, logout } from "../../redux/user/userSlice";
import AuthService from "../../services/AuthService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import DoctorSidebar from "../../components/Doctor/SideBar";
import TopNav from "../../components/Doctor/TopNav";
import { doctorService } from "../../services/DoctorService";
import { toast } from "sonner";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const GRADIENT = "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)";

interface TimeSlot {
  customId: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
  booked: boolean;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

interface Schedule {
  id: string;
  weeklySchedule: DaySchedule[];
  defaultSlotDuration: number;
  bufferTime: number;
  maxPatientsPerSlot: number;
  isActive: boolean;
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eef1fd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <span className="ms" style={{ fontSize: 36, color: "#1560e8" }}>schedule</span>
      </div>
      <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#191b23", marginBottom: 8 }}>No Schedule Yet</h3>
      <p style={{ color: "#424655", fontSize: "0.9rem", marginBottom: 28 }}>You haven't set up your availability schedule yet.</p>
      <button onClick={onAdd} style={{ background: GRADIENT, color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
        Add Recurring Slots
      </button>
    </div>
  );
}

function AddSlotModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [skipOverlapping, setSkipOverlapping] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: string) =>
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

  const handleSubmit = async () => {
    if (selectedDays.length === 0) { toast.error("Please select at least one day"); return; }
    if (!startTime || !endTime) { toast.error("Please provide start and end times"); return; }
    if (startTime >= endTime) { toast.error("Start time must be before end time"); return; }
    setSaving(true);
    try {
      const result = await doctorService.addRecurringSlots({ startTime, endTime, days: selectedDays, skipOverlappingDays: skipOverlapping });
      if (result?.data?.success) {
        const { overlappingDays, nonOverlappingDays } = result.data;
        if (nonOverlappingDays?.length > 0) toast.success(`Slots added to ${nonOverlappingDays.length} day(s)`);
        if (overlappingDays?.length > 0) toast.info(`Skipped ${overlappingDays.length} day(s) due to overlapping slots`);
        onSuccess();
        onClose();
      } else {
        toast.error(result?.message || "Failed to add slots");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to add slots");
    }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 36, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#191b23" }}>Add Recurring Slots</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#424655", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {([{ label: "Start Time", value: startTime, set: setStartTime }, { label: "End Time", value: endTime, set: setEndTime }] as const).map(({ label, value, set }) => (
            <div key={label}>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</label>
              <input type="time" value={value} onChange={e => set(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Select Days</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DAYS_OF_WEEK.map(day => (
              <button key={day} onClick={() => toggleDay(day)}
                style={{ padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1.5px solid", borderColor: selectedDays.includes(day) ? "#1560e8" : "#dde6f5", background: selectedDays.includes(day) ? "#eef1fd" : "white", color: selectedDays.includes(day) ? "#1560e8" : "#424655", transition: "all .15s" }}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "12px 16px", background: "#f8faff", borderRadius: 10, border: "1px solid #e0e7ff" }}>
          <input type="checkbox" id="skipOverlap" checked={skipOverlapping} onChange={e => setSkipOverlapping(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#1560e8", cursor: "pointer" }} />
          <label htmlFor="skipOverlap" style={{ fontSize: "0.85rem", color: "#424655", cursor: "pointer" }}>Skip days with overlapping slots</label>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e7e7f3", color: "#424655", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: "10px 28px", borderRadius: 10, border: "none", background: GRADIENT, color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.75 : 1 }}>
            {saving ? "Adding..." : "Add Slots"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageSlots() {
  const [activeNav, setActiveNav] = useState("Available Timings");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const doctorName = currentUser?.name ? `Dr. ${currentUser.name}` : "Doctor";
  const specialty = (currentUser as { specialty?: string })?.specialty || "Specialist";

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const result = await doctorService.getSchedule();
      setSchedule(result?.data ?? null);
    } catch { setSchedule(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchedule(); }, []);

  const handleDeleteSlot = async (day: string, slotId: string) => {
    setDeletingSlot(slotId);
    try {
      await doctorService.deleteRecurringSlot(day, slotId);
      toast.success("Slot removed successfully");
      fetchSchedule();
    } catch { toast.error("Failed to remove slot"); }
    finally { setDeletingSlot(null); }
  };

  const handleLogout = async () => {
    try { await AuthService.logout(); dispatch(logout()); navigate(FRONTEND_ROUTES.DOCTOR_LOGIN); }
    catch { toast.error("Logout failed"); }
  };

  const activeDays = schedule?.weeklySchedule.filter(d => d.enabled && d.slots.length > 0) ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        .ms { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; display: inline-block; line-height: 1; }
        * { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div style={{ fontFamily: "Inter, sans-serif", background: "#faf8ff", minHeight: "100vh", color: "#191b23" }}>
        {/* ✅ Global sidebar — DoctorSidebar has useNavigate and routes properly */}
        <DoctorSidebar
          doctorName={doctorName}
          specialty={specialty}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onLogout={handleLogout}
        />
        <TopNav />

        <main style={{ marginLeft: 256, paddingTop: 64, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 36px", animation: "fadeIn .3s ease" }}>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
              <div>
                <h1 style={{ fontFamily: "Manrope, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#191b23", marginBottom: 6 }}>Manage Availability</h1>
                <p style={{ color: "#424655" }}>Set your weekly recurring time slots for patient appointments.</p>
              </div>
              <button onClick={() => setShowAddModal(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: GRADIENT, color: "white", border: "none", padding: "12px 22px", borderRadius: 12, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(21,96,232,.3)", transition: "transform .15s, box-shadow .15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(21,96,232,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(21,96,232,.3)"; }}>
                <span className="ms" style={{ fontSize: "1.1rem" }}>add</span>
                Add Recurring Slot
              </button>
            </div>

            {schedule && (
              <>
                <div style={{ background: "#fff8e1", borderLeft: "4px solid #f59e0b", padding: "14px 20px", borderRadius: "0 8px 8px 0", marginBottom: 28, fontSize: "0.95rem", color: "#b45309", display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="ms" style={{ fontSize: "1.4rem" }}>info</span>
                  <span style={{ lineHeight: 1.5 }}>
                    <strong style={{ fontWeight: 800 }}>Weekly Recurring Schedule:</strong> The timings you configure below will automatically repeat every week. You only need to set them once!
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
                {[
                  { icon: "calendar_today", label: "Active Days", value: activeDays.length, color: "#1560e8", bg: "#eef1fd" },
                  { icon: "schedule", label: "Total Slots", value: schedule.weeklySchedule.reduce((a, d) => a + d.slots.length, 0), color: "#0a7c44", bg: "#e8f7ee" },
                  { icon: "event_busy", label: "Booked Slots", value: schedule.weeklySchedule.reduce((a, d) => a + d.slots.filter(s => s.booked).length, 0), color: "#b45309", bg: "#fef3e2" },
                ].map(({ icon, label, value, color, bg }) => (
                  <div key={label} style={{ background: "white", borderRadius: 16, padding: "20px 24px", border: "1.5px solid #f0f0f8", boxShadow: "0 1px 4px rgba(0,0,0,.05)", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="ms" style={{ color, fontSize: "1.4rem" }}>{icon}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "#424655", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#191b23", lineHeight: 1 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}

            <div style={{ background: "white", borderRadius: 20, border: "1.5px solid #f0f0f8", boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" }}>
              <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0f0f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#191b23" }}>Weekly Schedule</h2>
                {schedule && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, background: schedule.isActive ? "#e8f7ee" : "#f5e5e5", color: schedule.isActive ? "#0a7c44" : "#ba1a1a" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                    {schedule.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
              <div style={{ padding: "8px 0" }}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
                    <div style={{ width: 36, height: 36, border: "3px solid #e0e7ff", borderTopColor: "#1560e8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : !schedule || activeDays.length === 0 ? (
                  <EmptyState onAdd={() => setShowAddModal(true)} />
                ) : (
                  DAYS_OF_WEEK.map(dayName => {
                    const dayData = schedule.weeklySchedule.find(d => d.day === dayName);
                    const isActive = !!(dayData?.enabled && dayData.slots.length > 0);
                    return (
                      <div key={dayName} style={{ borderBottom: "1px solid #f8f8fc", padding: "16px 28px", display: "flex", alignItems: "flex-start", gap: 24 }}>
                        <div style={{ width: 100, flexShrink: 0, paddingTop: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: "0.85rem", color: isActive ? "#191b23" : "#9ca3af" }}>{dayName}</p>
                          <p style={{ fontSize: "0.68rem", color: isActive ? "#1560e8" : "#c4c4d4", fontWeight: 600, marginTop: 2 }}>
                            {isActive && dayData ? `${dayData.slots.length} slot${dayData.slots.length > 1 ? "s" : ""}` : "No slots"}
                          </p>
                        </div>
                        <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                          {!isActive || !dayData ? (
                            <span style={{ fontSize: "0.8rem", color: "#c4c4d4", fontStyle: "italic" }}>No available slots</span>
                          ) : dayData.slots.map(slot => (
                            <div key={slot.customId} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1.5px solid", borderColor: slot.booked ? "#fed7aa" : "#dde6f5", background: slot.booked ? "#fff7ed" : "#f5f7ff" }}>
                              <span className="ms" style={{ fontSize: "0.9rem", color: slot.booked ? "#b45309" : "#1560e8" }}>{slot.booked ? "event_busy" : "schedule"}</span>
                              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: slot.booked ? "#b45309" : "#334e99" }}>{slot.startTime} – {slot.endTime}</span>
                              {slot.booked && <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#b45309", background: "#fed7aa", padding: "1px 6px", borderRadius: 999 }}>BOOKED</span>}
                              {!slot.booked && (
                                <button onClick={() => handleDeleteSlot(dayName, slot.customId)} disabled={deletingSlot === slot.customId}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}
                                  onMouseEnter={e => (e.currentTarget.style.color = "#ba1a1a")}
                                  onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
                                  {deletingSlot === slot.customId
                                    ? <span style={{ width: 12, height: 12, border: "2px solid #e0e7ff", borderTopColor: "#1560e8", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                                    : <span className="ms" style={{ fontSize: "1rem" }}>close</span>}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {schedule && (
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {[
                  { label: "Default Slot Duration", value: `${schedule.defaultSlotDuration} min`, icon: "timer" },
                  { label: "Buffer Time", value: `${schedule.bufferTime} min`, icon: "hourglass_empty" },
                  { label: "Max Patients / Slot", value: schedule.maxPatientsPerSlot, icon: "groups" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1.5px solid #f0f0f8", display: "flex", alignItems: "center", gap: 14 }}>
                    <span className="ms" style={{ color: "#1560e8", fontSize: "1.3rem" }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: "0.68rem", color: "#424655", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</p>
                      <p style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, color: "#191b23", fontSize: "1rem" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddModal && <AddSlotModal onClose={() => setShowAddModal(false)} onSuccess={fetchSchedule} />}
    </>
  );
}
