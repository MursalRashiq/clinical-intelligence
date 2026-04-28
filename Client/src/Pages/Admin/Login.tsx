import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EyeOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

import { FRONTEND_ROUTES } from "../../utils/constants";

interface ToastState {
  message: string;
  isError: boolean;
  visible: boolean;
}

import { useDispatch } from "react-redux";
import { setAdmin } from "../../redux/admin/adminSlice";
import adminService from "../../services/AdminService";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: "", isError: false, visible: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please fill in all fields", true);
      return;
    }
    showToast("Signing in…");
    try {
      const res = await adminService.loginAdmin({ email, password });
      if (res?.success) {
        if (res.data?.user) {
          dispatch(setAdmin(res.data.user));
        }
        if (res.data?.token) {
          localStorage.setItem("adminToken", res.data.token);
        }
        showToast("Login successful!");
        setTimeout(() => {
          navigate(FRONTEND_ROUTES.ADMIN_DASHBOARD, { replace: true });
        }, 1000);
      } else {
        showToast(res?.message || "Login failed", true);
      }
    } catch (error: any) {
      showToast(error?.message || "An error occurred during login", true);
    }
  };

  const handleGoogle = () => {
    showToast("Redirecting to Google…");
    setTimeout(() => {
      navigate(FRONTEND_ROUTES.ADMIN_DASHBOARD);
    }, 1500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #1560e8;
          --blue2: #0d4bc4;
          --teal: #00bfa5;
          --blue-light: #e8f0fe;
          --blue-xlight: #f4f7fe;
          --text: #0f1c2e;
          --sub: #6b7280;
          --border: #e5e7eb;
          --bg: #f4f7fe;
        }

        html, body { height: 100%; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); background: var(--bg); }

        .tc-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 32px 24px;
          background: var(--bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
        }

        .tc-layout {
          display: flex; align-items: center; justify-content: center;
          gap: 72px; width: 100%; max-width: 860px;
        }

        .tc-illus { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }

        .tc-illus-circle {
          width: 270px; height: 270px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-light) 0%, #c8d9f8 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 12px 40px rgba(21,96,232,.15);
          position: relative; overflow: hidden;
        }
        .tc-illus-circle::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(21,96,232,.07) 1px, transparent 1px);
          background-size: 18px 18px;
        }
        .tc-illus-svg { position: relative; z-index: 1; }

        .tc-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .tc-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--blue), var(--teal));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(21,96,232,.3);
        }
        .tc-brand-name { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700; color: var(--text); }
        .tc-brand-name span { color: var(--blue); }
        .tc-brand-sub { font-size: 12px; color: var(--sub); margin-top: 6px; text-align: center; font-weight: 500; }

        .tc-form-card {
          width: 100%; max-width: 340px;
          background: white; border: 1.5px solid var(--border);
          border-radius: 16px; padding: 36px 32px;
          box-shadow: 0 6px 28px rgba(21,96,232,.08);
          position: relative; overflow: hidden;
        }
        .tc-form-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--blue), var(--teal));
        }

        .tc-form-title { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .tc-form-sub { font-size: 13px; color: var(--sub); margin-bottom: 24px; }

        .tc-field { margin-bottom: 14px; }
        .tc-field label { display: block; font-size: 12px; font-weight: 600; color: var(--sub); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .7px; }

        .tc-fw { position: relative; }
        .tc-fw-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; pointer-events: none; color: var(--sub); }
        .tc-fw input {
          width: 100%; padding: 11px 12px 11px 38px;
          border: 1.5px solid var(--border); border-radius: 9px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
          color: var(--text); background: var(--bg); outline: none;
          transition: all .2s;
        }
        .tc-fw input:focus { border-color: var(--blue); background: var(--blue-xlight); }
        .tc-fw input::placeholder { color: #c4c9d4; }

        .tc-eye-btn {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--sub);
          display: flex; padding: 0;
        }
        .tc-eye-btn:hover { color: var(--blue); }

        .tc-forgot-row { text-align: right; margin-bottom: 18px; margin-top: -6px; }
        .tc-forgot-row a { font-size: 12px; font-weight: 600; color: var(--blue); text-decoration: none; }
        .tc-forgot-row a:hover { text-decoration: underline; }

        .tc-btn-login {
          width: 100%; padding: 12px; border: none; border-radius: 10px;
          background: linear-gradient(135deg, var(--blue), var(--blue2));
          color: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 5px 18px rgba(21,96,232,.28);
          transition: all .2s; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .tc-btn-login:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,96,232,.36); }

        .tc-or-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .tc-or-line { flex: 1; height: 1px; background: var(--border); }
        .tc-or-text { font-size: 12px; color: var(--sub); }

        .tc-btn-google {
          width: 100%; padding: 11px 12px;
          border: 1.5px solid var(--border); border-radius: 10px;
          background: white; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 500; color: var(--text); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: all .2s; margin-bottom: 20px;
        }
        .tc-btn-google:hover { border-color: var(--blue); background: var(--blue-xlight); }

        .tc-bottom-row { text-align: center; font-size: 13px; color: var(--sub); }
        .tc-bottom-row a { color: var(--blue); font-weight: 700; text-decoration: none; margin-left: 4px; }
        .tc-bottom-row a:hover { text-decoration: underline; }

        .tc-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translateX(-50%) translateY(70px);
          background: #0f1c2e; color: white; border-radius: 10px;
          padding: 12px 22px; font-size: 13px; font-weight: 600;
          display: flex; align-items: center; gap: 9px;
          box-shadow: 0 6px 24px rgba(0,0,0,.18);
          transition: transform .4s cubic-bezier(.34,1.56,.64,1);
          z-index: 99; white-space: nowrap;
        }
        .tc-toast.show { transform: translateX(-50%) translateY(0); }

        .tc-toast-icon {
          width: 20px; height: 20px; border-radius: 50%;
          background: #16a34a;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .tc-toast-icon.err { background: #ef4444; }

        @media (max-width: 640px) {
          .tc-illus { display: none; }
          .tc-form-card { max-width: 100%; }
        }
      `}</style>

      <div className="tc-page">
        <div className="tc-layout">

          {/* Left Illustration */}
          <div className="tc-illus">
            <div className="tc-illus-circle">
              <svg className="tc-illus-svg" width="190" height="190" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="50" width="140" height="95" rx="10" fill="#1560e8" opacity=".12" />
                <rect x="36" y="56" width="128" height="83" rx="7" fill="white" stroke="#1560e8" strokeWidth="2" />
                <rect x="48" y="70" width="60" height="6" rx="3" fill="#1560e8" opacity=".25" />
                <rect x="48" y="82" width="80" height="4" rx="2" fill="#c8d9f8" />
                <rect x="48" y="92" width="70" height="4" rx="2" fill="#c8d9f8" />
                <rect x="48" y="102" width="50" height="4" rx="2" fill="#c8d9f8" />
                <rect x="120" y="110" width="10" height="18" rx="2" fill="#1560e8" opacity=".3" />
                <rect x="133" y="100" width="10" height="28" rx="2" fill="#1560e8" opacity=".5" />
                <rect x="146" y="92" width="10" height="36" rx="2" fill="#1560e8" opacity=".8" />
                <rect x="92" y="145" width="16" height="14" rx="2" fill="#c8d9f8" />
                <rect x="76" y="158" width="48" height="6" rx="3" fill="#a0bef5" />
                <path d="M80 75 L80 85 Q80 90 86 93 Q92 90 92 85 L92 75 L86 73 Z" fill="#1560e8" opacity=".7" />
                <polyline points="83,83 86,86 90,80" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="100" cy="30" r="14" fill="#a0bef5" />
                <path d="M78 58 Q78 44 100 44 Q122 44 122 58" fill="#1560e8" opacity=".2" />
                <circle cx="95" cy="28" r="2" fill="#1560e8" opacity=".5" />
                <circle cx="105" cy="28" r="2" fill="#1560e8" opacity=".5" />
                <path d="M95 34 Q100 37 105 34" stroke="#1560e8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".5" />
                <rect x="60" y="168" width="80" height="14" rx="4" fill="#e8f0fe" stroke="#c8d9f8" strokeWidth="1.5" />
                <rect x="66" y="172" width="8" height="4" rx="1" fill="#a0bef5" />
                <rect x="78" y="172" width="8" height="4" rx="1" fill="#a0bef5" />
                <rect x="90" y="172" width="8" height="4" rx="1" fill="#a0bef5" />
                <rect x="102" y="172" width="8" height="4" rx="1" fill="#a0bef5" />
                <rect x="114" y="172" width="8" height="4" rx="1" fill="#a0bef5" />
              </svg>
            </div>

            <div style={{ textAlign: "center" }}>
              <div className="tc-brand">
                <div className="tc-brand-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width={18} height={18}>
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="tc-brand-name">Clinical <span>Intelligence</span></div>
              </div>
              <div className="tc-brand-sub">Admin Control Panel</div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="tc-form-card">
            <div className="tc-form-title">Admin Login</div>
            <div className="tc-form-sub">Sign in to manage your platform</div>

            {/* Email Field */}
            <div className="tc-field">
              <label>Email</label>
              <div className="tc-fw">
                <svg className="tc-fw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="admin@clinical-intelligence.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="tc-field">
              <label>Password</label>
              <div className="tc-fw">
                <svg className="tc-fw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="tc-eye-btn"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <div className="tc-forgot-row">
              <a href="#">Forgot password?</a>
            </div>

            <button className="tc-btn-login" onClick={handleLogin}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={15} height={15}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Login
            </button>

            <div className="tc-or-row">
              <div className="tc-or-line" />
              <div className="tc-or-text">or</div>
              <div className="tc-or-line" />
            </div>

            <button className="tc-btn-google" onClick={handleGoogle}>
              <GoogleIcon />
              Sign in With Google
            </button>

            <div className="tc-bottom-row">
              Don't have an account?
              <a href="register.html">Sign Up</a>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`tc-toast${toast.visible ? " show" : ""}`}>
        <div className={`tc-toast-icon${toast.isError ? " err" : ""}`}>
          {toast.isError ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} width={11} height={11}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} width={11} height={11}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <span>{toast.message}</span>
      </div>
    </>
  );
}
