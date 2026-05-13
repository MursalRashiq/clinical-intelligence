import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import AuthService from "../../services/AuthService";
import { DOCTOR_API_ROUTES, FRONTEND_ROUTES, USER_ROLES } from "../../utils/constants";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/user/userSlice";

const gradientStyle = {
    background: "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)",
};

const trustBadges = [
    { icon: "lock_person", line1: "HIPAA", line2: "COMPLIANT" },
    { icon: "encrypted", line1: "AES-256", line2: "ENCRYPTED" },
    { icon: "verified_user", line1: "SOC2", line2: "CERTIFIED" },
];

const footerLinks = ["Privacy Policy", "Terms of Service", "Support"];

export default function DoctorLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("error") === "blocked") {
            toast.error("Your account has been blocked. Please contact support.");
        }
    }, [location.search]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        try {
            setLoading(true);
            const response = await AuthService.doctorLogin({ 
                email, 
                password, 
                role: USER_ROLES.DOCTOR 
            });

            if (response.success) {
                toast.success("Welcome back, Doctor!");
                
                // Update global state
                const user = response.data?.user || response.data;
                dispatch(setUser(user));
                
                const userStatus = user?.verificationStatus;
                
                if (userStatus === 'Pending') {
                    navigate(FRONTEND_ROUTES.DOCTOR_PENDING);
                } else {
                    navigate(FRONTEND_ROUTES.DOCTOR_DASHBOARD);
                }
            } else {
                toast.error(response.message || "Login failed. Please check your credentials.");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            // Read the server's own message first (e.g. "Invalid credentials"), then fall back
            const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
            toast.error(serverMsg || error?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        AuthService.userGoogleLogin();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#191b23]">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        body, * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .digital-sanctuary-bg { background: radial-gradient(circle at top right, #f2f3fe 0%, #faf8ff 100%); }
        .glass-panel { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); }
        input:focus { outline: none; }
        .field-input {
          width: 100%;
          background: #e1e2ed;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 12px 16px;
          border-radius: 8px 8px 0 0;
          transition: border-color 0.2s;
          color: #191b23;
          font-size: 0.875rem;
        }
        .field-input:focus { border-bottom-color: #334e99; }
        .field-input::placeholder { color: rgba(115,118,134,0.5); }
      `}</style>

            {/* Header */}
            <header className="w-full sticky top-0 z-50 bg-[#faf8ff]">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="font-headline text-xl font-extrabold tracking-tighter text-[#0A2D78]">
                        Clinical Intelligence
                    </div>
                    <div className="flex items-center gap-2">
                        {["help_outline", "dark_mode"].map((icon) => (
                            <button
                                key={icon}
                                className="p-2 text-[#424655] hover:bg-blue-50 transition-colors duration-200 rounded-full active:scale-95"
                            >
                                <span className="material-symbols-outlined">{icon}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-[#f2f3fe] h-px w-full" />
            </header>

            {/* Main */}
            <main className="flex-grow flex items-center justify-center digital-sanctuary-bg relative px-4 py-12">
                {/* BG blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#334e99]/5 blur-3xl" />
                    <div className="absolute bottom-12 -left-24 w-80 h-80 rounded-full bg-[#58b9fd]/10 blur-3xl" />
                </div>

                <div className="w-full max-w-[1100px] flex flex-col md:flex-row gap-12 items-stretch relative z-10">
                    {/* Left — Editorial */}
                    <div className="hidden md:flex flex-col justify-center w-1/2 space-y-8 pr-8">
                        <div className="space-y-4">
                            <span className="inline-block py-1 px-3 bg-[#58b9fd] text-[#00476d] rounded-full text-[0.6875rem] font-bold tracking-widest uppercase">
                                Provider Portal
                            </span>
                            <h1 className="font-headline font-bold text-5xl text-[#334e99] leading-[1.1] tracking-tight">
                                Precision care begins with{" "}
                                <span className="text-[#006495]">clarity.</span>
                            </h1>
                            <p className="text-[#424655] text-lg max-w-md leading-relaxed">
                                Access your patient diagnostics, clinical analytics, and intelligent workflow tools in one secure sanctuary.
                            </p>
                        </div>

                        <div className="pt-8">
                            <div className="p-6 glass-panel rounded-xl border border-[#c3c6d7]/15 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#334e99] shrink-0">
                                    <span className="material-symbols-outlined">shield_with_heart</span>
                                </div>
                                <div>
                                    <p className="font-headline font-bold text-[#191b23]">Are you a patient?</p>
                                    <p className="text-sm text-[#424655] mb-3">
                                        View your records and connect with your care team.
                                    </p>
                                    <button
                                        onClick={() => navigate(FRONTEND_ROUTES.LOGIN)}
                                        className="text-[#334e99] font-bold text-sm hover:underline flex items-center gap-1 group"
                                    >
                                        Go to Patient Portal
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                                            arrow_forward
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right — Login Card */}
                    <div className="w-full md:w-1/2 flex flex-col">
                        <div
                            className="bg-white rounded-xl p-8 md:p-12 border border-[#c3c6d7]/10"
                            style={{ boxShadow: "0 12px 40px rgba(10,45,120,0.06)" }}
                        >
                            <div className="mb-8">
                                <h2 className="font-headline font-bold text-2xl text-[#191b23]">Clinician Login</h2>
                                <p className="text-[#424655] text-sm mt-1">Authorized medical personnel only.</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Email */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-[0.6875rem] font-medium text-[#424655] uppercase tracking-widest px-1"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="dr.smith@hospital.org"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="field-input"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end px-1">
                                        <label
                                            htmlFor="password"
                                            className="block text-[0.6875rem] font-medium text-[#424655] uppercase tracking-widest"
                                        >
                                            Password
                                        </label>
                                        <Link
                                            to={FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD}
                                            className="text-[0.6875rem] font-bold text-[#334e99] hover:text-[#006495] transition-colors"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="field-input pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#424655] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                {showPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-4">
                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-4 rounded-md text-white font-headline font-bold text-sm uppercase tracking-widest active:scale-[0.98] transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        style={{ ...gradientStyle, boxShadow: "0 4px 20px rgba(51,78,153,0.2)" }}
                                    >
                                        {loading ? "Logging in..." : "Login to Dashboard"}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-[#c3c6d7]/20" />
                                        <span className="flex-shrink mx-4 text-[0.6875rem] text-[#737686] uppercase tracking-widest">
                                            Or continue with
                                        </span>
                                        <div className="flex-grow border-t border-[#c3c6d7]/20" />
                                    </div>

                                    {/* Google SSO */}
                                    {/* <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full py-3 rounded-md bg-[#e7e7f3] hover:bg-[#e1e2ed] border border-[#c3c6d7]/10 flex items-center justify-center gap-3 transition-colors duration-200 active:scale-[0.98]"
                                    >
                                        <img
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuABh4eyVnYJVtZPBOlLxL2s-NlB0POmeH26EVN40tU2k2TnnaByzHNkzwg3qBWnreJPcKoUlYf4FKp4nxYETLSdOhrfe1wgGgVapP5IcX5kgXXs2iUxlf-u0a64_3Cr9CbP4S4TZSfiuV6etFica7d1rWbzpWEBOHeJ4V6TXFms8ER7Y4n4ggVvti38pa8ZeSNTyLy4mfVv8iFVsgoHtDeugfdBH_hshKZ9y88LlLbyLCjuADRwBQvCUYV6LaJI6PE2lx5IlHyXXFpS"
                                            alt="Google logo"
                                            className="w-5 h-5"
                                        />
                                        <span className="font-semibold text-sm text-[#424655]">Continue with Google</span>
                                    </button> */}

                                    <div className="text-center mt-6">
                                        <p className="text-sm text-[#424655]">
                                            Don't have an account?{" "}
                                            <button 
                                                type="button"
                                                onClick={() => navigate(FRONTEND_ROUTES.DOCTOR_REGISTER)}
                                                className="text-[#334e99] font-bold hover:underline"
                                            >
                                                Sign up as a Doctor
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </form>

                            {/* Trust badges */}
                            <div className="mt-10 flex items-center justify-between opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                {trustBadges.map(({ icon, line1, line2 }, i) => (
                                    <div key={icon} className="flex items-center gap-10">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#334e99] text-xl">{icon}</span>
                                            <span className="text-[0.625rem] font-bold text-[#424655] leading-tight">
                                                {line1}
                                                <br />
                                                {line2}
                                            </span>
                                        </div>
                                        {i < trustBadges.length - 1 && (
                                            <div className="w-px h-6 bg-[#c3c6d7]/30" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile patient redirect */}
                        <div className="md:hidden mt-8 text-center">
                            <p className="text-sm text-[#424655]">
                                Are you a patient?{" "}
                                <button 
                                    type="button"
                                    onClick={() => navigate(FRONTEND_ROUTES.LOGIN)}
                                    className="text-[#334e99] font-bold hover:underline"
                                >
                                    Sign in here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#c3c6d7]/15 bg-[#faf8ff]">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4 max-w-7xl mx-auto">
                    <p className="text-xs font-medium uppercase tracking-widest text-[#424655]">
                        © 2024 Clinical Intelligence. The Digital Sanctuary for Healthcare Professionals.
                    </p>
                    <div className="flex gap-6">
                        {footerLinks.map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs font-medium uppercase tracking-widest text-[#424655] hover:text-[#0A2D78] transition-colors duration-300"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}