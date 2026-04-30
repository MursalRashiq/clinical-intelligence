import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { FRONTEND_ROUTES } from "../../utils/constants";
import AuthService from "../../services/AuthService";

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
} as const;

// ─── Small atoms ─────────────────────────────────────────────────────────────

const HeartbeatIcon = ({ size = 18, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={t.sub} strokeWidth="2"
    style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", width:16, height:16, pointerEvents:"none" }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => (
  <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:10, background:"rgba(255,255,255,.95)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${t.border}`, height:66, padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
    <Link to={FRONTEND_ROUTES.HOME} style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
      <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${t.blue}, ${t.teal})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 10px rgba(21,96,232,.25)" }}>
        <HeartbeatIcon />
      </div>
      <span style={{ fontFamily:"Fraunces, serif", fontSize:20, fontWeight:700, color:t.text }}>
        Clinical <span style={{ color:t.blue }}>Intelligence</span>
      </span>
    </Link>
    <Link to={FRONTEND_ROUTES.LOGIN} style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:600, color:t.sub, textDecoration:"none" }}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
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

const ForgotEmailPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = email.includes("@") && email.includes(".");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || loading) return;
    
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(email, "user");
      if (res?.success) {
        toast.success("Verification code sent to your email!");
        sessionStorage.setItem("resetEmail", email);
        setTimeout(() => {
          navigate(FRONTEND_ROUTES.FORGOT_PASSWORD_OTP);
        }, 1500);
      } else {
        toast.error(res?.message || "Failed to send reset link.");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while sending the code.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width:        "100%",
    padding:      "13px 14px 13px 42px",
    border:       `1.5px solid ${t.border}`,
    borderRadius: 11,
    fontFamily:   "inherit",
    fontSize:     14,
    color:        t.text,
    background:   t.bg,
    outline:      "none",
    transition:   "all .2s",
  };

  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <Navbar />

      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"90px 24px 80px" }}>
        <div style={{ background:"white", border:`1.5px solid ${t.border}`, borderRadius:24, padding:"48px 44px", width:"100%", maxWidth:460, boxShadow:"0 8px 40px rgba(21,96,232,.08)", position:"relative", overflow:"hidden" }}>
          
          {/* Top accent bar */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg, ${t.blue}, ${t.teal})` }} />

          {/* Key icon */}
          <div style={{ width:72, height:72, borderRadius:"50%", background:t.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", animation:"pulseRing 3s ease-in-out infinite" }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={t.blue} strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>

          <div style={{ fontFamily:"Fraunces, serif", fontSize:26, fontWeight:700, color:t.text, textAlign:"center", marginBottom:8 }}>
            Forgot <span style={{ color:t.blue }}>Password?</span>
          </div>
          <div style={{ fontSize:14, color:t.sub, lineHeight:1.65, textAlign:"center", marginBottom:32 }}>
            No worries! Enter your email address and we'll send you a verification code to reset it.
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".9px", color:t.sub, marginBottom:7 }}>
                Email Address
              </label>
              <div style={{ position:"relative" }}>
                <MailIcon />
                <input
                  type="email"
                  value={email}
                  placeholder="e.g. jane@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValidEmail || loading}
              style={{ width:"100%", padding:14, border:"none", borderRadius:12, background: isValidEmail ? `linear-gradient(135deg, ${t.blue}, ${t.blue2})` : "#c8d5e8", color:"white", fontFamily:"inherit", fontSize:15, fontWeight:700, cursor: (isValidEmail && !loading) ? "pointer" : "not-allowed", opacity: loading ? 0.7 : 1, boxShadow: isValidEmail ? "0 5px 20px rgba(21,96,232,.28)" : "none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:16, transition:"all .22s" }}
            >
              {loading ? "Sending..." : "Send Reset Code"}
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>

            <div style={{ textAlign:"center", fontSize:13, color:t.sub }}>
              Remember your password?{" "}
              <Link to={FRONTEND_ROUTES.LOGIN} style={{ color:t.blue, fontWeight:700, textDecoration:"none" }}>
                Log in
              </Link>
            </div>
          </form>

          <style>{`@keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(21,96,232,.12)}50%{box-shadow:0 0 0 14px rgba(21,96,232,.04)}}`}</style>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotEmailPage;
