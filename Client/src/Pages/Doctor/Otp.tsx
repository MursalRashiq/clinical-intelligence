import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FRONTEND_ROUTES, DOCTOR_API_ROUTES, USER_ROLES } from "../../utils/constants";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "sonner"; // Assuming sonner is used for toasts, if not we can use alert

const gradientStyle = {
  background: "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)",
};

const infoItems = [
  {
    icon: "timer",
    label: "Code Validity",
    desc: "Your verification code will expire in 04:59 minutes for security reasons.",
  },
  {
    icon: "security",
    label: "Security Protocol",
    desc: "Protected by 256-bit encryption. Always ensure you are on clinical-intel.com.",
  },
];

export default function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || {};
  const email = formData.email || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const TIMER_KEY = "doctor_otp_expiry";
  const TIMER_DURATION = 60;

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedExpiry = sessionStorage.getItem(TIMER_KEY);
    if (savedExpiry) {
      const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    const expiry = Date.now() + TIMER_DURATION * 1000;
    sessionStorage.setItem(TIMER_KEY, expiry.toString());
    return TIMER_DURATION;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      const savedExpiry = sessionStorage.getItem(TIMER_KEY);
      if (savedExpiry) {
        const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [local, domain] = email.split('@');
    if (!domain) return email;
    if (local.length <= 2) return `${local}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast ? toast.error("Please enter a 6-digit OTP.") : alert("Please enter a 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(DOCTOR_API_ROUTES.VERIFY_OTP, {
        email,
        otp: otpValue,
        role: USER_ROLES.DOCTOR,
      });
      // Clear timer on success
      sessionStorage.removeItem(TIMER_KEY);
      // Assuming successful login, proceed to step 2 of registration
      navigate(`${FRONTEND_ROUTES.DOCTOR_REGISTER}?step=2`, { state: { formData } });
    } catch (error: any) {
      console.error("Verification failed", error);
      toast ? toast.error(error.response?.data?.message || "Verification failed.") : alert("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (resending || timeLeft > 0) return;
    
    try {
      setResending(true);
      await axiosInstance.post(DOCTOR_API_ROUTES.RESEND_OTP, { email, role: USER_ROLES.DOCTOR });
      toast ? toast.success("OTP sent successfully.") : alert("OTP sent successfully.");
      
      const newExpiry = Date.now() + TIMER_DURATION * 1000;
      sessionStorage.setItem(TIMER_KEY, newExpiry.toString());
      setTimeLeft(TIMER_DURATION); 
    } catch (error: any) {
      console.error("Failed to resend OTP", error);
      toast ? toast.error(error.response?.data?.message || "Failed to resend OTP.") : alert("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#191b23]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .fill-icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        body { font-family: 'Inter', sans-serif; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .otp-input:focus {
          border-bottom: 2px solid #1560E8;
          background-color: #ffffff;
          outline: none;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
        }
      `}</style>

      {/* Header */}
      <header className="w-full sticky top-0 bg-[#faf8ff] shadow-sm z-50">
        <div className="flex justify-between items-center px-6 py-4 max-w-full mx-auto">
          <div
            className="text-xl font-bold font-headline"
            style={{ background: "linear-gradient(to right, #0A2D78, #1560E8, #1A8FD1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Clinical Intelligence
          </div>
          <nav className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm tracking-tight">
            {["Onboarding Status", "Help", "Support"].map((item) => (
              <a key={item} href="#" className="text-[#424655] font-medium hover:text-[#1560E8] transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {["notifications", "account_circle"].map((icon) => (
              <button key={icon} className="text-[#334E99] active:scale-95 duration-200">
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#f2f3fe] h-px w-full" />
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* BG accents */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 opacity-5 rounded-full blur-3xl" style={gradientStyle} />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 opacity-5 rounded-full blur-3xl" style={gradientStyle} />

        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="glass-card rounded-xl p-8 sm:p-12 shadow-sm border border-[#c3c6d7]/15 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-[#f2f3fe] rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined fill-icon text-[#334e99] text-3xl">verified_user</span>
            </div>

            {/* Heading */}
            <h1 className="font-headline text-2xl font-bold text-[#191b23] mb-2 tracking-tight">
              Two-Step Verification
            </h1>
            <p className="text-[#424655] text-sm mb-10 leading-relaxed">
              We've sent a 6-digit secure code to your registered{" "}
              <br className="hidden sm:block" />
              <span className="font-semibold text-[#334e99]">{maskEmail(email)}</span>.{" "}
              <br />
              Please enter it below to access your dashboard.
            </p>

            {/* OTP Inputs */}
            <div className="grid grid-cols-6 gap-3 sm:gap-4 mb-10 w-full max-w-sm">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  placeholder="•"
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="otp-input w-full aspect-square text-center font-headline text-2xl font-bold text-[#334e99] bg-[#e1e2ed] rounded-lg transition-all duration-200"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className={`w-full py-4 text-white font-headline font-bold text-sm rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest mb-8 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={gradientStyle}
            >
              {loading ? "Verifying..." : "Verify Identity"}
            </button>

            {/* Footer actions */}
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[#424655]">
                Didn't receive the email? Check your spam folder.
              </p>
              <a
                href="#"
                onClick={handleResend}
                className={`text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1 group ${
                  resending || timeLeft > 0 
                    ? 'text-[#737686] cursor-not-allowed pointer-events-none' 
                    : 'text-[#334e99] hover:text-[#006495]'
                }`}
              >
                {resending ? "Sending..." : timeLeft > 0 ? `Resend Code (${timeLeft}s)` : "Resend Code"}
                {timeLeft === 0 && !resending && (
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                )}
              </a>
            </div>
          </div>

          {/* Info strip */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
            {infoItems.map(({ icon, label, desc }) => (
              <div key={label} className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-[#737686] p-2 bg-[#f2f3fe] rounded-lg">
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-bold text-[#424655] uppercase tracking-tighter">{label}</p>
                  <p className="text-xs text-[#737686] leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-[10px] text-[#c3c6d7] uppercase tracking-[0.2em] font-medium">
          Clinical Intelligence Systems © 2024 • Secured by Dr. Sanctuary Protocols
        </p>
      </footer>

      {/* Floating tip */}
      <div className="fixed bottom-8 right-8 hidden lg:block">
        <div className="glass-card border border-[#c3c6d7]/15 rounded-xl p-4 shadow-xl w-48">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#334e99] text-lg">info</span>
            <span className="text-[10px] font-bold text-[#424655] uppercase">Quick Tip</span>
          </div>
          <p className="text-[11px] text-[#424655] leading-snug">
            You can use your physical numpad to enter the digits automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
