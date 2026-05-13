import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import doctorService from "../../services/DoctorService";
import { theme as t } from "../../theme";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { Link } from "react-router-dom";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  duration: string;
  fee: number;
  rating: number;
  available: boolean;
  photo: string;
  specialtyColor: { bg: string; color: string };
  animDelay: string;
  emoji: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// SVG Icons
const HeartbeatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 20, height: 20 }}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const SearchIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size, flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PinIcon = ({ size = 12 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size, flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = ({ size = 12 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const getLocalDateString = (d: Date = new Date()) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ─── DoctorCard ──────────────────────────────────────────────────────────────
function DoctorCard({ doc, onBook }: { doc: Doctor; onBook: (id: string, name: string) => void }) {
  const [imgOk, setImgOk] = useState(true);
  const [todaySlots, setTodaySlots] = useState<{startTime: string, endTime: string}[] | null>(null);

  useEffect(() => {
    if (!doc.id) return;
    const fetchTodaySlots = async () => {
      try {
        const todayStr = getLocalDateString();
        const res = await doctorService.getAvailableSlots(doc.id, todayStr);
        if (res?.success && Array.isArray(res.data)) {
          setTodaySlots(res.data);
        } else {
          setTodaySlots([]);
        }
      } catch (err) {
        setTodaySlots([]);
      }
    };
    fetchTodaySlots();
  }, [doc.id]);

  return (
    <div className="doc-card" style={{ animationDelay: doc.animDelay }}>
      <div className="doc-photo-wrap">
        {imgOk && doc.photo ? (
          <img className="doc-photo" src={doc.photo} alt={doc.name} onError={() => setImgOk(false)} />
        ) : (
          <div className="doc-photo-ph">
            <div style={{ fontSize: 52 }}>{doc.emoji}</div>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "rgba(21,96,232,.4)" }}>Photo</span>
          </div>
        )}
        <div className={`doc-avail-pill ${doc.available ? "available" : "unavailable"}`}>
          <div className="doc-avail-dot" />
          {doc.available ? "Available" : "Unavailable"}
        </div>
        <div className="doc-rating-pill">
          <span className="star">★</span>{doc.rating.toFixed(1)}
        </div>
      </div>
      <div className="doc-body">
        <div className="doc-spec-tag" style={{ background: doc.specialtyColor.bg, color: doc.specialtyColor.color }}>
          {doc.specialty}
        </div>
        <div className="doc-name">{doc.name}</div>
        <div className="doc-meta">
          <div className="doc-meta-row">
            <PinIcon />{doc.location}
          </div>
          <div className="doc-meta-row">
            <ClockIcon />{doc.duration}
          </div>
          
          {todaySlots !== null && (
            <div className="doc-meta-row" style={{ marginTop: 4, alignItems: "flex-start" }}>
              <div style={{ marginTop: 2 }}><CalIcon /></div>
              {todaySlots.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0a7c44", width: "100%" }}>Available Today:</span>
                  {todaySlots.slice(0, 3).map((s, i) => (
                    <span key={i} style={{ background: "#e8f7ee", color: "#0a7c44", padding: "2px 6px", borderRadius: 4, fontSize: "10px", fontWeight: 700 }}>
                      {s.startTime} - {s.endTime}
                    </span>
                  ))}
                  {todaySlots.length > 3 && (
                    <span style={{ background: "#f3f4f6", color: "#374151", padding: "2px 6px", borderRadius: 4, fontSize: "10px", fontWeight: 700 }}>
                      +{todaySlots.length - 3}
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#b45309", marginTop: 1 }}>No slots available today</span>
              )}
            </div>
          )}

        </div>
        <div className="doc-fee-row">
          <div>
            <div className="doc-fee-label">Consultation Fees</div>
            <div className="doc-fee-val">₹{doc.fee}</div>
          </div>
        </div>
        <div className="doc-card-btns">
          <button className="btn-fee">View Fees</button>
          {doc.available ? (
            <button className="btn-book" onClick={() => onBook(doc.id, doc.name)}>Book Now</button>
          ) : (
            <button className="btn-book" disabled>Unavailable</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BookModal ────────────────────────────────────────────────────────────────
function BookModal({ doctorId, docName, onClose }: { doctorId: string; docName: string; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [activeDays, setActiveDays] = useState<string[]>([]);

  const today = getLocalDateString();

  useEffect(() => {
    // Fetch doctor's overall schedule to determine active days
    const fetchActiveDays = async () => {
      try {
        const res = await doctorService.getSchedule(doctorId);
        if (res?.data?.weeklySchedule) {
          const days = res.data.weeklySchedule
            .filter((d: any) => d.slots?.length > 0 && d.enabled)
            .map((d: any) => d.day);
          setActiveDays(days);
        }
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      }
    };
    fetchActiveDays();
  }, [doctorId]);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await doctorService.getAvailableSlots(doctorId, date);
        if (res?.success && Array.isArray(res.data)) {
          setSlots(res.data);
          if (res.data.length > 0) {
            setSelectedSlot(`${res.data[0].startTime} - ${res.data[0].endTime}`);
          } else {
            setSelectedSlot("");
          }
        } else {
          setSlots([]);
          setSelectedSlot("");
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
        setSlots([]);
      }
      setLoadingSlots(false);
    };
    fetchSlots();
  }, [date, doctorId]);

  function confirm() {
    if (!date || !selectedSlot) return;
    setConfirmed(true);
    setTimeout(onClose, 2600);
  }

  return (
    <div className="modal-ov open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-x" onClick={onClose}><XIcon /></button>
        <h3>Book Appointment</h3>
        <p style={{ color: "#1560e8", fontWeight: 600, fontSize: 14, marginBottom: 18 }}>with {docName}</p>
        <div className="mr">
          <div className="mf"><label>First Name</label><input type="text" placeholder="Jane" /></div>
          <div className="mf"><label>Last Name</label><input type="text" placeholder="Smith" /></div>
        </div>
        <div className="mf"><label>Email</label><input type="email" placeholder="jane@example.com" /></div>
        <div className="mr">
          <div className="mf">
            <label>Preferred Date</label>
            <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="mf">
            <label>Time Slot</label>
            <select disabled={loadingSlots || slots.length === 0} value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
              {loadingSlots ? (
                <option value="">Loading slots...</option>
              ) : slots.length === 0 ? (
                <option value="">No slots available</option>
              ) : (
                slots.map(s => {
                  const timeStr = `${s.startTime} - ${s.endTime}`;
                  return <option key={timeStr} value={timeStr}>{timeStr}</option>;
                })
              )}
            </select>
          </div>
        </div>

        {activeDays.length > 0 && (
          <div style={{ marginTop: -4, marginBottom: 16, fontSize: "12px", color: "#b45309", background: "#fff8e1", padding: "8px 12px", borderRadius: 8, display: "inline-block", border: "1px solid #fef3c7" }}>
            <strong style={{ fontWeight: 700 }}>Doctor usually available on:</strong> {activeDays.join(", ")}
          </div>
        )}

        <div className="mf">
          <label>Visit Type</label>
          <select>
            <option>📹 Online Video Call</option>
            <option>💬 Online Chat</option>
            <option>🏥 In-Person</option>
          </select>
        </div>
        <div className="mf">
          <label>Reason</label>
          <textarea rows={2} placeholder="Brief description of your concern…" style={{ resize: "none" }} />
        </div>
        <button className="modal-btn" onClick={confirm} disabled={!date || !selectedSlot || confirmed}>
          {confirmed ? "Booking..." : "Confirm Appointment"}
        </button>
        {confirmed && (
          <div className="modal-ok">✓ Appointment booked! A confirmation will be sent to your email.</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TakeCareDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookDoc, setBookDoc] = useState<{ id: string, name: string } | null>(null);
  const [gridView, setGridView] = useState(true);
  const [loadCount, setLoadCount] = useState(0);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery]);

  const fetchDoctors = async () => {
    setLoading(true);
    const res = await doctorService.getAllDoctors({ search: searchQuery, hasSlots: true });
    if (res.success && res.data) {
      const mapped = res.data.doctors.map((d: any, idx: number) => ({
        id: d._id,
        name: `Dr. ${d.userId?.name || "Unknown"}`,
        specialty: d.specialty || "General Specialist",
        location: "Clinic Location", // Hardcoded for now
        duration: "30 Min Consultation",
        fee: d.VideoFees || 500,
        rating: d.ratingAvg || 4.5,
        available: d.isActive,
        photo: d.userId?.profileImage || "",
        specialtyColor: getSpecialtyColor(d.specialty),
        animDelay: `${(idx * 0.03).toFixed(2)}s`,
        emoji: "👨‍⚕️"
      }));
      setDoctors(mapped);
      setLoadCount(res.data.total - mapped.length);
    }
    setLoading(false);
  };

  const getSpecialtyColor = (spec: string) => {
    const s = spec?.toLowerCase() || "";
    if (s.includes("cardio")) return { bg: "#fff3ee", color: "#c2410c" };
    if (s.includes("neuro")) return { bg: "#f0fdf4", color: "#15803d" };
    if (s.includes("pediatr")) return { bg: "#fef9ec", color: "#b45309" };
    if (s.includes("psych")) return { bg: "#e8f0fe", color: "#1560e8" };
    return { bg: "#f3f4f6", color: "#374151" };
  };

  function loadMore() {
    setFetchingMore(true);
    setTimeout(() => { setFetchingMore(false); }, 1200);
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue:#1560e8; --blue2:#0d4bc4; --blue3:#0a3ca0;
          --blue-light:#e8f0fe; --blue-xlight:#f4f7fe;
          --teal:#00bfa5; --teal-light:#e0f7f4;
          --orange:#ff6b35; --red:#ef4444;
          --gold:#f59e0b; --text:#0f1c2e; --sub:#5a6a80;
          --border:#dde6f5; --bg:#f4f7fe; --white:#fff;
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); background: var(--bg); overflow-x: hidden; }

        /* SEARCH BANNER */
        .search-banner {
          background: linear-gradient(135deg, #0a2d78 0%, var(--blue) 50%, #1a8fd1 100%);
          padding: 48px 60px; position: relative; overflow: hidden;
        }
        .search-banner::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 30%, transparent 100%);
        }
        .sb-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,.08); pointer-events: none; }
        .sb-ring.r1 { width: 500px; height: 500px; top: -200px; right: -100px; }
        .sb-ring.r2 { width: 320px; height: 320px; top: -100px; right: 0; }
        @keyframes twinkle { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
        .sb-cross { position: absolute; color: rgba(255,255,255,.15); font-size: 20px; animation: twinkle 3s ease-in-out infinite; }
        .sb-cross.c1 { top: 20%; left: 5%; }
        .sb-cross.c2 { bottom: 20%; left: 15%; animation-delay: 1s; }
        .sb-title { font-family: 'Fraunces', serif; font-size: 32px; color: white; font-weight: 700; margin-bottom: 6px; position: relative; z-index: 1; }
        .sb-sub { font-size: 14px; color: rgba(255,255,255,.7); margin-bottom: 28px; position: relative; z-index: 1; }
        .search-box {
          display: flex; align-items: center;
          background: white; border-radius: 14px; overflow: hidden; max-width: 780px;
          box-shadow: 0 12px 40px rgba(0,0,0,.18); position: relative; z-index: 1;
        }
        .sb-field {
          flex: 1; display: flex; align-items: center; gap: 10px;
          padding: 14px 20px; border-right: 1px solid var(--border); color: var(--blue);
        }
        .sb-field:last-of-type { border-right: none; }
        .sb-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: var(--sub); display: block; margin-bottom: 2px; }
        .sb-field input, .sb-field select {
          border: none; outline: none; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; color: var(--text); background: transparent; width: 100%;
        }
        .sb-search-btn {
          padding: 14px 28px; border: none;
          background: linear-gradient(135deg, var(--blue), var(--blue2));
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all .2s; white-space: nowrap;
        }
        .sb-search-btn:hover { background: linear-gradient(135deg, var(--blue2), var(--blue3)); }

        /* BREADCRUMB */
        .breadcrumb {
          background: white; border-bottom: 1px solid var(--border);
          padding: 12px 60px; display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--sub);
        }
        .breadcrumb a { color: var(--blue); text-decoration: none; font-weight: 500; }
        .breadcrumb .sep { color: #c8d5e8; }

        /* MAIN LAYOUT */
        .main-layout { display: flex; min-height: calc(100vh - 200px); }

        /* CONTENT AREA */
        .content-area { flex: 1; padding: 24px 60px; min-width: 0; }
        .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .results-count { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; }
        .results-count span { color: var(--blue); }
        .results-sub { font-size: 13px; color: var(--sub); margin-top: 2px; }
        .results-actions { display: flex; align-items: center; gap: 10px; }
        .view-toggle { display: flex; background: white; border: 1.5px solid var(--border); border-radius: 9px; overflow: hidden; }
        .vt-btn { padding: 8px 12px; border: none; background: transparent; cursor: pointer; color: var(--sub); transition: all .2s; display: flex; align-items: center; }
        .vt-btn svg { width: 16px; height: 16px; }
        .vt-btn.active { background: var(--blue-light); color: var(--blue); }

        /* ACTIVE FILTER TAGS */
        .active-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .af-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--blue-light); color: var(--blue); padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .af-tag button { background: none; border: none; cursor: pointer; color: var(--blue); font-size: 14px; opacity: .7; }
        .af-tag button:hover { opacity: 1; }

        /* DOC CARDS */
        @keyframes fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; margin-bottom: 32px; }
        .doc-card {
          background: white; border: 1.5px solid var(--border); border-radius: 18px;
          overflow: hidden; transition: all .25s; cursor: pointer;
          animation: fadein .35s ease both;
        }
        .doc-card:hover { box-shadow: 0 12px 40px rgba(21,96,232,.13); transform: translateY(-4px); border-color: rgba(21,96,232,.2); }
        .doc-photo-wrap { position: relative; height: 200px; overflow: hidden; background: linear-gradient(160deg,#c8d9f8,#a0bef5); }
        .doc-photo { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; transition: transform .4s; }
        .doc-card:hover .doc-photo { transform: scale(1.05); }
        .doc-photo-ph { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
        .doc-avail-pill { position: absolute; top: 12px; left: 12px; border-radius: 100px; padding: 4px 10px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 5px; backdrop-filter: blur(8px); }
        .doc-avail-pill.available { background: rgba(0,191,165,.9); color: white; }
        .doc-avail-pill.unavailable { background: rgba(239,68,68,.9); color: white; }
        .doc-avail-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: .8; }
        .doc-rating-pill { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,.93); backdrop-filter: blur(8px); border-radius: 100px; padding: 4px 10px; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--text); }
        .star { color: var(--gold); font-size: 12px; }
        .doc-body { padding: 16px 18px; }
        .doc-spec-tag { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
        .doc-name { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; line-height: 1.2; }
        .doc-meta { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
        .doc-meta-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--sub); }
        .doc-meta-row svg { stroke: var(--blue); }
        .doc-fee-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-top: 10px; border-top: 1px solid var(--border); }
        .doc-fee-label { font-size: 11px; color: var(--sub); font-weight: 500; }
        .doc-fee-val { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; color: var(--blue); }
        .doc-card-btns { display: flex; gap: 8px; }
        .btn-fee { flex: 1; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 9px; background: white; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; }
        .btn-fee:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-light); }
        .btn-book { flex: 1.4; padding: 9px 12px; border: none; border-radius: 9px; background: linear-gradient(135deg, var(--blue), var(--blue2)); color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 12px rgba(21,96,232,.25); transition: all .2s; }
        .btn-book:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(21,96,232,.35); }
        .btn-book:disabled { background: #c8d5e8; box-shadow: none; cursor: not-allowed; }

        /* LOAD MORE */
        .load-more-wrap { text-align: center; padding: 8px 0 32px; }
        .btn-load-more { padding: 14px 40px; border: 2px solid var(--blue); border-radius: 12px; background: white; color: var(--blue); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .2s; }
        .btn-load-more:hover { background: var(--blue); color: white; box-shadow: 0 6px 20px rgba(21,96,232,.25); }
        .btn-load-more span { color: var(--sub); font-size: 13px; font-weight: 400; margin-left: 4px; }

        /* MODAL */
        .modal-ov { position: fixed; inset: 0; background: rgba(12,22,41,.52); z-index: 500; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .modal-ov.open { display: flex; }
        @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .modal { background: white; border-radius: 20px; padding: 36px; width: 100%; max-width: 480px; box-shadow: 0 24px 64px rgba(12,22,41,.2); animation: modalIn .3s ease both; position: relative; }
        .modal-x { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border: 1.5px solid var(--border); border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--sub); }
        .modal-x:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }
        .modal h3 { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700; margin-bottom: 5px; }
        .mf { margin-bottom: 14px; }
        .mf label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--sub); margin-bottom: 6px; }
        .mf input, .mf select, .mf textarea { width: 100%; padding: 11px 13px; border: 1.5px solid var(--border); border-radius: 9px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: var(--text); background: var(--bg); outline: none; transition: border .2s; appearance: none; }
        .mf input:focus, .mf select:focus, .mf textarea:focus { border-color: var(--blue); background: var(--blue-xlight); }
        .mr { display: flex; gap: 11px; }
        .mr .mf { flex: 1; }
        .modal-btn { width: 100%; padding: 13px; border: none; border-radius: 11px; background: linear-gradient(135deg, var(--blue), var(--blue2)); color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 5px 18px rgba(21,96,232,.28); transition: transform .15s; }
        .modal-btn:hover { transform: translateY(-2px); }
        .modal-ok { margin-top: 11px; padding: 11px; border-radius: 9px; text-align: center; font-size: 13px; font-weight: 600; background: var(--teal-light); border: 1.5px solid #86efdb; color: #007a64; }

        @media(max-width:1024px){
          .search-banner,.breadcrumb{padding-left:24px;padding-right:24px;}
          .sidebar{width:240px;}
          .doctors-grid{grid-template-columns:repeat(2,1fr);}
        }
        @media(max-width:768px){
          .search-banner{padding:32px 16px;}
          .search-box{flex-direction:column;}
          .sb-field{border-right:none;border-bottom:1px solid var(--border);}
          .main-layout{flex-direction:column;}
          .sidebar{width:100%;height:auto;position:static;border-right:none;border-bottom:1px solid var(--border);}
          .content-area{padding:16px;}
          .doctors-grid{grid-template-columns:1fr;}
        }
      `}</style>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Navbar activePage="Doctors" />

      {/* SEARCH BANNER */}
      <div className="search-banner">
        <div className="sb-ring r1" /><div className="sb-ring r2" />
        <span className="sb-cross c1">✚</span><span className="sb-cross c2">✚</span>
        <div className="sb-title">Search for Doctors, Hospitals &amp; Clinics</div>
        <div className="sb-sub">Book appointments with {loading ? '...' : (doctors.length + loadCount)}+ verified specialists across the country</div>
        <div className="search-box">
          <div className="sb-field" style={{ flex: 2 }}>
            <SearchIcon />
            <div style={{ flex: 1 }}>
              <span className="sb-label">Doctor / Specialty</span>
              <input 
                type="text" 
                placeholder="Search doctors, specialties, clinics…" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="sb-field">
            <PinIcon size={18} />
            <div style={{ flex: 1 }}>
              <span className="sb-label">Location</span>
              <input type="text" placeholder="City or State" />
            </div>
          </div>
          <div className="sb-field">
            <CalIcon />
            <div style={{ flex: 1 }}>
              <span className="sb-label">Date</span>
              <input type="date" />
            </div>
          </div>
          <button className="sb-search-btn" onClick={fetchDoctors}>
            <SearchIcon size={17} />Search
          </button>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to={FRONTEND_ROUTES.HOME}>Home</Link><span className="sep">›</span>
        <span>Doctors</span><span className="sep">›</span>
        <span>All Specialists</span>
      </div>

      {/* MAIN LAYOUT */}
      <div className="main-layout">

        {/* CONTENT */}
        <div className="content-area">
          <div className="results-header">
            <div>
              <div className="results-count">Showing <span>{loading ? '...' : doctors.length}</span> Doctors For You</div>
              <div className="results-sub">Based on your filters and location</div>
            </div>
            <div className="results-actions">
              <div className="view-toggle">
                <button className={`vt-btn${gridView ? " active" : ""}`} onClick={() => setGridView(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button className={`vt-btn${!gridView ? " active" : ""}`} onClick={() => setGridView(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div style={{ width: 40, height: 40, border: '4px solid #1560e833', borderTop: '4px solid #1560e8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
            </div>
          ) : doctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--sub)' }}>
              <SearchIcon size={48} />
              <p style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>No doctors found matching your criteria.</p>
            </div>
          ) : (
            <div className="doctors-grid">
              {doctors.map(doc => (
                <DoctorCard key={doc.id} doc={doc} onBook={(id, name) => setBookDoc({ id, name })} />
              ))}
            </div>
          )}

          {loadCount > 0 && (
            <div className="load-more-wrap">
              <button className="btn-load-more" onClick={loadMore}>
                {fetchingMore ? "Loading…" : <>Load More <span>{loadCount} Doctors</span></>}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* BOOK MODAL */}
      {bookDoc && <BookModal doctorId={bookDoc.id} docName={bookDoc.name} onClose={() => setBookDoc(null)} />}
    </>
  );
}
