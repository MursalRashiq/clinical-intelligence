import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { FRONTEND_ROUTES } from "../../utils/constants";
import AuthService from "../../services/AuthService";

export default function DoctorResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetToken = sessionStorage.getItem("doctorResetToken") || "";
  const email = sessionStorage.getItem("doctorResetEmail") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!resetToken) {
      toast.error("Session expired. Please try again.");
      navigate(FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD);
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.resetPassword({
        email,
        resetToken,
        newPassword: password,
        confirmNewPassword: confirmPassword
      }, "doctor");
      if (res?.success) {
        toast.success("Password reset successful! Please log in.");
        sessionStorage.removeItem("doctorResetToken");
        sessionStorage.removeItem("doctorResetEmail");
        setTimeout(() => navigate(FRONTEND_ROUTES.DOCTOR_LOGIN), 1500);
      } else {
        toast.error(res?.message || "Failed to reset password.");
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
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #1560e8 !important; }
      `}</style>

      <div style={{ background: "white", borderRadius: 20, padding: "48px 44px", width: "100%", maxWidth: 460, boxShadow: "0 12px 40px rgba(10,45,120,.09)", border: "1.5px solid #f0f0f8", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#0a2d78,#1560e8)" }} />

        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#1560e8" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#191b23", textAlign: "center", marginBottom: 8 }}>Set New Password</h2>
        <p style={{ color: "#424655", fontSize: "0.875rem", textAlign: "center", lineHeight: 1.6, marginBottom: 32 }}>
          Create a strong, unique password to secure your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 42px 12px 14px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", background: "#f8fafc", fontFamily: "inherit" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5a6a80" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", background: "#f8fafc", fontFamily: "inherit" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0a2d78,#1560e8)", color: "white", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.75 : 1 }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
