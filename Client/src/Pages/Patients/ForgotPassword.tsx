import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FRONTEND_ROUTES } from "../../utils/constants";
import AuthService from "../../services/AuthService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordForm {
  newPassword:     string;
  confirmPassword: string;
}

interface PasswordChecks {
  len:     boolean;
  upper:   boolean;
  num:     boolean;
  special: boolean;
}

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

// ─── Theme ────────────────────────────────────────────────────────────────────

const t = {
  blue:       "#1560e8",
  blue2:      "#0d4bc4",
  teal:       "#00bfa5",
  blueLight:  "#e8f0fe",
  blueXLight: "#f4f7fe",
  text:       "#0f1c2e",
  sub:        "#5a6a80",
  border:     "#dde6f5",
  bg:         "#f4f7fe",
  green:      "#16a34a",
  red:        "#ef4444",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getChecks(val: string): PasswordChecks {
  return {
    len:     val.length >= 8,
    upper:   /[A-Z]/.test(val),
    num:     /[0-9]/.test(val),
    special: /[^A-Za-z0-9]/.test(val),
  };
}

function getStrength(val: string): StrengthLevel {
  if (!val) return "empty";
  const score = Object.values(getChecks(val)).filter(Boolean).length;
  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score === 3) return "good";
  return "strong";
}

const STRENGTH_CONFIG: Record<
  StrengthLevel,
  { bars: number; color: string; label: string }
> = {
  empty:  { bars: 0, color: t.border,  label: "Enter a new password" },
  weak:   { bars: 1, color: "#ef4444", label: "Weak"     },
  fair:   { bars: 2, color: "#f59e0b", label: "Fair"     },
  good:   { bars: 3, color: "#3b82f6", label: "Good"     },
  strong: { bars: 4, color: "#16a34a", label: "Strong ✓" },
};

// ─── Eye-toggle icon SVG paths ────────────────────────────────────────────────

const EYE_OPEN  = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const EYE_CLOSE = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

// ─── Small atoms ─────────────────────────────────────────────────────────────

const HeartbeatIcon = ({ size = 18, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

/** Lock icon */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={t.sub} strokeWidth="2"
    style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", width:16, height:16, pointerEvents:"none" }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/** Shield icon */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={t.sub} strokeWidth="2"
    style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", width:16, height:16, pointerEvents:"none" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// ─── Eye Toggle Button ────────────────────────────────────────────────────────

interface EyeBtnProps {
  show: boolean;
  onToggle: () => void;
}

const EyeBtn = ({ show, onToggle }: EyeBtnProps) => (
  <button
    type="button"
    onClick={onToggle}
    style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:t.sub, display:"flex", padding:0 }}
  >
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      dangerouslySetInnerHTML={{ __html: show ? EYE_CLOSE : EYE_OPEN }}
    />
  </button>
);

// ─── Strength Bars ────────────────────────────────────────────────────────────

const StrengthMeter = ({ strength }: { strength: StrengthLevel }) => {
  const cfg = STRENGTH_CONFIG[strength];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display:"flex", gap:5, marginBottom:5 }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{ height:4, flex:1, borderRadius:100, background: i < cfg.bars ? cfg.color : t.border, transition:"background .35s" }} />
        ))}
      </div>
      <div style={{ fontSize:11, fontWeight:600, color: cfg.color }}>{cfg.label}</div>
    </div>
  );
};

// ─── Requirement Item ─────────────────────────────────────────────────────────

const ReqItem = ({ met, label }: { met: boolean; label: string }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color: met ? t.green : t.sub, transition:"color .2s" }}>
    <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${met ? t.green : t.border}`, background: met ? t.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s" }}>
      {met && (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width={9} height={9}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </div>
    {label}
  </div>
);

// ─── Success Overlay ──────────────────────────────────────────────────────────

const SuccessOverlay = () => (
  <div style={{ position:"absolute", inset:0, background:"white", borderRadius:24, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:48, textAlign:"center", animation:"fadeInScale .4s ease both", zIndex:10 }}>
    <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg, ${t.teal}, #00a896)`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22, boxShadow:"0 8px 28px rgba(0,191,165,.28)", animation:"popIn .5s cubic-bezier(.34,1.56,.64,1) both .1s" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width={34} height={34}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <div style={{ fontFamily:"Fraunces, serif", fontSize:24, fontWeight:700, color:t.text, marginBottom:8 }}>Password Reset!</div>
    <div style={{ fontSize:14, color:t.sub, lineHeight:1.6, marginBottom:28 }}>
      Your password has been updated successfully. Please sign in with your new password.
    </div>
    <Link
      to="/login"
      style={{ padding:"13px 32px", border:"none", borderRadius:12, background:`linear-gradient(135deg, ${t.blue}, ${t.blue2})`, color:"white", fontFamily:"inherit", fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:"0 5px 18px rgba(21,96,232,.28)" }}
    >
      Sign In Now →
    </Link>
    <style>{`
      @keyframes fadeInScale { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
      @keyframes popIn       { from{transform:scale(0)}              to{transform:scale(1)}           }
    `}</style>
  </div>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => (
  <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:10, background:"rgba(255,255,255,.95)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${t.border}`, height:66, padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
    <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
      <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${t.blue}, ${t.teal})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 10px rgba(21,96,232,.25)" }}>
        <HeartbeatIcon />
      </div>
      <span style={{ fontFamily:"Fraunces, serif", fontSize:20, fontWeight:700, color:t.text }}>
        Clinical <span style={{ color:t.blue }}>Intelligence</span>
      </span>
    </Link>
    <Link to="/login" style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:600, color:t.sub, textDecoration:"none" }}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      Back to Login
    </Link>
  </nav>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer style={{ position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:`1px solid ${t.border}`, padding:"13px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, color:t.sub }}>
    <span>© 2025 Clinical Intelligence — All Rights Reserved</span>
    <span>
      <a href="#" style={{ color:t.blue, textDecoration:"none", fontWeight:600 }}>Help</a>
      {" · "}
      <a href="#" style={{ color:t.blue, textDecoration:"none", fontWeight:600 }}>Privacy Policy</a>
    </span>
  </footer>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ForgotPasswordPage = () => {
  const [form,    setForm]    = useState<PasswordForm>({ newPassword:"", confirmPassword:"" });
  const [showNew, setShowNew] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const checks   = getChecks(form.newPassword);
  const strength = getStrength(form.newPassword);
  const allReqs  = Object.values(checks).every(Boolean);
  const matched  = form.newPassword === form.confirmPassword && form.confirmPassword !== "";
  const canSubmit = allReqs && matched;

  const confirmStatus: "idle" | "ok" | "err" =
    !form.confirmPassword ? "idle" : matched ? "ok" : "err";

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    const email = sessionStorage.getItem("resetEmail");
    const resetToken = sessionStorage.getItem("resetToken");

    if (!email || !resetToken) {
      toast.error("Session expired or invalid. Please try resetting your password again.");
      setTimeout(() => navigate(FRONTEND_ROUTES.FORGOT_PASSWORD), 2000);
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.resetPassword({
        email,
        resetToken,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmPassword
      }, "user");

      if (res?.success) {
        setSuccess(true);
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetToken");
        toast.success("Password reset successfully!");
        setTimeout(() => navigate(FRONTEND_ROUTES.LOGIN), 3000);
      } else {
        toast.error(res?.message || "Failed to reset password.");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while resetting password.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (valid?: boolean | null): React.CSSProperties => ({
    width:        "100%",
    padding:      "13px 44px 13px 42px",
    border:       `1.5px solid ${valid === true ? t.green : valid === false ? t.red : t.border}`,
    borderRadius: 11,
    fontFamily:   "inherit",
    fontSize:     14,
    color:        t.text,
    background:   valid === true ? "#f0fdf4" : valid === false ? "#fff0f0" : t.bg,
    outline:      "none",
    transition:   "all .2s",
  });

  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <Navbar />

      {/* Page */}
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"90px 24px 80px" }}>
        <div style={{ background:"white", border:`1.5px solid ${t.border}`, borderRadius:24, padding:"48px 44px", width:"100%", maxWidth:460, boxShadow:"0 8px 40px rgba(21,96,232,.08)", position:"relative", overflow:"hidden" }}>

          {/* Top accent bar */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg, ${t.blue}, ${t.teal})` }} />

          {/* Success overlay */}
          {success && <SuccessOverlay />}

          {/* Lock icon */}
          <div style={{ width:72, height:72, borderRadius:"50%", background:t.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", animation:"pulseRing 3s ease-in-out infinite" }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={t.blue} strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <div style={{ fontFamily:"Fraunces, serif", fontSize:26, fontWeight:700, color:t.text, textAlign:"center", marginBottom:8 }}>
            Set New <span style={{ color:t.blue }}>Password</span>
          </div>
          <div style={{ fontSize:14, color:t.sub, lineHeight:1.65, textAlign:"center", marginBottom:32 }}>
            Create a strong new password to keep your account secure.
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* New Password */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".9px", color:t.sub, marginBottom:7 }}>
                New Password
              </label>
              <div style={{ position:"relative" }}>
                <ShieldIcon />
                <input
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  placeholder="Create a strong new password"
                  onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                  style={inputStyle()}
                />
                <EyeBtn show={showNew} onToggle={() => setShowNew((v) => !v)} />
              </div>
              <StrengthMeter strength={strength} />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".9px", color:t.sub, marginBottom:7 }}>
                Confirm New Password
              </label>
              <div style={{ position:"relative" }}>
                <LockIcon />
                <input
                  type={showCfm ? "text" : "password"}
                  value={form.confirmPassword}
                  placeholder="Repeat your new password"
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  style={inputStyle(confirmStatus === "ok" ? true : confirmStatus === "err" ? false : null)}
                />
                <EyeBtn show={showCfm} onToggle={() => setShowCfm((v) => !v)} />
              </div>
              {confirmStatus === "ok"  && <div style={{ fontSize:12, fontWeight:600, marginTop:6, color:t.green }}>✓ Passwords match</div>}
              {confirmStatus === "err" && <div style={{ fontSize:12, fontWeight:600, marginTop:6, color:t.red  }}>✗ Passwords do not match</div>}
            </div>

            {/* Requirements checklist */}
            <div style={{ background:t.bg, border:`1.5px solid ${t.border}`, borderRadius:12, padding:"14px 16px", marginBottom:24, display:"flex", flexDirection:"column", gap:7 }}>
              <ReqItem met={checks.len}     label="At least 8 characters"            />
              <ReqItem met={checks.upper}   label="One uppercase letter"              />
              <ReqItem met={checks.num}     label="One number"                        />
              <ReqItem met={checks.special} label="One special character (!@#$…)"    />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{ width:"100%", padding:14, border:"none", borderRadius:12, background: canSubmit ? `linear-gradient(135deg, ${t.blue}, ${t.blue2})` : "#c8d5e8", color:"white", fontFamily:"inherit", fontSize:15, fontWeight:700, cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? "0 5px 20px rgba(21,96,232,.28)" : "none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:16, transition:"all .22s" }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Update Password
            </button>

            {/* Cancel */}
            <Link
              to="/login"
              style={{ width:"100%", padding:"13px", border:`1.5px solid ${t.border}`, borderRadius:12, background:"white", color:t.sub, fontFamily:"inherit", fontSize:14, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .2s" }}
            >
              Cancel
            </Link>

          </form>

          <style>{`@keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(21,96,232,.12)}50%{box-shadow:0 0 0 14px rgba(21,96,232,.04)}}`}</style>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;