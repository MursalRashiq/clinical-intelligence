import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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

const OTP_LENGTH = 6;
const TIMER_SECONDS = 59;

// ─── Atoms ────────────────────────────────────────────────────────────────────

const HeartbeatIcon = ({ size = 18, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

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

const PageFooter = () => (
  <footer style={{ position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:`1px solid ${t.border}`, padding:"13px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, color:t.sub }}>
    <span>© 2025 Clinical Intelligence — All Rights Reserved</span>
    <span>
      <Link to="#" style={{ color:t.blue, textDecoration:"none", fontWeight:600 }}>Help</Link>
      {" · "}
      <Link to="#" style={{ color:t.blue, textDecoration:"none", fontWeight:600 }}>Privacy Policy</Link>
    </span>
  </footer>
);

// ─── Success Overlay ──────────────────────────────────────────────────────────

const SuccessOverlay = () => (
  <div style={{ position:"absolute", inset:0, background:"white", borderRadius:24, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:48, animation:"fadeInScale .4s ease both", zIndex:10 }}>
    <div style={{ width:84, height:84, borderRadius:"50%", background:`linear-gradient(135deg, ${t.teal}, #00a896)`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22, boxShadow:"0 8px 28px rgba(0,191,165,.3)", animation:"popIn .5s cubic-bezier(.34,1.56,.64,1) both .1s" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width={36} height={36}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <div style={{ fontFamily:"Fraunces, serif", fontSize:26, fontWeight:700, color:t.text, marginBottom:8 }}>Verified!</div>
    <div style={{ fontSize:14, color:t.sub, lineHeight:1.6, marginBottom:28, textAlign:"center" }}>
      Your identity has been verified. You can now set a new password.
    </div>
    <Link to={FRONTEND_ROUTES.FORGOT_PASSWORD_RESET} style={{ padding:"13px 32px", border:"none", borderRadius:12, background:`linear-gradient(135deg, ${t.blue}, ${t.blue2})`, color:"white", fontFamily:"inherit", fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:"0 5px 18px rgba(21,96,232,.28)" }}>
      Set New Password →
    </Link>
    <style>{`
      @keyframes fadeInScale { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
      @keyframes popIn       { from{transform:scale(0)}              to{transform:scale(1)}           }
    `}</style>
  </div>
);

// ─── Single OTP Box ───────────────────────────────────────────────────────────

interface OtpBoxProps {
  value:     string;
  inputRef:  React.RefObject<HTMLInputElement | null>;
  onInput:   (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste:   (e: React.ClipboardEvent<HTMLInputElement>) => void;
  hasError:  boolean;
}

const OtpBox = ({ value, inputRef, onInput, onKeyDown, onPaste, hasError }: OtpBoxProps) => {
  const filled = value !== "";

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => onInput(e.target.value.replace(/\D/g, ""))}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      style={{
        width:       56,
        height:      64,
        border:      `2px solid ${hasError ? "#ef4444" : filled ? t.blue : t.border}`,
        borderRadius: 14,
        background:  hasError ? "#fff0f0" : filled ? t.blueLight : t.bg,
        fontFamily:  "Fraunces, serif",
        fontSize:    28,
        fontWeight:  700,
        color:       hasError ? "#ef4444" : filled ? t.blue : t.text,
        textAlign:   "center",
        outline:     "none",
        transition:  "all .2s",
        caretColor:  t.blue,
        animation:   hasError ? "shake .35s ease" : "none",
        flexShrink:  0,
      }}
    />
  );
};

// ─── Timer / Resend Row ───────────────────────────────────────────────────────

interface TimerRowProps {
  seconds:   number;
  canResend: boolean;
  onResend:  () => void;
}

const TimerRow = ({ seconds, canResend, onResend }: TimerRowProps) => {
  if (canResend) {
    return (
      <div style={{ fontSize:13, color:t.sub, marginBottom:28, height:20, textAlign:"center" }}>
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={onResend}
          style={{ background:"none", border:"none", fontFamily:"inherit", fontSize:13, fontWeight:700, color:t.blue, cursor:"pointer", textDecoration:"underline" }}
        >
          Resend Code
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontSize:13, color:t.sub, marginBottom:28, height:20, textAlign:"center" }}>
      Resend code in{" "}
      <span style={{ fontWeight:700, color:t.blue }}>
        00:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

// ─── VerifyOtpPage ────────────────────────────────────────────────────────────

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  // Read email from session (set by EnterEmailPage)
  const email = sessionStorage.getItem("resetEmail") ?? "jane@example.com";

  const [digits,    setDigits]    = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [hasError,  setHasError]  = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [seconds,   setSeconds]   = useState(TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Refs for each input box
  const inputRefs = Array.from({ length: OTP_LENGTH }, () => useRef<HTMLInputElement | null>(null));

  // Auto-focus first box on mount
  useEffect(() => { inputRefs[0].current?.focus(); }, []);

  // Countdown timer
  useEffect(() => {
    if (canResend) return;
    if (seconds <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, canResend]);

  const isComplete = digits.every((d) => d !== "");

  // Handle single digit input
  const handleInput = useCallback((idx: number, val: string) => {
    if (!val) {
      setDigits((prev) => { const next = [...prev]; next[idx] = ""; return next; });
      return;
    }
    const digit = val.slice(-1); // take last char (handles Android quirk)
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    setHasError(false);
    // Advance focus
    if (idx < OTP_LENGTH - 1) inputRefs[idx + 1].current?.focus();
  }, []);

  // Backspace
  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[idx] && idx > 0) {
        setDigits((prev) => { const next = [...prev]; next[idx - 1] = ""; return next; });
        inputRefs[idx - 1].current?.focus();
      }
    },
    [digits],
  );

  // Paste full code
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs[focusIdx].current?.focus();
  }, [digits]);

  // Resend
  const handleResend = async () => {
    try {
      const res = await AuthService.resendOtp(email, "user");
      if (res?.success) {
        toast.success("Verification code resent!");
        setDigits(Array(OTP_LENGTH).fill(""));
        setHasError(false);
        setSeconds(TIMER_SECONDS);
        setCanResend(false);
        inputRefs[0].current?.focus();
      } else {
        toast.error(res?.message || "Failed to resend code.");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while resending the code.");
    }
  };

  // Verify
  const handleVerify = async () => {
    const code = digits.join("");
    try {
      const res = await AuthService.verifyForgotOtp(email, code, "user");
      if (res?.success) {
        // Save the resetToken to session storage for the next step
        const token = res.resetToken || res.data?.resetToken || "";
        sessionStorage.setItem("resetToken", token);
        
        setSuccess(true);
        setTimeout(() => {
          navigate(FRONTEND_ROUTES.FORGOT_PASSWORD_RESET);
        }, 3000);
      } else {
        setHasError(true);
        toast.error(res?.message || "Invalid verification code.");
        setTimeout(() => setHasError(false), 600);
      }
    } catch (error: any) {
      setHasError(true);
      toast.error(error?.message || "Verification failed.");
      setTimeout(() => setHasError(false), 600);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <Navbar />

      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"90px 24px 80px" }}>
        <div style={{ background:"white", border:`1.5px solid ${t.border}`, borderRadius:24, padding:"48px 44px", width:"100%", maxWidth:440, boxShadow:"0 8px 40px rgba(21,96,232,.08)", textAlign:"center", position:"relative", overflow:"hidden" }}>

          {/* Top accent */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg, ${t.blue}, ${t.teal})` }} />

          {/* Success overlay */}
          {success && <SuccessOverlay />}

          {/* Email icon */}
          <div style={{ width:76, height:76, borderRadius:"50%", background:t.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", animation:"pulseRing 3s ease-in-out infinite" }}>
            <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={t.blue} strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          {/* Heading */}
          <div style={{ fontFamily:"Fraunces, serif", fontSize:26, fontWeight:700, color:t.text, marginBottom:8 }}>
            Check Your <span style={{ color:t.blue }}>Email</span>
          </div>
          <div style={{ fontSize:14, color:t.sub, lineHeight:1.65, marginBottom:8 }}>
            We've sent a 6-digit verification code to
          </div>

          {/* Email badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:t.blueLight, borderRadius:100, padding:"5px 14px", fontSize:13, fontWeight:700, color:t.blue, marginBottom:32 }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={t.blue} strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            {email}
          </div>

          {/* OTP inputs */}
          <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:10 }}>
            {digits.map((digit, idx) => (
              <OtpBox
                key={idx}
                value={digit}
                inputRef={inputRefs[idx]}
                onInput={(val) => handleInput(idx, val)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                hasError={hasError}
              />
            ))}
          </div>

          {/* Error message */}
          {hasError && (
            <div style={{ fontSize:12, fontWeight:600, color:"#ef4444", marginBottom:8 }}>
              ✗ Invalid code. Please try again.
            </div>
          )}

          {/* Timer / Resend */}
          <TimerRow seconds={seconds} canResend={canResend} onResend={handleResend} />

          {/* Verify button */}
          <button
            type="button"
            disabled={!isComplete}
            onClick={handleVerify}
            style={{ width:"100%", padding:14, border:"none", borderRadius:12, background: isComplete ? `linear-gradient(135deg, ${t.blue}, ${t.blue2})` : "#c8d5e8", color:"white", fontFamily:"inherit", fontSize:15, fontWeight:700, cursor: isComplete ? "pointer" : "not-allowed", boxShadow: isComplete ? "0 5px 20px rgba(21,96,232,.28)" : "none", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:18, transition:"all .22s" }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Verify & Continue
          </button>

          {/* Change email */}
          <div style={{ fontSize:13, color:t.sub }}>
            Wrong email?{" "}
            <Link to={FRONTEND_ROUTES.FORGOT_PASSWORD_EMAIL} style={{ color:t.blue, fontWeight:700, textDecoration:"none", marginLeft:4 }}>
              Change email address
            </Link>
          </div>

          <style>{`
            @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(21,96,232,.12)} 50%{box-shadow:0 0 0 14px rgba(21,96,232,.04)} }
            @keyframes shake     { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
          `}</style>
        </div>
      </div>

      <PageFooter />
    </div>
  );
};

export default VerifyOtpPage;