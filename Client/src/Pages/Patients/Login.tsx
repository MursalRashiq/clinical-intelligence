import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import AuthService from "../../services/AuthService";
import { setUser } from "../../redux/user/userSlice";
import { FRONTEND_ROUTES } from "../../utils/constants";

// ── Icons (inline SVG components) ─────────────────────────────────────────
const HeartbeatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx={12} cy={12} r={3} />
    </svg>
);
const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1={1} y1={1} x2={23} y2={23} />
    </svg>
);
const GoogleIcon = () => (
    <svg className="g-icon" viewBox="0 0 24 24" style={{ width: 20, height: 20, flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────
interface PasswordFieldProps {
    id: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

function PasswordField({ id, placeholder, value, onChange }: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div style={{ position: "relative" }}>
            <svg
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, stroke: "var(--sub)", pointerEvents: "none" }}
                viewBox="0 0 24 24" fill="none" strokeWidth={2}
            >
                <rect x={3} y={11} width={18} height={11} rx={2} />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
                id={id}
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%", padding: "13px 42px 13px 42px",
                    border: "1.5px solid var(--border)", borderRadius: 11,
                    fontFamily: "inherit", fontSize: 14, color: "var(--text)",
                    background: "var(--bg)", outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.background = "var(--blue-xlight)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--sub)", display: "flex", alignItems: "center", padding: 0 }}
            >
                {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
}

interface FieldProps {
    label: string;
    children: React.ReactNode;
}
function Field({ label, children }: FieldProps) {
    return (
        <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".9px", color: "var(--sub)", marginBottom: 6 }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function TextInput({ icon, type = "text", placeholder, value, onChange }: {
    icon: React.ReactNode; type?: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
    return (
        <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--sub)", pointerEvents: "none", display: "flex" }}>
                {icon}
            </span>
            <input
                type={type} placeholder={placeholder} value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: "100%", padding: "13px 14px 13px 42px", border: "1.5px solid var(--border)", borderRadius: 11, fontFamily: "inherit", fontSize: 14, color: "var(--text)", background: "var(--bg)", outline: "none" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.background = "var(--blue-xlight)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
            />
        </div>
    );
}

// ── Login Form ─────────────────────────────────────────────────────────────
function LoginForm({ onToast }: { onToast: (msg: string, isError?: boolean) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!email || !password) { onToast("Please fill in all fields", true); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { onToast("Please enter a valid email address", true); return; }
        
        setLoading(true);
        try {
            const res = await AuthService.userLogin({ email, password, role: "patient" });
            if (res?.success) {
                onToast("Welcome back! ✓");
                if (res.data?.user) {
                    dispatch(setUser(res.data.user));
                }
                setTimeout(() => navigate(FRONTEND_ROUTES.HOME, { replace: true }), 1000);
            } else {
                onToast(res?.message || "Login failed", true);
            }
        } catch (err: any) {
            onToast(err?.message || "Something went wrong", true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Field label="Email Address">
                <TextInput
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                    type="email" placeholder="jane@example.com" value={email} onChange={setEmail}
                />
            </Field>
            <Field label="Password">
                <PasswordField id="loginPw" placeholder="Enter your password" value={password} onChange={setPassword} />
            </Field>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6, marginBottom: 14 }}>
                <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)", textDecoration: "none" }}>Forgot password?</Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                <input type="checkbox" id="rememberMe" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--blue)", cursor: "pointer", flexShrink: 0 }} />
                <label htmlFor="rememberMe" style={{ fontSize: 13, color: "var(--sub)", cursor: "pointer" }}>Remember me for 30 days</label>
            </div>
            <button disabled={loading} onClick={handleLogin} style={{ width: "100%", padding: 14, border: "none", borderRadius: 12, background: "linear-gradient(135deg,var(--blue),var(--blue2))", color: "white", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 6px 20px rgba(21,96,232,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                {loading ? (
                    <Loader2 className="animate-spin" size={17} />
                ) : (
                    <svg style={{ width: 17, height: 17 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1={15} y1={12} x2={3} y2={12} /></svg>
                )}
                {loading ? "Signing In..." : "Sign In to Account"}
            </button>
            <Divider text="or continue with" />
            <GoogleButton onClick={() => AuthService.userGoogleLogin()} label="Login with Google" />
            <div style={{ textAlign: "center", fontSize: 14, color: "var(--sub)" }}>
                Don't have an account?
                <Link to="/register" style={{ color: "var(--blue)", fontWeight: 700, textDecoration: "none", marginLeft: 4 }}>Sign Up →</Link>
            </div>
        </>
    );
}

// ── Shared UI pieces ───────────────────────────────────────────────────────
function Divider({ text }: { text: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--sub)", whiteSpace: "nowrap" }}>{text}</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
    );
}

function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            style={{ width: "100%", padding: "13px 14px", border: "1.5px solid var(--border)", borderRadius: 12, background: "white", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}
        >
            <GoogleIcon />
            {label}
        </button>
    );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, visible, isError }: { message: string; visible: boolean; isError?: boolean }) {
    return (
        <div style={{
            position: "fixed", bottom: 28, left: "50%",
            transform: `translateX(-50%) translateY(${visible ? 0 : 80}px)`,
            background: "#0f1c2e", color: "white", borderRadius: 12,
            padding: "14px 24px", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,.2)",
            transition: "transform .4s cubic-bezier(.34,1.56,.64,1)",
            zIndex: 99, whiteSpace: "nowrap",
        }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: isError ? "#ef4444" : "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isError ? (
                    <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                    <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                )}
            </div>
            {message}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ClinicalIntelligenceLogin() {
    const [toast, setToast] = useState({ visible: false, message: "", isError: false });
    const location = useLocation();

    const showToast = useCallback((msg: string, isError = false) => {
        setToast({ visible: true, message: msg, isError });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("error") === "blocked") {
            showToast("Your account has been blocked. Please contact support.", true);
        }
    }, [location.search, showToast]);

    return (
        <>
            {/* CSS Variables + global resets injected via style tag */}
            <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --blue:#1560e8;--blue2:#0d4bc4;--blue3:#0a3ca0;
          --blue-light:#e8f0fe;--blue-xlight:#f4f7fe;
          --teal:#00bfa5;
          --text:#0f1c2e;--sub:#5a6a80;--border:#dde6f5;
          --bg:#f4f7fe;--white:#fff;
        }
        html,body{height:100%;font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);}
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .l-cross{position:absolute;color:rgba(255,255,255,.14);font-size:18px;animation:twinkle 3.5s ease-in-out infinite;}
        .l-cross.c1{top:8%;right:12%;animation-delay:0s;}
        .l-cross.c2{top:22%;right:28%;animation-delay:1.2s;}
        .l-cross.c3{bottom:28%;right:8%;animation-delay:2s;}
        @keyframes twinkle{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:.7;transform:scale(1.25)}}
        .doc-photo-img{width:78%;max-width:400px;object-fit:cover;object-position:top center;display:block;filter:drop-shadow(0 -20px 60px rgba(0,0,0,.3));animation:floatUp .8s ease both;}
        @keyframes floatUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .float-badge{position:absolute;top:26%;right:7%;z-index:3;background:rgba(255,255,255,.95);border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.18);animation:pulse-badge 4s ease-in-out infinite;}
        @keyframes pulse-badge{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @media(max-width:900px){.left-panel{display:none!important;}.right-panel{width:100%!important;}}
      `}</style>

            <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
                <div
                    className="left-panel"
                    style={{
                        flex: 1.1, position: "relative", overflow: "hidden",
                        background: "linear-gradient(150deg,#071b54 0%,#0d3aaa 40%,#1560e8 70%,#1a9ed4 100%)",
                        display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    }}
                >
                    {/* Dot grid overlay */}
                    <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "radial-gradient(circle,rgba(255,255,255,.065) 1px,transparent 1px)",
                        backgroundSize: "28px 28px",
                        maskImage: "radial-gradient(ellipse 100% 100% at 50% 50%,black 20%,transparent 100%)",
                    }} />

                    {/* Rings */}
                    {[{ w: 700, h: 700, t: -200, l: -200 }, { w: 480, h: 480, t: -80, l: -80 }].map((r, i) => (
                        <div key={i} style={{ position: "absolute", width: r.w, height: r.h, top: r.t, left: r.l, borderRadius: "50%", border: "1px solid rgba(255,255,255,.09)", pointerEvents: "none" }} />
                    ))}

                    {/* Crosses */}
                    <span className="l-cross c1">✚</span>
                    <span className="l-cross c2">✚</span>
                    <span className="l-cross c3">✚</span>

                    {/* Logo */}
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, position: "absolute", top: 32, left: 40, zIndex: 3, textDecoration: "none" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
                            <div style={{ width: 20, height: 20, color: "white" }}><HeartbeatIcon /></div>
                        </div>
                        <span style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: "white", fontWeight: 700 }}>Clinical Intelligence</span>
                    </Link>

                    {/* Doctor photo */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                        <img
                            className="doc-photo-img"
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=90&fit=crop&crop=faces,top"
                            alt="Doctor"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                    </div>

                    {/* Floating badge */}
                    <div className="float-badge">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg style={{ width: 18, height: 18, stroke: "var(--blue)" }} viewBox="0 0 24 24" fill="none" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <div>
                            <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>12,000+</div>
                            <div style={{ fontSize: 11, color: "var(--sub)", fontWeight: 500 }}>Happy Patients</div>
                        </div>
                    </div>

                    {/* Bottom content */}
                    <div style={{ position: "relative", zIndex: 2, padding: "36px 44px", background: "linear-gradient(to top,rgba(5,20,65,.88) 0%,transparent 100%)" }}>
                        <div style={{ fontFamily: "Fraunces, serif", fontSize: 27, color: "white", fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
                            Your Health,<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,.6)" }}>Our Priority.</em>
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.52)", lineHeight: 1.6, marginBottom: 18 }}>
                            Connect with 500+ verified specialists. Book appointments, track your health — all in one place.
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {[
                                { icon: "🏥", text: "500+ Doctors", sub: "Verified" },
                                { icon: "⭐", text: "98% Satisfaction", sub: "Patient rated" },
                                { icon: "🕐", text: "24/7 Support", sub: "Always on" },
                            ].map((s) => (
                                <div key={s.text} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 100, padding: "8px 16px", backdropFilter: "blur(12px)" }}>
                                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{s.text}</div>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>{s.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
                <div
                    className="right-panel"
                    style={{
                        width: 480, flexShrink: 0, background: "white",
                        display: "flex", flexDirection: "column", justifyContent: "center",
                        padding: "48px 48px", overflowY: "auto", position: "relative",
                    }}
                >
                    {/* Top accent bar */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,var(--blue),var(--teal))" }} />

                    {/* Badge */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--blue-light)", border: "1px solid rgba(21,96,232,.15)", borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "var(--blue)", marginBottom: 18, width: "fit-content" }}>
                        <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        Patient Portal
                    </div>

                    <div style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, color: "var(--text)", lineHeight: 1.15, marginBottom: 6 }}>
                        Patient <span style={{ color: "var(--blue)" }}>Sign In</span>
                    </div>
                    <div style={{ fontSize: 14, color: "var(--sub)", marginBottom: 24, lineHeight: 1.5 }}>
                        Sign in to your account to manage your healthcare journey.
                    </div>

                    {/* Forms */}
                    <LoginForm onToast={showToast} />
                </div>
            </div>

            <Toast message={toast.message} visible={toast.visible} isError={toast.isError} />
        </>
    );
}
