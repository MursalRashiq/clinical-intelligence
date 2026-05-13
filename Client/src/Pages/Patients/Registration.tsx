import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthService from "../../services/AuthService";
import { FRONTEND_ROUTES } from "../../utils/constants";

// ── Icons ──
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx={12} cy={12} r={3} />
    </svg>
);
const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1={1} y1={1} x2={23} y2={23} />
    </svg>
);

const codes = [
    { f: "🇮🇳", c: "+91" },
    { f: "🇺🇸", c: "+1" },
    { f: "🇬🇧", c: "+44" },
    { f: "🇦🇺", c: "+61" },
    { f: "🇦🇪", c: "+971" },
    { f: "🇨🇦", c: "+1" },
];


export default function PatientRegistration() {
    const navigate = useNavigate();

    const [codeIndex, setCodeIndex] = useState(0);
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });
    const [toast, setToast] = useState<{ msg: string; err: boolean; show: boolean }>({
        msg: "",
        err: false,
        show: false,
    });

    const cycleCode = () => setCodeIndex((i) => (i + 1) % codes.length);

    const showToast = (msg: string, err = false) => {
        setToast({ msg, err, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
    };

    // const doGoogle = () => {
    //     AuthService.userGoogleLogin();
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { showToast("Please enter your name", true); return; }
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            showToast("Please enter a valid email address", true); return;
        }
        const strippedPhone = form.phone.replace(/\D/g, "");
        if (strippedPhone.length !== 10) {
            showToast("Phone number must be exactly 10 digits", true); return;
        }
        if (/^(\d)\1{9}$/.test(strippedPhone)) {
            showToast("Phone number cannot be all the same digit", true); return;
        }
        if (form.password.length < 8) {
            showToast("Password must be at least 8 characters long", true); return;
        }
        if (!/^(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
            showToast("Password must contain at least one uppercase letter and one number", true); return;
        }
        if (form.password !== form.confirmPassword) {
            showToast("Passwords do not match", true); return;
        }
        if (!form.terms) { showToast("Please accept the Terms of Service", true); return; }

        setLoading(true);

        try {
            const fullPhone = `${codes[codeIndex].c}${form.phone.replace(/\s/g, "")}`;
            const res = await AuthService.userRegister({
                name: form.name,
                email: form.email,
                phone: fullPhone,
                password: form.password,
                confirmPassword: form.confirmPassword,
                role: "patient"
            });

            if (res?.success) {
                showToast("Verification code sent to your email! 📧");
                // Navigate to OTP verification and pass the email
                setTimeout(() => {
                    navigate(FRONTEND_ROUTES.VERIFY_OTP, { state: { email: form.email, role: "patient" } });
                }, 1500);
            } else {
                showToast(res?.message || "Registration failed", true);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            showToast(message, true);
        } finally {
            setLoading(false);
        }
    };

    const set = (field: string, value: string | boolean) =>
        setForm((f) => ({ ...f, [field]: value }));

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --blue:#1560e8;--blue2:#0d4bc4;
          --teal:#00bfa5;
          --blue-light:#e8f0fe;--blue-xlight:#f4f7fe;
          --text:#0f1c2e;--sub:#5a6a80;--border:#dde6f5;
          --bg:#f4f7fe;--white:#fff;
          --brand-dark:#072c72;--brand-light:#1574d3;
        }
        html,body{height:100%;font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);}
        .page{display:flex;min-height:100vh;}
        .left{flex:1;position:relative;overflow:hidden;background:linear-gradient(155deg,#061440 0%,#0b2d9e 38%,var(--blue) 68%,#1591d4 100%);}
        .left::before{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1px);background-size:26px 26px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent);}
        .l-ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.08);pointer-events:none;}
        .lr1{width:740px;height:740px;top:-260px;left:-260px;}
        .lr2{width:480px;height:480px;top:-110px;left:-70px;}
        .lx{position:absolute;color:rgba(255,255,255,.14);font-size:16px;animation:twinkle 3.5s ease-in-out infinite;}
        .lx.x1{top:7%;right:9%;animation-delay:.2s;}
        .lx.x2{top:25%;right:28%;animation-delay:1.4s;}
        .lx.x3{bottom:30%;right:5%;animation-delay:2.1s;}
        .lx.x4{bottom:12%;left:16%;animation-delay:.9s;}
        @keyframes twinkle{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.65;transform:scale(1.3)}}
        .l-logo{position:absolute;top:34px;left:38px;z-index:4;display:flex;align-items:center;gap:10px;text-decoration:none;}
        .l-logo-box{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg, var(--blue), var(--teal));border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(21,96,232,.25);}
        .l-logo-name{font-family:'Fraunces',serif;font-size:22px;color:white;font-weight:700;}
        .l-logo-name span{color:rgba(255,255,255,.7);}
        .doc-wrap{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;}
        .doc-img{width:80%;max-width:420px;object-fit:cover;object-position:top center;display:block;filter:drop-shadow(0 -20px 55px rgba(0,0,0,.32));animation:rise .9s ease both;}
        @keyframes rise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        .doc-ph{width:80%;max-width:420px;height:500px;display:flex;align-items:center;justify-content:center;font-size:90px;}
        .f-badge{position:absolute;background:rgba(255,255,255,.94);border-radius:14px;backdrop-filter:blur(10px);box-shadow:0 8px 30px rgba(0,0,0,.15);display:flex;align-items:center;gap:10px;padding:11px 15px;animation:bob 5s ease-in-out infinite;}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .fb1{top:20%;right:6%;animation-delay:0s;}
        .fb2{top:42%;right:5%;animation-delay:2s;}
        .f-badge-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
        .f-badge-num{font-family:'Fraunces',serif;font-size:18px;font-weight:700;color:var(--text);}
        .f-badge-lbl{font-size:11px;color:var(--sub);margin-top:1px;}
        .l-bottom{position:absolute;bottom:0;left:0;right:0;z-index:3;padding:30px 40px;background:linear-gradient(to top,rgba(4,12,46,.92) 0%,transparent 100%);}
        .l-tagline{font-family:'Fraunces',serif;font-size:24px;color:white;font-weight:700;line-height:1.3;margin-bottom:6px;}
        .l-tagline em{font-style:italic;color:rgba(255,255,255,.55);}
        .l-sub{font-size:13px;color:rgba(255,255,255,.45);line-height:1.65;margin-bottom:16px;}
        .l-chips{display:flex;gap:8px;flex-wrap:wrap;}
        .l-chip{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:100px;padding:6px 14px;backdrop-filter:blur(10px);}
        .l-chip span{font-size:11px;font-weight:700;color:rgba(255,255,255,.85);}
        .right{width:500px;flex-shrink:0;background:white;display:flex;flex-direction:column;overflow-y:auto;position:relative;}
        .right::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--blue),var(--teal));z-index:1;}
        .right-body{padding:44px 50px 36px;flex:1;}
        .proj-name{display:inline-flex;align-items:center;gap:7px;background:var(--blue-light);border:1px solid rgba(21,96,232,.15);border-radius:100px;padding:5px 14px;font-size:12px;font-weight:700;color:var(--blue);margin-bottom:16px;}
        .form-title{font-family:'Fraunces',serif;font-size:28px;font-weight:700;color:var(--text);line-height:1.15;margin-bottom:5px;}
        .form-title span{color:var(--blue);}
        .form-sub{font-size:14px;color:var(--sub);margin-bottom:26px;line-height:1.55;}
        .btn-google{width:100%;padding:13px 14px;border:1.5px solid var(--border);border-radius:12px;background:white;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s;margin-bottom:18px;}
        .btn-google:hover{border-color:var(--blue);background:var(--blue-xlight);color:var(--blue);}
        .g-icon{width:20px;height:20px;flex-shrink:0;}
        .divider{display:flex;align-items:center;gap:13px;margin-bottom:20px;}
        .dv-line{flex:1;height:1px;background:var(--border);}
        .dv-text{font-size:12px;font-weight:600;color:var(--sub);white-space:nowrap;}
        .field{margin-bottom:15px;flex:1;}
        .field label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--sub);margin-bottom:6px;}
        .fw{position:relative;}
        .fw svg.fi{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;stroke:var(--sub);pointer-events:none;transition:stroke .2s;}
        .fw:focus-within svg.fi{stroke:var(--blue);}
        .fw input,.fw select{width:100%;padding:12px 13px 12px 40px;border:1.5px solid var(--border);border-radius:11px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--text);background:var(--bg);outline:none;transition:border .2s,background .2s;appearance:none;height:45px;}
        .fw input::placeholder{color:#b8c8dc;}
        .fw input:focus,.fw select:focus{border-color:var(--blue);background:var(--blue-xlight);}
        .eye-btn{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--sub);display:flex;align-items:center;padding:0;z-index:2;}
        .eye-btn:hover{color:var(--blue);}
        .phone-row{display:flex;border:1.5px solid var(--border);border-radius:11px;overflow:hidden;background:var(--bg);transition:border .2s;height:45px;}
        .phone-row:focus-within{border-color:var(--blue);background:var(--blue-xlight);}
        .phone-flag{display:flex;align-items:center;gap:6px;padding:0 12px;border-right:1.5px solid var(--border);font-size:13px;font-weight:700;color:var(--sub);cursor:pointer;background:white;white-space:nowrap;transition:background .2s;flex-shrink:0;}
        .phone-flag:hover{background:var(--bg);}
        .phone-in{flex:1;border:none;background:transparent;padding:12px 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--text);outline:none;}
        .phone-in::placeholder{color:#b8c8dc;}
        .row2{display:flex;gap:14px;}
        .gender-row{display:flex;gap:9px;}
        .g-opt{flex:1;position:relative;}
        .g-opt input{position:absolute;opacity:0;width:0;height:0;}
        .g-opt label{display:flex;align-items:center;justify-content:center;gap:4px;padding:12px 4px;border:1.5px solid var(--border);border-radius:11px;font-size:12px;font-weight:600;color:var(--sub);cursor:pointer;transition:all .2s;background:var(--bg);height:45px;white-space:nowrap;}
        .g-opt input:checked + label{border-color:var(--blue);color:var(--blue);background:var(--blue-light);}
        .g-opt label:hover{border-color:var(--blue);background:var(--blue-light);}
        .sel-wrap{position:relative;}
        .sel-wrap svg.fi{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;stroke:var(--sub);pointer-events:none;}
        .sel-wrap::after{content:'▾';position:absolute;right:13px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--sub);pointer-events:none;}
        .sel-wrap select{width:100%;padding:12px 32px 12px 40px;border:1.5px solid var(--border);border-radius:11px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--text);background:var(--bg);outline:none;transition:border .2s,background .2s;appearance:none;cursor:pointer;}
        .sel-wrap select:focus{border-color:var(--blue);background:var(--blue-xlight);}
        .terms-box{background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:20px;display:flex;gap:11px;align-items:flex-start;}
        .terms-box input[type=checkbox]{width:16px;height:16px;accent-color:var(--blue);cursor:pointer;flex-shrink:0;margin-top:2px;}
        .terms-txt{font-size:13px;color:var(--sub);line-height:1.6;}
        .terms-txt a{color:var(--blue);font-weight:600;text-decoration:none;}
        .terms-txt a:hover{text-decoration:underline;}
        .btn-submit{width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,var(--blue),var(--blue2));color:white;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 22px rgba(21,96,232,.28);transition:all .22s;display:flex;align-items:center;justify-content:center;gap:9px;}
        .btn-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px rgba(21,96,232,.36);}
        .btn-submit:disabled{cursor:not-allowed;opacity:0.7;}
        .signin-strip{padding:18px 50px 26px;border-top:1px solid var(--border);background:var(--bg);text-align:center;font-size:14px;color:var(--sub);margin-top:22px;}
        .signin-strip a{color:var(--blue);font-weight:700;text-decoration:none;margin-left:5px;}
        .signin-strip a:hover{text-decoration:underline;}
        .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(80px);background:#0f1c2e;color:white;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.2);transition:transform .4s cubic-bezier(.34,1.56,.64,1);z-index:99;white-space:nowrap;}
        .toast.show{transform:translateX(-50%) translateY(0);}
        .t-icon{width:22px;height:22px;border-radius:50%;background:#16a34a;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .t-icon.err{background:#ef4444;}
        @media(max-width:960px){.left{display:none;}.right{width:100%;}}
        @media(max-width:480px){.right-body{padding:32px 22px 24px;}.signin-strip{padding:16px 22px 22px;}.row2{flex-direction:column;gap:0;}}
      `}</style>

            <div className="page">

                {/* ── LEFT PANEL ── */}
                <div className="left">
                    <div className="l-ring lr1" />
                    <div className="l-ring lr2" />
                    <span className="lx x1">✚</span>
                    <span className="lx x2">✚</span>
                    <span className="lx x3">✚</span>
                    <span className="lx x4">✚</span>

                    <Link className="l-logo" to="/">
                        <div className="l-logo-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <div className="l-logo-name">Clinical <span>Intelligence</span></div>
                    </Link>

                    <div className="f-badge fb1">
                        <div className="f-badge-icon" style={{ background: "#e8f0fe" }}>🏥</div>
                        <div>
                            <div className="f-badge-num">500+</div>
                            <div className="f-badge-lbl">Verified Doctors</div>
                        </div>
                    </div>
                    <div className="f-badge fb2">
                        <div className="f-badge-icon" style={{ background: "#e0f7f4" }}>⭐</div>
                        <div>
                            <div className="f-badge-num">12K+</div>
                            <div className="f-badge-lbl">Happy Patients</div>
                        </div>
                    </div>

                    <div className="doc-wrap">
                        <img
                            className="doc-img"
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=90&fit=crop&crop=faces,top"
                            alt="Doctor"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                const sib = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                if (sib) sib.style.display = "flex";
                            }}
                        />
                        <div className="doc-ph" style={{ display: "none" }}>👩‍⚕️</div>
                    </div>

                    <div className="l-bottom">
                        <div className="l-tagline">
                            Join <em>Thousands</em> of<br />Patients Today
                        </div>
                        <div className="l-sub">
                            Create your free account and get instant access to the best healthcare professionals near you.
                        </div>
                        <div className="l-chips">
                            <div className="l-chip">🔒 <span>Secure & Private</span></div>
                            <div className="l-chip">⚡ <span>Instant Access</span></div>
                            <div className="l-chip">💊 <span>Free to Register</span></div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="right">
                    <div className="right-body">


                        <div className="form-title">Patient <span>Registration</span></div>
                        <div className="form-sub">
                            Create your free account to book appointments and manage your health journey.
                        </div>

                        <button className="btn-google" onClick={() => AuthService.userGoogleLogin()}>
                            <svg className="g-icon" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="divider">
                            <div className="dv-line" />
                            <div className="dv-text">or fill in your details</div>
                            <div className="dv-line" />
                        </div>

                        <form onSubmit={handleSubmit} noValidate>

                            {/* Name */}
                            <div className="field">
                                <label>Full Name</label>
                                <div className="fw">
                                    <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Jane Smith"
                                        value={form.name}
                                        onChange={(e) => set("name", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Patient Name */}
                            {/* <div className="field">
                                <div className="fw">
                                    <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                            </div> */}

                            {/* Email */}
                            <div className="field">
                                <label>Email Address</label>
                                <div className="fw">
                                    <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <input
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={form.email}
                                        onChange={(e) => set("email", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="field">
                                <label>Phone Number</label>
                                <div className="phone-row">
                                    <div className="phone-flag" onClick={cycleCode} title="Tap to change country">
                                        <span>{codes[codeIndex].f}</span>
                                        <span>{codes[codeIndex].c}</span>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                    <input
                                        className="phone-in"
                                        type="tel"
                                        placeholder="98765 43210"
                                        maxLength={15}
                                        value={form.phone}
                                        onChange={(e) => set("phone", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="row2">
                                <div className="field">
                                    <label>Password</label>
                                    <div className="fw">
                                        <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input
                                            type={showPw ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={(e) => set("password", e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() => setShowPw(!showPw)}
                                            tabIndex={-1}
                                        >
                                            {showPw ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Confirm Password</label>
                                    <div className="fw">
                                        <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={form.confirmPassword}
                                            onChange={(e) => set("confirmPassword", e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* DOB + Gender */}
                            {/* <div className="row2">
                                <div className="field">
                                    <label>Date of Birth</label>
                                    <div className="fw">
                                        <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        <input
                                            type="date"
                                            style={{ paddingLeft: "40px" }}
                                            max={getMaxDate()}
                                            value={form.dob}
                                            onChange={(e) => set("dob", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Gender</label>
                                    <div className="gender-row">
                                        {(["male", "female", "other"] as const).map((g) => (
                                            <div className="g-opt" key={g}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    id={`g-${g}`}
                                                    value={g}
                                                    checked={form.gender === g}
                                                    onChange={() => set("gender", g)}
                                                />
                                                <label htmlFor={`g-${g}`}>
                                                    {g === "male" ? "♂ Male" : g === "female" ? "♀ Female" : "⚧ Other"}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div> */}

                            {/* Blood Group */}
                            {/* <div className="field">
                                <label>
                                    Blood Group{" "}
                                    <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#9ab" }}>
                                        (optional)
                                    </span>
                                </label>
                                <div className="sel-wrap">
                                    <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                                    </svg>
                                    <select
                                        value={form.bloodGroup}
                                        onChange={(e) => set("bloodGroup", e.target.value)}
                                    >
                                        <option value="">Select blood group</option>
                                        {["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map((bg) => (
                                            <option key={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div> */}

                            {/* Terms */}
                            <div className="terms-box">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={form.terms}
                                    onChange={(e) => set("terms", e.target.checked)}
                                />
                                <div className="terms-txt">
                                    I agree to Clinical Intelligence's <a href="#">Terms of Service</a> and{" "}
                                    <a href="#">Privacy Policy</a>. I consent to my health data being stored securely for care purposes.
                                </div>
                            </div>

                            {/* Submit */}
                            <button className="btn-submit" type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="animate-spin" size={17} />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="17" height="17">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" />
                                        <line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                )}
                                {loading ? "Creating Account..." : "Create My Patient Account"}
                            </button>
                        </form>
                    </div>

                    <div className="signin-strip">
                        Already have an account?
                        <Link to="/login">Sign In →</Link>
                    </div>
                </div>
            </div>

            {/* Toast */}
            <div className={`toast${toast.show ? " show" : ""}`}>
                <div className={`t-icon${toast.err ? " err" : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                        {toast.err
                            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                            : <polyline points="20 6 9 17 4 12" />
                        }
                    </svg>
                </div>
                <span>{toast.msg}</span>
            </div>
        </>
    );
}