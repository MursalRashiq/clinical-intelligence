import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentDoctor, logoutDoctor } from "../../redux/doctor/doctorSlice";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import DoctorSidebar from "../../components/Doctor/SideBar";
import TopNav from "../../components/Doctor/TopNav";
import { doctorService } from "../../services/DoctorService";
import { toast } from "sonner";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const GRADIENT = "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)";
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface TimeSlot { customId: string; startTime: string; endTime: string; enabled: boolean; booked: boolean; startDate?: string; endDate?: string; }
interface DaySchedule { day: string; enabled: boolean; slots: TimeSlot[]; }
interface BlockedDate { _id?: string; date: string; reason: string | null; slots: string[]; }
interface Schedule {
  id: string; weeklySchedule: DaySchedule[]; blockedDates: BlockedDate[];
  specificDateSlots?: { date: string; slots: TimeSlot[] }[];
  startDate?: string; endDate?: string;
  defaultSlotDuration: number; bufferTime: number; maxPatientsPerSlot: number; isActive: boolean;
}
interface AvailableSlot { date: string; startTime: string; endTime: string; isAvailable: boolean; bookedCount: number; maxPatients: number; slotId?: string; }

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
      <select value={String(hour12).padStart(2, "0")} onChange={(e) => handleHour(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", outline: "none", background: "white", cursor: "pointer" }}>
        {Array.from({length: 12}, (_, i) => String(i+1).padStart(2,"0")).map(hr => <option key={hr} value={hr}>{hr}</option>)}
      </select>
      <span style={{ display: "flex", alignItems: "center", fontWeight: 700, color: "#424655" }}>:</span>
      <select value={minute} onChange={(e) => handleMinute(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", outline: "none", background: "white", cursor: "pointer" }}>
        {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(min => <option key={min} value={min}>{min}</option>)}
      </select>
      <select value={ampm} onChange={(e) => handleAmpm(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", outline: "none", background: "white", cursor: "pointer" }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

// ─── Mini Calendar Component ─────────────────────────────────────────────────
function MiniCalendar({
  value, onChange, minDate, maxDate, highlightedDates = [], blockedDates = []
}: {
  value?: string; onChange: (d: string) => void; minDate?: string; maxDate?: string;
  highlightedDates?: string[]; blockedDates?: string[];
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState(() => {
    const d = value ? new Date(value) : today;
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const fmt = (y: number, m: number, d: number) =>
    `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const prev = () => setView(v => v.month === 0 ? {year:v.year-1, month:11} : {year:v.year, month:v.month-1});
  const next = () => setView(v => v.month === 11 ? {year:v.year+1, month:0} : {year:v.year, month:v.month+1});

  return (
    <div style={{background:"white", borderRadius:16, border:"1.5px solid #e8edf8", overflow:"hidden", userSelect:"none"}}>
      {/* Header */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:GRADIENT}}>
        <button onClick={prev} style={{background:"rgba(255,255,255,.2)", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <span style={{fontFamily:"Material Symbols Outlined", fontSize:18, lineHeight:1}}>chevron_left</span>
        </button>
        <span style={{color:"white", fontFamily:"Manrope, sans-serif", fontWeight:700, fontSize:"0.9rem"}}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button onClick={next} style={{background:"rgba(255,255,255,.2)", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", color:"white", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <span style={{fontFamily:"Material Symbols Outlined", fontSize:18, lineHeight:1}}>chevron_right</span>
        </button>
      </div>
      {/* Day headers */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:"10px 8px 4px"}}>
        {SHORT_DAYS.map(d => (
          <div key={d} style={{textAlign:"center", fontSize:"0.65rem", fontWeight:700, color:"#9ca3af", padding:"2px 0"}}>{d}</div>
        ))}
      </div>
      {/* Days */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, padding:"0 8px 10px"}}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = fmt(view.year, view.month, day);
          const dateObj = new Date(ds); dateObj.setHours(0,0,0,0);
          const isSelected = value === ds;
          const isToday = dateObj.getTime() === today.getTime();
          const isMin = minDate ? ds < minDate : false;
          const isMax = maxDate ? ds > maxDate : false;
          const isDisabled = isMin || isMax;
          const isHighlighted = highlightedDates.includes(ds);
          const isBlocked = blockedDates.includes(ds);
          return (
            <button key={i} onClick={() => !isDisabled && onChange(ds)} disabled={isDisabled}
              style={{
                border:"none", borderRadius:8, padding:"6px 2px", fontSize:"0.78rem", fontWeight:isSelected||isToday ? 700 : 500,
                cursor: isDisabled ? "not-allowed" : "pointer",
                background: isSelected ? "#1560e8" : isBlocked ? "#fee2e2" : isHighlighted ? "#e8f0fe" : "transparent",
                color: isSelected ? "white" : isBlocked ? "#dc2626" : isDisabled ? "#d1d5db" : isToday ? "#1560e8" : "#191b23",
                outline: isToday && !isSelected ? "2px solid #1560e8" : "none",
                outlineOffset: -2,
                transition: "all .15s",
                position: "relative"
              }}>
              {day}
              {isBlocked && !isSelected && <span style={{position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"#dc2626", display:"block"}} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Date Range Picker ────────────────────────────────────────────────────────
function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: {
  startDate: string; endDate: string; onStartChange: (d: string) => void; onEndChange: (d: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [activeField, setActiveField] = useState<"start"|"end"|null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setActiveField(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString(undefined, {month:"short", day:"numeric", year:"numeric"}) : "Select date";

  return (
    <div ref={ref} style={{position:"relative"}}>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        {/* Start */}
        <button onClick={() => setActiveField(activeField==="start" ? null : "start")}
          style={{flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:10, border:`1.5px solid ${activeField==="start" ? "#1560e8" : "#dde6f5"}`, background:"white", cursor:"pointer", transition:"all .15s"}}>
          <span style={{fontFamily:"Material Symbols Outlined", fontSize:16, color:"#1560e8", lineHeight:1}}>event</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:"0.6rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em"}}>Start</div>
            <div style={{fontSize:"0.8rem", color: startDate ? "#191b23" : "#9ca3af", fontWeight:600}}>{fmt(startDate)}</div>
          </div>
        </button>
        <span style={{fontFamily:"Material Symbols Outlined", fontSize:16, color:"#9ca3af", lineHeight:1}}>arrow_forward</span>
        {/* End */}
        <button onClick={() => setActiveField(activeField==="end" ? null : "end")}
          style={{flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:10, border:`1.5px solid ${activeField==="end" ? "#1560e8" : "#dde6f5"}`, background:"white", cursor:"pointer", transition:"all .15s"}}>
          <span style={{fontFamily:"Material Symbols Outlined", fontSize:16, color:"#1560e8", lineHeight:1}}>event</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:"0.6rem", color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em"}}>End</div>
            <div style={{fontSize:"0.8rem", color: endDate ? "#191b23" : "#9ca3af", fontWeight:600}}>{fmt(endDate)}</div>
          </div>
        </button>
      </div>

      {activeField && (
        <div style={{position:"absolute", top:"calc(100% + 8px)", [activeField==="start"?"left":"right"]:0, zIndex:300, boxShadow:"0 12px 40px rgba(0,0,0,.15)", borderRadius:16, overflow:"hidden", width:260}}>
          <MiniCalendar
            value={activeField==="start" ? startDate : endDate}
            onChange={d => { if(activeField==="start"){onStartChange(d); if(endDate && d>endDate) onEndChange(""); } else { onEndChange(d); } setActiveField(null); }}
            minDate={activeField==="end" ? (startDate||today) : today}
            maxDate={activeField==="start" && endDate ? endDate : undefined}
          />
        </div>
      )}
    </div>
  );
}

// ─── Google Calendar Sync Banner ──────────────────────────────────────────────
function GoogleCalendarBanner({ onSync, onImport }: { onSync: () => void; onImport: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (dismissed) return null;

  const handleConnect = () => {
    // Trigger Google OAuth flow
    toast.info("Redirecting to Google sign-in…");
    setConnected(true);
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSyncing(false);
    toast.success("Schedule synced to Google Calendar");
    onSync();
  };

  return (
    <div style={{background:"white", borderRadius:16, border:"1.5px solid #e0e7ff", padding:"18px 24px", marginBottom:24, display:"flex", alignItems:"center", gap:16, boxShadow:"0 2px 12px rgba(21,96,232,.06)"}}>
      {/* Google icon */}
      <div style={{width:44, height:44, borderRadius:12, background:"#f8faff", border:"1px solid #e0e7ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
      <div style={{flex:1}}>
        <p style={{fontFamily:"Manrope, sans-serif", fontWeight:800, fontSize:"0.95rem", color:"#191b23", marginBottom:2}}>
          {connected ? "Google Calendar Connected" : "Sync with Google Calendar"}
        </p>
        <p style={{fontSize:"0.78rem", color:"#5a6a80", lineHeight:1.4}}>
          {connected
            ? "Your schedule is linked. Push availability blocks or import busy times."
            : "Connect your Google Calendar to auto-block busy times and publish your availability."}
        </p>
      </div>
      <div style={{display:"flex", gap:8, flexShrink:0}}>
        {connected ? (
          <>
            <button onClick={onImport}
              style={{padding:"8px 16px", borderRadius:8, border:"1.5px solid #dde6f5", background:"white", color:"#424655", fontSize:"0.78rem", fontWeight:700, cursor:"pointer"}}>
              Import Busy Times
            </button>
            <button onClick={handleSync} disabled={syncing}
              style={{padding:"8px 16px", borderRadius:8, border:"none", background:GRADIENT, color:"white", fontSize:"0.78rem", fontWeight:700, cursor:syncing?"not-allowed":"pointer", opacity:syncing?0.75:1, display:"flex", alignItems:"center", gap:6}}>
              <span style={{fontFamily:"Material Symbols Outlined", fontSize:14, lineHeight:1, display:"inline-block", animation:syncing?"spin 1s linear infinite":"none"}}>sync</span>
              {syncing ? "Syncing…" : "Push to Calendar"}
            </button>
          </>
        ) : (
          <button onClick={handleConnect}
            style={{padding:"8px 18px", borderRadius:8, border:"none", background:GRADIENT, color:"white", fontSize:"0.78rem", fontWeight:700, cursor:"pointer"}}>
            Connect
          </button>
        )}
      </div>
      <button onClick={() => setDismissed(true)} style={{background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:4, flexShrink:0}}>
        <span style={{fontFamily:"Material Symbols Outlined", fontSize:18, lineHeight:1}}>close</span>
      </button>
    </div>
  );
}

// ─── Full-page Calendar View ──────────────────────────────────────────────────
function CalendarView({ schedule, onDateClick }: { schedule: Schedule; onDateClick: (d: string) => void }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const blockedSet = new Set((schedule?.blockedDates || []).map(b => b.date.split("T")[0]));

  const getDayName = (y: number, m: number, d: number) => {
    const names = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return names[new Date(y, m, d).getDay()];
  };

  const getSlotsForDay = (y: number, m: number, d: number) => {
    const dateObj = new Date(y, m, d);
    dateObj.setHours(0,0,0,0);
    const dayName = getDayName(y, m, d);
    const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    
    if (blockedSet.has(dateStr)) return [];

    let slots: TimeSlot[] = [];

    // 1. Check Weekly Schedule within its date range
    let checkWeekly = true;
    if (schedule?.startDate) {
      const start = new Date(schedule.startDate);
      start.setHours(0,0,0,0);
      if (dateObj < start) checkWeekly = false;
    }
    if (schedule?.endDate) {
      const end = new Date(schedule.endDate);
      end.setHours(0,0,0,0);
      if (dateObj > end) checkWeekly = false;
    }

    if (checkWeekly) {
      const daySchedule = schedule?.weeklySchedule.find(ds => ds.day === dayName);
      if (daySchedule?.enabled) {
        // Filter individual slots based on their own date range
        const validSlots = daySchedule.slots.filter(slot => {
          if (slot.startDate) {
            const s = new Date(slot.startDate);
            s.setHours(0,0,0,0);
            if (dateObj < s) return false;
          }
          if (slot.endDate) {
            const e = new Date(slot.endDate);
            e.setHours(0,0,0,0);
            if (dateObj > e) return false;
          }
          return true;
        });
        slots = [...validSlots];
      }
    }

    // 2. Add Specific Date Slots
    const specificEntries = schedule?.specificDateSlots?.find(s => s.date.split("T")[0] === dateStr);
    if (specificEntries) {
      slots = [...slots, ...specificEntries.slots];
    }

    return slots;
  };

  const fmt = (y: number, m: number, d: number) =>
    `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const prev = () => setView(v => v.month===0 ? {year:v.year-1,month:11} : {year:v.year,month:v.month-1});
  const next = () => setView(v => v.month===11 ? {year:v.year+1,month:0} : {year:v.year,month:v.month+1});

  return (
    <div style={{animation:"fadeIn .3s ease"}}>
      {/* Calendar header */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <button onClick={prev} style={{width:36, height:36, borderRadius:10, border:"1.5px solid #dde6f5", background:"white", cursor:"pointer", display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"Material Symbols Outlined", fontSize:20, lineHeight:1, color:"#424655"}}>chevron_left</span>
          </button>
          <h2 style={{fontFamily:"Manrope, sans-serif", fontWeight:800, fontSize:"1.3rem", color:"#191b23", minWidth:200, textAlign:"center"}}>
            {MONTHS[view.month]} {view.year}
          </h2>
          <button onClick={next} style={{width:36, height:36, borderRadius:10, border:"1.5px solid #dde6f5", background:"white", cursor:"pointer", display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"Material Symbols Outlined", fontSize:20, lineHeight:1, color:"#424655"}}>chevron_right</span>
          </button>
          <button onClick={() => setView({year:today.getFullYear(), month:today.getMonth()})}
            style={{padding:"6px 14px", borderRadius:8, border:"1.5px solid #dde6f5", background:"white", fontSize:"0.78rem", fontWeight:700, color:"#424655", cursor:"pointer"}}>Today</button>
        </div>
        {/* Legend */}
        <div style={{display:"flex", gap:16, alignItems:"center"}}>
          {[{color:"#eef1fd", label:"Available"},{color:"#fee2e2", label:"Blocked"},{color:"#fff7ed", label:"Booked"}].map(({color,label})=>(
            <div key={label} style={{display:"flex", alignItems:"center", gap:6}}>
              <div style={{width:12, height:12, borderRadius:3, background:color, border:"1px solid rgba(0,0,0,.1)"}}/>
              <span style={{fontSize:"0.72rem", color:"#5a6a80", fontWeight:600}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:"white", borderRadius:20, border:"1.5px solid #f0f0f8", boxShadow:"0 2px 8px rgba(0,0,0,.04)", overflow:"hidden"}}>
        {/* Day headers */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:"1.5px solid #f0f0f8"}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} style={{padding:"12px 8px", textAlign:"center", fontSize:"0.72rem", fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em"}}>{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)"}}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} style={{minHeight:100, borderRight:"1px solid #f8f8fc", borderBottom:"1px solid #f8f8fc", background:"#fafbff"}} />;
            const ds = fmt(view.year, view.month, day);
            const dateObj = new Date(ds); dateObj.setHours(0,0,0,0);
            const isToday = dateObj.getTime() === today.getTime();
            const isBlocked = blockedSet.has(ds);
            const slots = getSlotsForDay(view.year, view.month, day);
            const bookedCount = slots.filter(s=>s.booked).length;
            const isPast = dateObj < today;

            return (
              <div key={i} onClick={() => !isPast && onDateClick(ds)}
                style={{
                  minHeight:100, borderRight:"1px solid #f8f8fc", borderBottom:"1px solid #f8f8fc",
                  background: isBlocked ? "#fff5f5" : slots.length>0 ? "#f7f9ff" : "white",
                  padding:"8px 10px", cursor:isPast?"default":"pointer", opacity:isPast?0.45:1,
                  transition:"background .15s",
                  position:"relative"
                }}
                onMouseEnter={e => { if(!isPast) e.currentTarget.style.background = isBlocked?"#fee2e2":"#eef1fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isBlocked?"#fff5f5":slots.length>0?"#f7f9ff":"white"; }}>
                {/* Day number */}
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6}}>
                  <span style={{
                    width:26, height:26, borderRadius:999, display:"flex", alignItems:"center", justifyContent:"center",
                    background: isToday ? "#1560e8" : "transparent",
                    color: isToday ? "white" : "#191b23",
                    fontFamily:"Manrope, sans-serif", fontWeight:isToday?800:600, fontSize:"0.85rem"
                  }}>{day}</span>
                  {isBlocked && <span style={{fontSize:"0.6rem", fontWeight:700, color:"#dc2626", background:"#fee2e2", padding:"1px 6px", borderRadius:999}}>BLOCKED</span>}
                  {!isBlocked && bookedCount>0 && <span style={{fontSize:"0.6rem", fontWeight:700, color:"#b45309", background:"#fff7ed", padding:"1px 6px", borderRadius:999}}>{bookedCount} booked</span>}
                </div>
                {/* Slots preview */}
                {!isBlocked && slots.slice(0,3).map((slot,si) => (
                  <div key={si} style={{fontSize:"0.65rem", fontWeight:600, padding:"2px 6px", borderRadius:4, marginBottom:2,
                    background:slot.booked?"#fff7ed":"#eef1fd", color:slot.booked?"#b45309":"#1560e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                    {slot.startTime}–{slot.endTime}
                  </div>
                ))}
                {!isBlocked && slots.length>3 && (
                  <div style={{fontSize:"0.65rem", color:"#9ca3af", fontWeight:600}}>+{slots.length-3} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eef1fd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <span style={{fontFamily:"Material Symbols Outlined", fontSize: 36, color: "#1560e8", lineHeight:1}}>schedule</span>
      </div>
      <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#191b23", marginBottom: 8 }}>No Schedule Yet</h3>
      <p style={{ color: "#424655", fontSize: "0.9rem", marginBottom: 28 }}>You haven't set up your availability schedule yet.</p>
      <button onClick={onAdd} style={{ background: GRADIENT, color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
        Add Slots
      </button>
    </div>
  );
}

// ─── Add Slot Modal ───────────────────────────────────────────────────────────
function AddSlotModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [skipOverlapping] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPermanent, setIsPermanent] = useState(true);
  const [mode, setMode] = useState<"recurring" | "specific">("recurring");
  const [specificDate, setSpecificDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const handleSubmit = async () => {
    if (!startTime || !endTime) { toast.error("Please provide start and end times"); return; }
    if (startTime >= endTime) { toast.error("Start time must be before end time"); return; }
    if (mode === "recurring" && selectedDays.length === 0) { toast.error("Please select at least one day"); return; }
    if (mode === "recurring" && !isPermanent && startDate && endDate && startDate > endDate) { toast.error("Start date must be before end date"); return; }

    setSaving(true);
    try {
      if (mode === "recurring") {
        const result = await doctorService.createSchedule({
          startTime, endTime, days: selectedDays, skipOverlappingDays: skipOverlapping,
          startDate: !isPermanent && startDate ? startDate : undefined,
          endDate: !isPermanent && endDate ? endDate : undefined
        });
        if (result?.data?.success || result?.success) {
          toast.success("Slots added successfully");
          onSuccess(); onClose();
        } else { toast.error(result?.message || "Failed to add slots"); }
      } else {
        const result = await doctorService.addSpecificDateSlots({
          date: specificDate, startTime, endTime
        });
        if (result?.data?.success || result?.success) {
          toast.success("Slot added for specific date");
          onSuccess(); onClose();
        } else { toast.error(result?.message || "Failed to add slot"); }
      }
    } catch (error: any) { toast.error(error?.message || "Failed to add slots"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 580, boxShadow: "0 24px 60px rgba(0,0,0,.2)", maxHeight: "92vh", overflowY: "auto", display:"flex", flexDirection:"column" }}>
        {/* Modal Header */}
        <div style={{background:GRADIENT, padding:"24px 28px", borderRadius:"24px 24px 0 0"}}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "white", marginBottom:4 }}>Add Availability</h3>
              <p style={{color:"rgba(255,255,255,.7)", fontSize:"0.78rem"}}>Set your weekly or specific date availability</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", cursor: "pointer", color: "white", width:36, height:36, borderRadius:10, display:"flex",alignItems:"center",justifyContent:"center" }}>
              <span style={{fontFamily:"Material Symbols Outlined", fontSize:20, lineHeight:1}}>close</span>
            </button>
          </div>
        </div>

        <div style={{padding:"28px 28px 24px"}}>
          {/* Mode Selector */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: 4, background: "#f2f3fe", borderRadius: 12 }}>
            <button onClick={() => setMode("recurring")}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: mode === "recurring" ? "white" : "transparent", color: mode === "recurring" ? "#1560E8" : "#5a6a80", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", boxShadow: mode === "recurring" ? "0 2px 8px rgba(0,0,0,0.05)" : "none", transition: "all .2s" }}>
              Weekly Recurring
            </button>
            <button onClick={() => setMode("specific")}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: mode === "specific" ? "white" : "transparent", color: mode === "specific" ? "#1560E8" : "#5a6a80", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", boxShadow: mode === "specific" ? "0 2px 8px rgba(0,0,0,0.05)" : "none", transition: "all .2s" }}>
              Specific Date
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {([{ label: "Start Time", value: startTime, set: setStartTime }, { label: "End Time", value: endTime, set: setEndTime }] as const).map(({ label, value, set }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</label>
                <CustomTimePicker value={value} onChange={set} />
              </div>
            ))}
          </div>

          {mode === "recurring" ? (
            <>
              {/* Days */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Repeat on Days</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {DAYS_OF_WEEK.map(day => (
                    <button key={day} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                      style={{ padding: "7px 16px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", border: "1.5px solid",
                        borderColor: selectedDays.includes(day) ? "#1560e8" : "#dde6f5",
                        background: selectedDays.includes(day) ? "#eef1fd" : "white",
                        color: selectedDays.includes(day) ? "#1560e8" : "#424655", transition: "all .15s" }}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration type */}
              <div style={{marginBottom:20}}>
                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Schedule Duration</label>
                <div style={{display:"flex", gap:10}}>
                  {[{val:true, label:"Permanent", icon:"all_inclusive"}, {val:false, label:"Date Range", icon:"date_range"}].map(({val,label,icon})=>(
                    <button key={label} onClick={()=>setIsPermanent(val)}
                      style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 16px", borderRadius:10, border:`1.5px solid ${isPermanent===val?"#1560e8":"#dde6f5"}`,
                        background:isPermanent===val?"#eef1fd":"white", color:isPermanent===val?"#1560e8":"#424655", fontWeight:700, fontSize:"0.82rem", cursor:"pointer", transition:"all .15s"}}>
                      <span style={{fontFamily:"Material Symbols Outlined", fontSize:16, lineHeight:1}}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {!isPermanent && (
                <div style={{ marginBottom: 20, animation:"fadeIn .3s ease" }}>
                  <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
                </div>
              )}
            </>
          ) : (
            <div style={{ marginBottom: 24, animation: "fadeIn .3s ease" }}>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Target Date</label>
              <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #dde6f5", fontSize: "0.95rem", outline: "none", fontFamily: "Inter, sans-serif" }} />
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
            <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e7e7f3", color: "#424655", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              style={{ padding: "10px 28px", borderRadius: 10, border: "none", background: GRADIENT, color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.75 : 1 }}>
              {saving ? "Adding…" : "Add Slots"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageSlots() {
  const [activeNav, setActiveNav] = useState("Available Timings");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("Calendar");
  const TABS = ["Calendar", "Weekly Schedule", "Exceptions", "Daily Overview", "Settings"];

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const currentDoctor = useSelector(selectCurrentDoctor);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const doctorName = (currentDoctor?.role === 'doctor' && currentDoctor?.name) ? `Dr. ${currentDoctor.name}` : "Doctor";
  const specialty = (currentDoctor?.role === 'doctor' && (currentDoctor as any)?.specialty) || "Specialist";

  const fetchSchedule = async () => {
    setLoading(true);
    try { const result = await doctorService.getSchedule(); setSchedule(result?.data ?? null); }
    catch { setSchedule(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchedule(); }, []);

  useEffect(() => {
    if (activeTab === "Daily Overview" && schedule?.id) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const docId = (schedule as any).doctorId || currentDoctor?.id;
          if (docId) { const result = await doctorService.getAvailableSlots(docId, selectedDate); setAvailableSlots(result?.data || []); }
        } catch { setAvailableSlots([]); }
        finally { setLoadingSlots(false); }
      };
      fetchSlots();
    }
  }, [activeTab, selectedDate, schedule, currentDoctor?.id]);

  const handleDeleteSlot = async (day: string, slotId: string) => {
    setDeletingSlot(slotId);
    try { await doctorService.deleteRecurringSlot(day, slotId); toast.success("Slot removed successfully"); fetchSchedule(); }
    catch { toast.error("Failed to remove slot"); }
    finally { setDeletingSlot(null); }
  };

  const handleLogout = async () => {
    try { await AuthService.logout("doctor"); dispatch(logoutDoctor()); navigate(FRONTEND_ROUTES.DOCTOR_LOGIN); }
    catch { toast.error("Logout failed"); }
  };

  const handleCalendarDateClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab("Daily Overview");
  };

  const activeDays = schedule?.weeklySchedule.filter(d => d.enabled && d.slots.length > 0) ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div style={{ fontFamily: "Inter, sans-serif", background: "#faf8ff", minHeight: "100vh", color: "#191b23" }}>
        <DoctorSidebar doctorName={doctorName} specialty={specialty} activeNav={activeNav} onNavChange={setActiveNav} onLogout={handleLogout} />
        <TopNav />

        <main style={{ marginLeft: 256, paddingTop: 64, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 36px", animation: "fadeIn .3s ease" }}>

            {/* Page Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: "Manrope, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#191b23", marginBottom: 6 }}>Manage Availability</h1>
                <p style={{ color: "#424655" }}>Configure your weekly recurring schedule, exceptions, and settings.</p>
              </div>
              {(activeTab === "Weekly Schedule" || activeTab === "Calendar") && (
                <button onClick={() => setShowAddModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: GRADIENT, color: "white", border: "none", padding: "12px 22px", borderRadius: 12, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(21,96,232,.3)", transition: "transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(21,96,232,.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(21,96,232,.3)"; }}>
                  <span style={{fontFamily:"Material Symbols Outlined", fontSize:"1.1rem", lineHeight:1}}>add</span>
                  Add Recurring Slot
                </button>
              )}
            </div>

            {/* Google Calendar Banner */}
            <GoogleCalendarBanner
              onSync={() => toast.success("Synced!")}
              onImport={() => toast.info("Importing busy times from Google Calendar…")}
            />

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: "1.5px solid #dde6f5", marginBottom: 32 }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? "#eef1fd" : "none",
                    border: "none", padding: "8px 18px 10px", cursor: "pointer", borderRadius:"10px 10px 0 0",
                    fontSize: "0.88rem", fontWeight: activeTab === tab ? 700 : 600,
                    color: activeTab === tab ? "#1560e8" : "#5a6a80",
                    borderBottom: `2px solid ${activeTab === tab ? "#1560e8" : "transparent"}`,
                    transition: "all .2s", display:"flex", alignItems:"center", gap:6
                  }}>
                  <span style={{fontFamily:"Material Symbols Outlined", fontSize:16, lineHeight:1}}>
                    {tab==="Calendar"?"calendar_month":tab==="Weekly Schedule"?"view_week":tab==="Exceptions"?"event_busy":tab==="Daily Overview"?"today":"settings"}
                  </span>
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
                <div style={{ width: 36, height: 36, border: "3px solid #e0e7ff", borderTopColor: "#1560e8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              </div>
            ) : !schedule && activeTab !== "Settings" ? (
              <EmptyState onAdd={() => setShowAddModal(true)} />
            ) : (
              <>
                {activeTab === "Calendar" && schedule && (
                  <CalendarView schedule={schedule} onDateClick={handleCalendarDateClick} />
                )}
                {activeTab === "Weekly Schedule" && schedule && (
                  <WeeklyScheduleTab schedule={schedule} activeDays={activeDays} deletingSlot={deletingSlot} onDeleteSlot={handleDeleteSlot} />
                )}
                {activeTab === "Exceptions" && schedule && (
                  <ExceptionsTab schedule={schedule} onUpdate={fetchSchedule} />
                )}
                {activeTab === "Daily Overview" && schedule && (
                  <DailyOverviewTab selectedDate={selectedDate} setSelectedDate={setSelectedDate} availableSlots={availableSlots} loadingSlots={loadingSlots} schedule={schedule} />
                )}
                {activeTab === "Settings" && (
                  <SettingsTab schedule={schedule} onUpdate={fetchSchedule} />
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {showAddModal && <AddSlotModal onClose={() => setShowAddModal(false)} onSuccess={fetchSchedule} />}
    </>
  );
}

// ─── Weekly Schedule Tab ──────────────────────────────────────────────────────
function WeeklyScheduleTab({ schedule, activeDays, deletingSlot, onDeleteSlot }: any) {
  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ background: "#fff8e1", borderLeft: "4px solid #f59e0b", padding: "14px 20px", borderRadius: "0 8px 8px 0", marginBottom: 28, fontSize: "0.95rem", color: "#b45309", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{fontFamily:"Material Symbols Outlined", fontSize:"1.4rem", lineHeight:1}}>info</span>
        <span style={{ lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 800 }}>Weekly Recurring Schedule:</strong> These timings repeat every week automatically. Set once — done!
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        {[
          { icon: "calendar_today", label: "Active Days", value: activeDays.length, color: "#1560e8", bg: "#eef1fd" },
          { icon: "schedule", label: "Total Slots", value: schedule.weeklySchedule.reduce((a: number, d: DaySchedule) => a + d.slots.length, 0), color: "#0a7c44", bg: "#e8f7ee" },
          { icon: "event_busy", label: "Booked Slots", value: schedule.weeklySchedule.reduce((a: number, d: DaySchedule) => a + d.slots.filter((s: TimeSlot) => s.booked).length, 0), color: "#b45309", bg: "#fef3e2" },
        ].map(({ icon, label, value, color, bg }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "20px 24px", border: "1.5px solid #f0f0f8", boxShadow: "0 1px 4px rgba(0,0,0,.05)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{fontFamily:"Material Symbols Outlined", color, fontSize: "1.4rem", lineHeight:1}}>{icon}</span>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "#424655", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</p>
              <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#191b23", lineHeight: 1 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 20, border: "1.5px solid #f0f0f8", boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0f0f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1rem", color: "#191b23" }}>Weekly Schedule</h2>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, background: schedule.isActive ? "#e8f7ee" : "#f5e5e5", color: schedule.isActive ? "#0a7c44" : "#ba1a1a" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display:"inline-block" }} />
            {schedule.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div>
          {activeDays.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#5a6a80" }}>No slots configured yet.</div>
          ) : (
            DAYS_OF_WEEK.map(dayName => {
              const dayData = schedule.weeklySchedule.find((d: DaySchedule) => d.day === dayName);
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
                    ) : dayData.slots.map((slot: TimeSlot) => (
                      <div key={slot.customId} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1.5px solid", borderColor: slot.booked ? "#fed7aa" : "#dde6f5", background: slot.booked ? "#fff7ed" : "#f5f7ff" }}>
                        <span style={{fontFamily:"Material Symbols Outlined", fontSize: "0.9rem", color: slot.booked ? "#b45309" : "#1560e8", lineHeight:1}}>{slot.booked ? "event_busy" : "schedule"}</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: slot.booked ? "#b45309" : "#334e99" }}>{slot.startTime} – {slot.endTime}</span>
                        {slot.booked && <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#b45309", background: "#fed7aa", padding: "1px 6px", borderRadius: 999 }}>BOOKED</span>}
                        {!slot.booked && (
                          <button onClick={() => onDeleteSlot(dayName, slot.customId)} disabled={deletingSlot === slot.customId}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}>
                            {deletingSlot === slot.customId
                              ? <span style={{ width: 12, height: 12, border: "2px solid #e0e7ff", borderTopColor: "#1560e8", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                              : <span style={{fontFamily:"Material Symbols Outlined", fontSize: "1rem", lineHeight:1}}>close</span>}
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
    </div>
  );
}

// ─── Exceptions Tab ───────────────────────────────────────────────────────────
function ExceptionsTab({ schedule, onUpdate }: { schedule: Schedule; onUpdate: () => void }) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return toast.error("Please select a date to block.");
    setLoading(true);
    try {
      const res = await doctorService.blockDate({ date, reason });
      if (res.success || res.data?.success) { toast.success("Date blocked successfully"); setDate(""); setReason(""); onUpdate(); }
      else { toast.error(res.message || "Failed to block date"); }
    } catch (err: any) { toast.error(err?.message || "Error blocking date"); }
    finally { setLoading(false); }
  };

  const handleUnblock = async (dateToUnblock: string) => {
    try {
      const res = await doctorService.unblockDate(dateToUnblock);
      if (res.success || res.data?.success) { toast.success("Date unblocked"); onUpdate(); }
      else { toast.error(res.message || "Failed to unblock date"); }
    } catch (err: any) { toast.error(err?.message || "Error unblocking date"); }
  };

  const blockedDates = (schedule?.blockedDates || []).map(b => b.date.split("T")[0]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
        {/* Block Date Form */}
        <div style={{ background: "white", borderRadius: 20, padding: 28, border: "1.5px solid #f0f0f8", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#191b23", marginBottom: 8 }}>Block a Date</h3>
          <p style={{ fontSize: "0.82rem", color: "#5a6a80", marginBottom: 20, lineHeight: 1.5 }}>
            Mark a day as unavailable. This overrides your weekly schedule.
          </p>

          {/* Calendar picker */}
          <div style={{marginBottom:16}}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#424655", marginBottom: 8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Select Date</label>
            <button onClick={() => setShowPicker(!showPicker)}
              style={{width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:`1.5px solid ${showPicker?"#1560e8":"#dde6f5"}`, background:"white", cursor:"pointer", transition:"all .15s"}}>
              <span style={{fontFamily:"Material Symbols Outlined", fontSize:18, color:"#1560e8", lineHeight:1}}>calendar_month</span>
              <span style={{fontSize:"0.88rem", color:date?"#191b23":"#9ca3af", fontWeight:600}}>
                {date ? new Date(date).toLocaleDateString(undefined, {weekday:"short", month:"long", day:"numeric"}) : "Pick a date"}
              </span>
            </button>
            {showPicker && (
              <div style={{marginTop:8, borderRadius:16, overflow:"hidden", boxShadow:"0 8px 30px rgba(0,0,0,.12)"}}>
                <MiniCalendar
                  value={date} minDate={today} blockedDates={blockedDates}
                  onChange={d => { setDate(d); setShowPicker(false); }}
                />
              </div>
            )}
          </div>

          <form onSubmit={handleBlock}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#424655", marginBottom: 6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Reason (Optional)</label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Vacation, Conference"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", fontFamily: "inherit", outline:"none" }} />
            </div>
            <button type="submit" disabled={loading || !date}
              style={{ width: "100%", background: "#ef4444", color: "white", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: (loading||!date) ? "not-allowed" : "pointer", opacity: (loading||!date) ? 0.6 : 1 }}>
              {loading ? "Blocking…" : "Block Entire Date"}
            </button>
          </form>
        </div>

        {/* Blocked Dates List */}
        <div style={{ background: "white", borderRadius: 20, border: "1.5px solid #f0f0f8", boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" }}>
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0f0f8", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#191b23" }}>Blocked Dates</h3>
            {schedule.blockedDates.length > 0 && (
              <span style={{fontSize:"0.72rem", fontWeight:700, color:"#dc2626", background:"#fee2e2", padding:"4px 10px", borderRadius:999}}>{schedule.blockedDates.length} blocked</span>
            )}
          </div>
          <div style={{ padding: "12px 28px" }}>
            {(!schedule.blockedDates || schedule.blockedDates.length === 0) ? (
              <div style={{textAlign:"center", padding:"40px 0"}}>
                <span style={{fontFamily:"Material Symbols Outlined", fontSize:40, color:"#d1d5db", lineHeight:1, display:"block", marginBottom:8}}>event_available</span>
                <p style={{ color: "#9ca3af", fontSize: "0.88rem" }}>No blocked dates.</p>
              </div>
            ) : (
              schedule.blockedDates.map(bd => (
                <div key={bd.date} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f0f0f8" }}>
                  <div style={{display:"flex", gap:12, alignItems:"center"}}>
                    <div style={{width:40, height:40, borderRadius:10, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                      <span style={{fontFamily:"Material Symbols Outlined", fontSize:18, color:"#dc2626", lineHeight:1}}>event_busy</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#191b23", fontSize: "0.9rem" }}>
                        {new Date(bd.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {bd.reason && <p style={{ fontSize: "0.75rem", color: "#5a6a80", marginTop: 2 }}>{bd.reason}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleUnblock(bd.date)}
                    style={{ background: "#e8f7ee", color: "#0a7c44", border: "none", padding: "7px 14px", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Daily Overview Tab ───────────────────────────────────────────────────────
function DailyOverviewTab({ selectedDate, setSelectedDate, availableSlots, loadingSlots, schedule }: any) {
  const blockedDates = (schedule?.blockedDates || []).map((b: BlockedDate) => b.date.split("T")[0]);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* Mini calendar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <MiniCalendar value={selectedDate} onChange={setSelectedDate} minDate={today} blockedDates={blockedDates} />
          <div style={{marginTop:12, background:"white", borderRadius:12, padding:"14px 16px", border:"1.5px solid #f0f0f8"}}>
            <p style={{fontSize:"0.7rem", fontWeight:700, color:"#424655", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10}}>Legend</p>
            {[{color:"#eef1fd", border:"#c7d7f8", label:"Available"},{color:"#fff7ed", border:"#fed7aa", label:"Booked"},{color:"#fee2e2", border:"#fca5a5", label:"Blocked"}].map(({color,border,label})=>(
              <div key={label} style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                <div style={{width:14, height:14, borderRadius:4, background:color, border:`1.5px solid ${border}`}}/>
                <span style={{fontSize:"0.78rem", color:"#5a6a80", fontWeight:600}}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slots View */}
        <div style={{ flex: 1, background: "white", borderRadius: 20, border: "1.5px solid #f0f0f8", boxShadow: "0 2px 8px rgba(0,0,0,.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f8", background: "#f8faff", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#191b23" }}>
                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year:'numeric' })}
              </h3>
              {!loadingSlots && <p style={{fontSize:"0.75rem", color:"#5a6a80", marginTop:2}}>{availableSlots.length} slot{availableSlots.length!==1?"s":""} found</p>}
            </div>
            {blockedDates.includes(selectedDate) && (
              <span style={{display:"flex", alignItems:"center", gap:6, fontSize:"0.78rem", fontWeight:700, color:"#dc2626", background:"#fee2e2", padding:"6px 12px", borderRadius:8}}>
                <span style={{fontFamily:"Material Symbols Outlined", fontSize:14, lineHeight:1}}>event_busy</span>
                Blocked
              </span>
            )}
          </div>
          <div style={{ padding: 24 }}>
            {loadingSlots ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{width:32, height:32, border:"3px solid #e0e7ff", borderTopColor:"#1560e8", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto"}}/>
              </div>
            ) : availableSlots.length === 0 ? (
              <div style={{ textAlign: "center", color: "#5a6a80", padding: "40px 0" }}>
                <span style={{fontFamily:"Material Symbols Outlined", fontSize: 48, color: "#d1d5db", display:"block", marginBottom: 12, lineHeight:1}}>event_busy</span>
                <p style={{fontWeight:600}}>No slots available on this date.</p>
                <p style={{fontSize:"0.8rem", marginTop:4}}>This may be a blocked date or unscheduled day.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {availableSlots.map((slot: AvailableSlot, i: number) => (
                  <div key={i} style={{ padding: "14px 16px", borderRadius: 12, border: "1.5px solid", borderColor: slot.isAvailable ? "#dde6f5" : "#fed7aa", background: slot.isAvailable ? "white" : "#fff7ed" }}>
                    <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:6}}>
                      <span style={{fontFamily:"Material Symbols Outlined", fontSize:14, color:slot.isAvailable?"#1560e8":"#b45309", lineHeight:1}}>{slot.isAvailable?"schedule":"event_busy"}</span>
                      <p style={{ fontWeight: 700, color: slot.isAvailable ? "#191b23" : "#b45309", fontSize: "0.9rem" }}>{slot.startTime} – {slot.endTime}</p>
                    </div>
                    <p style={{ fontSize: "0.7rem", fontWeight:700, color: slot.isAvailable?"#0a7c44":"#b45309", background:slot.isAvailable?"#e8f7ee":"#fff7ed", display:"inline-block", padding:"2px 8px", borderRadius:999 }}>
                      {slot.isAvailable ? "Available" : `Booked (${slot.bookedCount}/${slot.maxPatients})`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ schedule, onUpdate }: { schedule: Schedule | null; onUpdate: () => void }) {
  const [duration, setDuration] = useState(schedule?.defaultSlotDuration || 30);
  const [buffer, setBuffer] = useState(schedule?.bufferTime || 0);
  const [patients, setPatients] = useState(schedule?.maxPatientsPerSlot || 1);
  const [isActive, setIsActive] = useState(schedule?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await doctorService.updateSchedule({ defaultSlotDuration: duration, bufferTime: buffer, maxPatientsPerSlot: patients, isActive });
      if (res.success || res.data?.success) { toast.success("Schedule settings updated"); onUpdate(); }
      else { toast.error(res.message || "Failed to update settings"); }
    } catch (err: any) { toast.error(err?.message || "Error updating settings"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete your schedule? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await doctorService.deleteSchedule();
      if (res.success || res.data?.success) { toast.success("Schedule deleted successfully"); onUpdate(); }
      else { toast.error(res.message || "Failed to delete schedule"); }
    } catch (err: any) { toast.error(err?.message || "Error deleting schedule"); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ animation: "fadeIn .3s ease", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 32, border: "1.5px solid #f0f0f8", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
        <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#191b23", marginBottom: 24 }}>Global Settings</h3>
        <form onSubmit={handleUpdate}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {[
              {label:"Slot Duration (minutes)", val:duration, set:setDuration, min:15, max:120},
              {label:"Buffer Time (minutes)", val:buffer, set:setBuffer, min:0, max:60},
              {label:"Max Patients per Slot", val:patients, set:setPatients, min:1, max:10},
            ].map(({label,val,set,min,max}) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#424655", marginBottom: 8, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
                <input type="number" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} required
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #dde6f5", fontSize: "0.95rem", color: "#191b23", fontFamily: "inherit", outline:"none" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "16px", background: "#f8faff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
            <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#1560e8", cursor: "pointer" }} />
            <label htmlFor="isActive" style={{ fontSize: "0.95rem", fontWeight: 600, color: "#191b23", cursor: "pointer" }}>Schedule is Active</label>
          </div>
          <button type="submit" disabled={saving}
            style={{ background: GRADIENT, color: "white", border: "none", padding: "12px 32px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </form>
      </div>

      <div style={{ background: "#fff5f5", borderRadius: 20, padding: 32, border: "1.5px solid #fecaca" }}>
        <h3 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#991b1b", marginBottom: 12 }}>Danger Zone</h3>
        <p style={{ fontSize: "0.85rem", color: "#7f1d1d", marginBottom: 24, lineHeight: 1.6 }}>
          Deleting your schedule removes all recurring slots, exceptions, and settings permanently. Booked appointments will remain, but no new ones can be made.
        </p>
        <button onClick={handleDelete} disabled={deleting}
          style={{ width: "100%", background: "#ef4444", color: "white", border: "none", padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}>
          {deleting ? "Deleting…" : "Delete Entire Schedule"}
        </button>
      </div>
    </div>
  );
}