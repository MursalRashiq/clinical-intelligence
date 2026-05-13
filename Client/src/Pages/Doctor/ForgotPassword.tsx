import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FRONTEND_ROUTES } from "../../utils/constants";
import AuthService from "../../services/AuthService";

export default function DoctorForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValid = email.includes("@") && email.includes(".");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(email, "doctor");
      if (res?.success) {
        toast.success("Verification code sent to your email!");
        sessionStorage.setItem("doctorResetEmail", email);
        setTimeout(() => navigate(FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD_OTP), 1200);
      } else {
        toast.error(res?.message || "Failed to send reset link.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf8ff", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #1560e8 !important; }
      `}</style>

      <div style={{ background: "white", borderRadius: 20, padding: "48px 44px", width: "100%", maxWidth: 460, boxShadow: "0 12px 40px rgba(10,45,120,.09)", border: "1.5px solid #f0f0f8", position: "relative", overflow: "hidden" }}>
        {/* Accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#0a2d78,#1560e8)" }} />

        {/* Icon */}
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#1560e8" strokeWidth="2">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </div>

        <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#191b23", textAlign: "center", marginBottom: 8 }}>Forgot Password?</h2>
        <p style={{ color: "#424655", fontSize: "0.875rem", textAlign: "center", lineHeight: 1.6, marginBottom: 32 }}>
          Enter your registered email and we'll send you a verification code.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              placeholder="dr.smith@hospital.org"
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", background: "#f8fafc", fontFamily: "inherit", transition: "border .2s" }}
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: isValid ? "linear-gradient(135deg,#0a2d78,#1560e8)" : "#c8d5e8", color: "white", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 700, cursor: (isValid && !loading) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16, opacity: loading ? 0.75 : 1 }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Verification Code →"}
          </button>

          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#424655" }}>
            Remember your password?{" "}
            <button type="button" onClick={() => navigate(FRONTEND_ROUTES.DOCTOR_LOGIN)}
              style={{ background: "none", border: "none", color: "#334e99", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}>
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
