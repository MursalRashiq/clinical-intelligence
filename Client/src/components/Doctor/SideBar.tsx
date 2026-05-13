import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FRONTEND_ROUTES } from "../../utils/constants";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  icon: string;
  label: string;
  fill?: boolean;
  route?: string;
}

interface DoctorSidebarProps {
  doctorName?: string;
  specialty?: string;
  activeNav?: string;
  onNavChange?: (label: string) => void;
  onLogout?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { icon: "dashboard",               label: "Dashboard",          fill: true, route: FRONTEND_ROUTES.DOCTOR_DASHBOARD },
  { icon: "pending_actions",         label: "Requests" },
  { icon: "calendar_today",          label: "Appointments" },
  { icon: "schedule",                label: "Available Timings",   route: FRONTEND_ROUTES.DOCTOR_SLOTS },
  { icon: "account_balance_wallet",  label: "Wallet" },
  { icon: "chat",                    label: "Message" },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { icon: "manage_accounts", label: "Profile Settings", route: FRONTEND_ROUTES.DOCTOR_PROFILE },
  { icon: "logout",          label: "Logout" },
];

const GRADIENT = "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)";

// ─── Component ────────────────────────────────────────────────────────────────
export default function DoctorSidebar({
  doctorName = "Doctor",
  specialty = "Clinical Specialist",
  activeNav: controlledActiveNav,
  onNavChange,
  onLogout,
}: DoctorSidebarProps) {
  const navigate = useNavigate();
  const [internalActive, setInternalActive] = useState("Dashboard");

  const activeNav = controlledActiveNav ?? internalActive;

  function handleNavClick(item: NavItem) {
    if (item.label === "Logout") {
      onLogout?.();
      return;
    }
    setInternalActive(item.label);
    onNavChange?.(item.label);
    if (item.route) {
      navigate(item.route);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        .ms { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; display: inline-block; line-height: 1; }
        .ms-fill { font-variation-settings: 'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>

      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: 256,
          background: "#f2f3fe",
          display: "flex",
          flexDirection: "column",
          padding: "2rem 0",
          gap: 4,
          zIndex: 40,
          overflowY: "auto",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Doctor Identity */}
        <div style={{ padding: "0 24px 40px", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 12, background: GRADIENT,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", boxShadow: "0 4px 14px rgba(21,96,232,.35)", flexShrink: 0,
            }}
          >
            <span className="ms">health_and_safety</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                fontFamily: "Manrope, sans-serif", fontWeight: 700, color: "#1560E8",
                lineHeight: 1.2, fontSize: "0.9rem",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {doctorName}
            </h2>
            <p style={{ fontSize: "0.6rem", color: "#424655", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginTop: 2 }}>
              {specialty}
            </p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeNav === item.label}
              fillWhenActive={item.fill}
              onClick={() => handleNavClick(item)}
            />
          ))}

          {/* Bottom nav items */}
          <div style={{ paddingTop: 40 }}>
            {BOTTOM_NAV_ITEMS.map((item) => (
              <NavButton
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.label}
                onClick={() => handleNavClick(item)}
                danger={item.label === "Logout"}
              />
            ))}
          </div>
        </nav>

        {/* New Appointment CTA */}
        <div style={{ padding: "0 16px", marginTop: "auto" }}>
          <button
            style={{
              width: "100%", background: GRADIENT, color: "white",
              padding: "12px 16px", borderRadius: 12, fontWeight: 700,
              fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em",
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 8px 24px rgba(21,96,232,.3)",
              transition: "transform .15s, box-shadow .15s", fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(0.98)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(21,96,232,.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(21,96,232,.3)"; }}
          >
            <span className="ms" style={{ fontSize: "1rem" }}>add</span>
            New Appointment
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── NavButton ────────────────────────────────────────────────────────────────
function NavButton({
  icon, label, active, fillWhenActive, onClick, danger,
}: {
  icon: string; label: string; active: boolean;
  fillWhenActive?: boolean; onClick: () => void; danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const color = danger ? "#ba1a1a" : active ? "#1560E8" : hovered ? "#1560E8" : "#424655";
  const bg = active
    ? "white"
    : hovered
    ? danger ? "rgba(186,26,26,.07)" : "rgba(255,255,255,.6)"
    : "transparent";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", marginBottom: 2, borderRadius: 10,
        background: bg, color, fontWeight: active ? 700 : 500,
        fontSize: "0.875rem", letterSpacing: "0.02em", border: "none",
        cursor: "pointer", textAlign: "left", fontFamily: "Inter, sans-serif",
        boxShadow: active ? "0 2px 8px rgba(21,96,232,.1)" : "none",
        transition: "all .18s ease",
        transform: hovered && !active ? "translateX(3px)" : "none",
      }}
    >
      <span className={`ms${fillWhenActive && active ? " ms-fill" : ""}`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
