import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FRONTEND_ROUTES } from "../../utils/constants";
import AuthService from "../../services/AuthService";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 59;

export default function DoctorForgotVerifyOtp() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("doctorResetEmail") || "doctor@example.com";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [hasError, setHasError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [seconds, setSeconds] = useState(TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (canResend) return;
    if (seconds <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, canResend]);

  const isComplete = digits.every((d) => d !== "");

  const handleInput = useCallback((idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = clean;
      return next;
    });
    setHasError(false);
    if (clean && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      setDigits((prev) => {
        const next = [...prev];
        next[idx - 1] = "";
        return next;
      });
      inputRefs.current[idx - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }, [digits]);

  const handleResend = async () => {
    try {
      const res = await AuthService.resendOtp(email, "doctor");
      if (res?.success) {
        toast.success("Verification code resent!");
        setDigits(Array(OTP_LENGTH).fill(""));
        setHasError(false);
        setSeconds(TIMER_SECONDS);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(res?.message || "Failed to resend code.");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred.");
    }
  };

  const handleVerify = async () => {
    const code = digits.join("");
    try {
      const res = await AuthService.verifyForgotOtp(email, code, "doctor");
      if (res?.success) {
        const token = res.resetToken || res.data?.resetToken || "";
        sessionStorage.setItem("doctorResetToken", token);
        setSuccess(true);
        setTimeout(() => {
          navigate(FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD_RESET);
        }, 2000);
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
    <div style={{ minHeight: "100vh", background: "#faf8ff", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
      `}</style>

      <div style={{ background: "white", borderRadius: 20, padding: "48px 44px", width: "100%", maxWidth: 440, boxShadow: "0 12px 40px rgba(10,45,120,.09)", border: "1.5px solid #f0f0f8", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#0a2d78,#1560e8)" }} />

        {success && (
          <div style={{ position: "absolute", inset: 0, background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, zIndex: 10 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1560e8" strokeWidth="3" width={36} height={36}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "Manrope,sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "#191b23", marginBottom: 8 }}>Verified!</h3>
            <p style={{ fontSize: "0.875rem", color: "#424655", textAlign: "center" }}>Identity confirmed. Redirecting to reset password...</p>
          </div>
        )}

        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#1560e8" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h2 style={{ fontFamily: "Manrope,sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "#191b23", marginBottom: 8 }}>Verify <span>Email</span></h2>
        <p style={{ fontSize: "0.875rem", color: "#424655", marginBottom: 8 }}>Enter the 6-digit code sent to</p>
        <div style={{ display: "inline-block", background: "#e8f0fe", color: "#1560e8", padding: "4px 12px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 700, marginBottom: 32 }}>{email}</div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              style={{ width: 50, height: 60, border: `2px solid ${hasError ? "#ef4444" : digit ? "#1560e8" : "#dde6f5"}`, borderRadius: 12, background: hasError ? "#fff0f0" : digit ? "#f0f7ff" : "#f8fafc", fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 700, textAlign: "center", outline: "none", animation: hasError ? "shake .35s ease" : "none" }}
            />
          ))}
        </div>

        <div style={{ fontSize: "0.8rem", color: "#424655", marginBottom: 28 }}>
          {canResend ? (
            <button onClick={handleResend} style={{ background: "none", border: "none", color: "#1560e8", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>Resend Code</button>
          ) : (
            <>Resend in <span style={{ fontWeight: 700, color: "#1560e8" }}>00:{String(seconds).padStart(2, "0")}</span></>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={!isComplete}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: isComplete ? "linear-gradient(135deg,#0a2d78,#1560e8)" : "#c8d5e8", color: "white", fontWeight: 700, cursor: isComplete ? "pointer" : "not-allowed", transition: "all .2s" }}>
          Verify & Continue
        </button>
      </div>
    </div>
  );
}
