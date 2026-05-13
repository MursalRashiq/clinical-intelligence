import { useState, useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthService from "../../services/AuthService";
import { setUser } from "../../redux/user/userSlice";
import { FRONTEND_ROUTES } from "../../utils/constants";

const OTP_LENGTH = 6;
const TIMER_DURATION = 59;
const TIMER_KEY = "otp_timer_expiry";

export default function VerifyOtp() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const email = location.state?.email || "jane@example.com";
  const role = location.state?.role || "patient";

  // Calculate remaining seconds from a persisted expiry timestamp
  const getRemaining = () => {
    const expiry = sessionStorage.getItem(TIMER_KEY);
    if (!expiry) return TIMER_DURATION;
    const remaining = Math.round((Number(expiry) - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [seconds, setSeconds] = useState<number>(() => {
    // Initialise from sessionStorage so refresh doesn't reset the timer
    const remaining = getRemaining();
    if (!sessionStorage.getItem(TIMER_KEY)) {
      // First visit — set expiry now
      sessionStorage.setItem(TIMER_KEY, String(Date.now() + TIMER_DURATION * 1000));
    }
    return remaining;
  });
  const [timerActive, setTimerActive] = useState(() => getRemaining() > 0);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!timerActive) return;
    if (seconds <= 0) {
      setTimerActive(false);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, seconds]);

  const resetTimer = async () => {
    try {
      const res = await AuthService.userResendOtp(email);
      if (res?.success) {
        // Update the persisted expiry to a fresh window
        sessionStorage.setItem(TIMER_KEY, String(Date.now() + TIMER_DURATION * 1000));
        setSeconds(TIMER_DURATION);
        setTimerActive(true);
        toast.success("New code sent!");
      } else {
        toast.error(res?.message || "Failed to resend code");
      }
    } catch (err) {
      toast.error("Failed to resend code");
    }
  };

  const isComplete = digits.every((d) => d !== "");

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    const next = [...digits];
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const verifyOtp = async () => {
    const code = digits.join("");
    setLoading(true);
    try {
      const res = await AuthService.userVerifyOtp({ email, otp: code, role: role as any });
      if (res?.success) {
        setSuccess(true);
        if (res.data?.user) {
          dispatch(setUser(res.data.user));
        }
        setTimeout(() => {
          navigate(FRONTEND_ROUTES.HOME);
        }, 3000);
      } else {
        setError(true);
        toast.error(res?.message || "Invalid verification code");
        setTimeout(() => setError(false), 600);
      }
    } catch (err: any) {
      setError(true);
      toast.error(err?.message || "Verification failed");
      setTimeout(() => setError(false), 600);
    } finally {
      setLoading(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #1560e8;
          --blue2: #0d4bc4;
          --teal: #00bfa5;
          --blue-light: #e8f0fe;
          --blue-xlight: #f4f7fe;
          --text: #0f1c2e;
          --sub: #5a6a80;
          --border: #dde6f5;
          --bg: #f4f7fe;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          background: var(--bg);
          min-height: 100vh;
        }

        .tc-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 10;
          background: rgba(255,255,255,.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          height: 66px; padding: 0 48px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .tc-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .tc-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--blue), var(--teal));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(21,96,232,.25);
        }
        .tc-logo-name {
          font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; color: var(--text);
        }
        .tc-logo-name span { color: var(--blue); }

        .tc-nav-back {
          display: flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 600; color: var(--sub);
          text-decoration: none; transition: color .2s; background: none; border: none; cursor: pointer;
        }
        .tc-nav-back:hover { color: var(--blue); }

        .tc-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 90px 24px 60px;
        }

        .tc-card {
          background: white; border: 1.5px solid var(--border);
          border-radius: 24px; padding: 48px 44px;
          width: 100%; max-width: 440px;
          box-shadow: 0 8px 40px rgba(21,96,232,.08);
          text-align: center; position: relative; overflow: hidden;
        }
        .tc-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--blue), var(--teal));
        }

        .tc-otp-icon {
          width: 76px; height: 76px; border-radius: 50%;
          background: var(--blue-light);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 22px;
          animation: pulse-ring 3s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(21,96,232,.12); }
          50% { box-shadow: 0 0 0 14px rgba(21,96,232,.04); }
        }

        .tc-otp-title {
          font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700;
          color: var(--text); margin-bottom: 8px;
        }
        .tc-otp-title span { color: var(--blue); }
        .tc-otp-sub { font-size: 14px; color: var(--sub); line-height: 1.65; margin-bottom: 8px; }

        .tc-otp-email {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--blue-light); border-radius: 100px;
          padding: 5px 14px; font-size: 13px; font-weight: 700; color: var(--blue);
          margin-bottom: 32px;
        }

        .tc-otp-inputs { display: flex; gap: 12px; justify-content: center; margin-bottom: 10px; }

        .tc-otp-box {
          width: 56px; height: 64px;
          border: 2px solid var(--border); border-radius: 14px;
          background: var(--bg);
          font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700;
          color: var(--text); text-align: center; outline: none;
          transition: all .2s; caret-color: var(--blue);
        }
        .tc-otp-box:focus { border-color: var(--blue); background: var(--blue-xlight); box-shadow: 0 0 0 4px rgba(21,96,232,.1); }
        .tc-otp-box.filled { border-color: var(--blue); background: var(--blue-light); color: var(--blue); }
        .tc-otp-box.error { border-color: #ef4444; background: #fff0f0; animation: shake .35s ease; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .tc-timer-row { font-size: 13px; color: var(--sub); margin-bottom: 28px; height: 20px; }
        .tc-timer-row span { font-weight: 700; color: var(--blue); }

        .tc-resend-btn {
          background: none; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 700; color: var(--blue);
          cursor: pointer; text-decoration: underline;
        }
        .tc-resend-btn:hover { color: var(--blue2); }

        .tc-btn-verify {
          width: 100%; padding: 14px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, var(--blue), var(--blue2));
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700; cursor: pointer;
          box-shadow: 0 5px 20px rgba(21,96,232,.28);
          transition: all .22s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 18px;
        }
        .tc-btn-verify:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(21,96,232,.36); }
        .tc-btn-verify:disabled { background: #c8d5e8; box-shadow: none; cursor: not-allowed; transform: none; }

        .tc-change-link { font-size: 13px; color: var(--sub); }
        .tc-change-link a { color: var(--blue); font-weight: 700; text-decoration: none; margin-left: 4px; }
        .tc-change-link a:hover { text-decoration: underline; }

        .tc-success-overlay {
          position: absolute; inset: 0; background: white; border-radius: 24px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 48px;
          animation: fadein .4s ease both;
        }
        @keyframes fadein {
          from { opacity: 0; transform: scale(.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .tc-success-circle {
          width: 84px; height: 84px; border-radius: 50%;
          background: linear-gradient(135deg, #00bfa5, #00a896);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          box-shadow: 0 8px 28px rgba(0,191,165,.3);
          animation: pop-in .5s cubic-bezier(.34,1.56,.64,1) both .1s;
        }
        @keyframes pop-in {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .tc-success-title { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .tc-success-sub { font-size: 14px; color: var(--sub); line-height: 1.6; margin-bottom: 28px; }

        .tc-btn-dashboard {
          padding: 13px 32px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, var(--blue), var(--blue2));
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none;
          box-shadow: 0 5px 18px rgba(21,96,232,.28); transition: all .2s;
          display: inline-block;
        }
        .tc-btn-dashboard:hover { transform: translateY(-2px); }

        footer {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: white; border-top: 1px solid var(--border);
          padding: 13px 48px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: var(--sub);
        }
        footer a { color: var(--blue); text-decoration: none; font-weight: 600; }
        footer a:hover { text-decoration: underline; }

        @media (max-width: 500px) {
          .tc-card { padding: 36px 24px; }
          .tc-otp-box { width: 46px; height: 56px; font-size: 22px; }
          .tc-nav, footer { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="tc-nav">
        <Link className="tc-logo" to="/">
          <div className="tc-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="tc-logo-name">Clinical <span>Intelligence</span></div>
        </Link>
        <Link className="tc-nav-back" to="/login">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Login
        </Link>
      </nav>

      {/* Page */}
      <div className="tc-page">
        <div className="tc-card">

          {/* Success overlay */}
          {success && (
            <div className="tc-success-overlay">
              <div className="tc-success-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="36" height="36">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="tc-success-title">Verified!</div>
              <div className="tc-success-sub">
                Your account has been successfully verified. Welcome to Clinical Intelligence.
              </div>
              <Link to="/dashboard" className="tc-btn-dashboard">Go to Dashboard →</Link>
            </div>
          )}

          {/* Icon */}
          <div className="tc-otp-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" width="34" height="34">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <div className="tc-otp-title">
            Check Your <span>Email</span>
          </div>
          <div className="tc-otp-sub">We've sent a 6-digit verification code to</div>
          <div className="tc-otp-email">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" width="13" height="13">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {email}
          </div>

          {/* OTP Inputs */}
          <div className="tc-otp-inputs">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                className={`tc-otp-box${digit ? " filled" : ""}${error ? " error" : ""}`}
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          {/* Timer / Resend */}
          <div className="tc-timer-row">
            {timerActive ? (
              <>Resend code in <span>00:{pad(seconds)}</span></>
            ) : (
              <button className="tc-resend-btn" onClick={resetTimer}>
                Resend Code
              </button>
            )}
          </div>

          {/* Verify button */}
          <button
            className="tc-btn-verify"
            disabled={!isComplete || loading}
            onClick={verifyOtp}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="16" height="16">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            )}
            {loading ? "Verifying..." : "Verify Account"}
          </button>

          <div className="tc-change-link">
            Wrong email?
            <Link to="/register">Change email address</Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer>
        <span>© 2025 Clinical Intelligence — All Rights Reserved</span>
        <span>
          <a href="#">Help</a>
          &nbsp;·&nbsp;
          <a href="#">Privacy Policy</a>
        </span>
      </footer>
    </>
  );
}
