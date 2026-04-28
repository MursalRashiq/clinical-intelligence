import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { theme } from "../../theme";
import Navbar from "../../components/Navbar";
import Input from "../../components/Ui/input";
import authService from "../../services/authService";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.oldPassword) newErrors.oldPassword = "Current password is required";
        if (!formData.newPassword) newErrors.newPassword = "New password is required";
        else if (formData.newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
            newErrors.newPassword = "New password must be different from current password";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authService.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmPassword
            });

            if (res.success) {
                toast.success("Password changed successfully!");
                navigate("/");
            } else {
                toast.error(res.message || "Failed to change password");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Navbar />

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(20px)",
                        padding: "48px 40px",
                        borderRadius: 24,
                        boxShadow: "0 24px 48px rgba(21, 96, 232, 0.08)",
                        width: "100%",
                        maxWidth: 480,
                        border: "1px solid rgba(255, 255, 255, 0.5)"
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 20,
                            background: `linear-gradient(135deg, ${theme.blueLight}, #eff6ff)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 24px", boxShadow: "inset 0 4px 12px rgba(255,255,255,0.8)"
                        }}>
                            <KeyRound size={32} color={theme.blue} strokeWidth={2} />
                        </div>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: theme.brandDark, marginBottom: 8, fontFamily: "Fraunces, serif" }}>
                            Change Password
                        </h2>
                        <p style={{ color: theme.sub, fontSize: 15, lineHeight: 1.5 }}>
                            Update your password to keep your <strong style={{ color: theme.blue }}>Clinical Intelligence</strong> account secure.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div>
                            <Input
                                label="Current Password"
                                type={showOldPassword ? "text" : "password"}
                                icon={<Lock size={18} />}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub, padding: 0, display: "flex" }}
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                error={errors.oldPassword}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div>
                            <Input
                                label="New Password"
                                type={showNewPassword ? "text" : "password"}
                                icon={<Lock size={18} />}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub, padding: 0, display: "flex" }}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                error={errors.newPassword}
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <Input
                                label="Confirm New Password"
                                type={showConfirmPassword ? "text" : "password"}
                                icon={<Lock size={18} />}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: theme.sub, padding: 0, display: "flex" }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                error={errors.confirmPassword}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            type="submit"
                            disabled={isLoading}
                            style={{
                                background: `linear-gradient(135deg, ${theme.blue}, ${theme.blue2})`,
                                color: "white",
                                padding: "16px",
                                borderRadius: 16,
                                border: "none",
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                marginTop: 8,
                                boxShadow: "0 8px 20px rgba(21, 96, 232, 0.25)"
                            }}
                        >
                            {isLoading ? "Updating Password..." : "Change Password"}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
