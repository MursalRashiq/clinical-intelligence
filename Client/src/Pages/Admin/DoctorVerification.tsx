import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FRONTEND_ROUTES } from "../../utils/constants";
import {
  ArrowLeft,
  Mail,
  Phone,
  ChevronDown,
  GraduationCap,
  FilePlus2,
  Download,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";
import Sidebar from "../../components/Admin/Sidebar";
import TopNav from "../../components/Admin/TopNav";
import { theme as t } from "../../theme";
import ConfirmModal from "../../components/Ui/ConfirmModal";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DoctorRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  experience: string;
  speciality: string;
  fees: number;
  address: string;
  degreeCertificate?: string;
  medicalCertificate?: string;
  degreeVerified?: boolean;
  medicalVerified?: boolean;
  qualifications?: string[];
  profileImage?: string;
}

// ─── Certificate Card ───────────────────────────────────────────────────────────
interface CertCardProps {
  title: string;
  subtitle: string;
  verified: boolean;
  accentColor: string;
  accentLight: string;
  icon: React.ReactNode;
  imageUrl?: string;
}

const CertificateCard = ({
  title,
  subtitle,
  verified,
  accentColor,
  accentLight,
  icon,
  imageUrl,
}: CertCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        border: `1.5px solid ${t.border}`,
        borderRadius: 16,
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentLight})`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {icon}
        <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{title}</span>
      </div>

      {/* Preview */}
      <div
        style={{ background: t.blueXLight, padding: 20, position: "relative", cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (imageUrl) window.open(imageUrl, "_blank");
        }}
      >
        <div
          style={{
            background: "#e8f0fb",
            borderRadius: 12,
            border: `1px solid ${t.border}`,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {imageUrl && !imageUrl.toLowerCase().includes('.pdf') ? (
            <img
              src={imageUrl}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ color: accentColor, opacity: 0.7 }}>{icon}</div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: accentColor,
                  textAlign: "center",
                  padding: "0 16px",
                }}
              >
                {subtitle}
              </span>
              <span style={{ fontSize: 11, color: t.sub }}>{imageUrl ? 'View Document' : 'No Document Found'}</span>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(21,96,232,0.1)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "white",
                  color: t.blue,
                  borderRadius: 8,
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                View Certificate
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {verified ? (
            <CheckCircle2 size={14} color={t.teal} />
          ) : (
            <Clock3 size={14} color="#F59E0B" />
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: verified ? t.teal : "#D97706",
              background: verified ? "#e1f5ee" : "#FEF3C7",
              padding: "3px 10px",
              borderRadius: 100,
            }}
          >
            {verified ? "Verified" : "Pending Review"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (imageUrl) window.open(imageUrl, "_blank");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            color: accentColor,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Download size={13} />
          Download
        </button>
      </div>
    </div>
  );
};

// ─── Info Field ─────────────────────────────────────────────────────────────────
const InfoField = ({
  label,
  value,
  isSelect = false,
}: {
  label: string;
  value: string;
  isSelect?: boolean;
}) => (
  <div
    style={{
      background: t.blueXLight,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: "12px 16px",
    }}
  >
    <div
      style={{
        fontSize: 10,
        color: t.sub,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        marginBottom: 6,
      }}
    >
      {label}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{value}</div>
      {isSelect && <ChevronDown size={14} color={t.sub} />}
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import adminService from "../../services/AdminService";

const DoctorRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState<DoctorRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        const res = await adminService.getDoctorRequestDetails(id);
        if (res.success && res.data) {
          const d = res.data;
          setDoctor({
            id: d.customId || d.id,
            name: d.name,
            email: d.email,
            phone: d.phone || "N/A",
            department: d.department || "General",
            experience: `${d.experienceYears || 0} Years`,
            speciality: d.specialties?.[0] || d.department || "General",
            fees: d.VideoFees || 0,
            address: "N/A", // Backend doesn't provide address right now
            degreeCertificate: d.documents?.[0] || undefined,
            medicalCertificate: d.documents?.[1] || undefined,
            degreeVerified: d.status === "Approved" || d.status === "Accepted",
            medicalVerified: d.status === "Approved" || d.status === "Accepted",
            qualifications: d.qualifications || [],
            profileImage: d.profileImage || undefined,
          });
        } else {
          toast.error(res.message || "Failed to fetch details");
          navigate(FRONTEND_ROUTES.ADMIN_DOCTOR_REQUESTS);
        }
      } catch (err) {
        toast.error("Error fetching doctor details");
        navigate(FRONTEND_ROUTES.ADMIN_DOCTOR_REQUESTS);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, navigate]);

  const handleAccept = () => {
    setShowAcceptConfirm(true);
  };

  const confirmAccept = async () => {
    if (!id) return;
    try {
      const res = await adminService.approveDoctorRequest(id);
      if (res.success) {
        toast.success("Doctor request accepted!");
        setShowAcceptConfirm(false);
        navigate(FRONTEND_ROUTES.ADMIN_DOCTOR_REQUESTS);
      } else {
        toast.error(res.message || "Failed to accept doctor request");
      }
    } catch {
      toast.error("Failed to accept doctor request");
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setRejecting(true);
    try {
      const res = await adminService.rejectDoctorRequest(id, rejectReason);
      if (res.success) {
        toast.success("Doctor request rejected!");
        setShowRejectModal(false);
        navigate(FRONTEND_ROUTES.ADMIN_DOCTOR_REQUESTS);
      } else {
        toast.error(res.message || "Failed to reject doctor request");
      }
    } catch {
      toast.error("Failed to reject doctor request");
    } finally {
      setRejecting(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: 20,
    boxShadow: "0 4px 20px rgba(21,96,232,0.05)",
    border: `1.5px solid ${t.border}`,
    padding: 24,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f4f7fe 0%, #eaf0fd 60%, #e0edfb 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Desktop Sidebar */}
      <div
        style={{ width: 256, position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50 }}
        className="hidden lg:block"
      >
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 60 }}
            className="lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(15,28,46,0.4)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 30, stiffness: 450 }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 256,
                background: "white",
                boxShadow: "24px 0 48px rgba(0,0,0,0.1)",
              }}
            >
              <Sidebar onMobileClose={() => setSidebarOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 256 }}
        className="lg:pl-64"
      >
        {/* Top Nav */}
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main style={{ flex: 1, padding: "28px clamp(16px, 4vw, 40px)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* Back */}
            <button
              onClick={() => navigate(FRONTEND_ROUTES.ADMIN_DASHBOARD)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                color: t.blue,
                background: "none",
                border: "none",
                cursor: "pointer",
                marginBottom: 20,
                padding: 0,
              }}
            >
              <ArrowLeft size={16} />
              Doctor Details
            </button>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={cardStyle}
            >
              {/* Profile Header */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  background: t.blueXLight,
                  borderRadius: 14,
                  border: `1px solid ${t.border}`,
                  marginBottom: 24,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: doctor.profileImage ? "none" : `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                    border: doctor.profileImage ? `2px solid ${t.blueLight}` : "none",
                  }}
                >
                  {doctor.profileImage ? (
                    <img 
                      src={doctor.profileImage} 
                      alt={doctor.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div
                    style={{ fontSize: 11, color: t.blue, fontWeight: 700, marginBottom: 2 }}
                  >
                    {doctor.id}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>
                    {doctor.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: t.sub,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Mail size={11} />
                      {doctor.email.charAt(0).toUpperCase() + doctor.email.slice(1)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: t.sub,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Phone size={11} />
                      {doctor.phone}
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div style={{ textAlign: "center", minWidth: 80 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: t.sub,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: 4,
                    }}
                  >
                    Department
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
                    {doctor.department}
                  </div>
                </div>

                {/* Experience Badge */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
                    color: "white",
                    borderRadius: "50%",
                    width: 52,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: "center",
                    lineHeight: 1.3,
                    flexShrink: 0,
                  }}
                >
                  {doctor.experience.split(" ")[0]}
                  <br />
                  {doctor.experience.split(" ")[1] || "Years"}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                  <button
                    onClick={handleAccept}
                    style={{
                      padding: "8px 18px",
                      background: "white",
                      color: t.blue2,
                      border: `1.5px solid ${t.blue2}`,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = t.blueLight)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <CheckCircle2 size={14} />
                    Accept
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    style={{
                      padding: "8px 18px",
                      background: "white",
                      color: "#f43f5e",
                      border: "1.5px solid #f43f5e",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fff1f2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </div>

              {/* Information Section */}
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontWeight: 700,
                  color: t.text,
                  fontSize: 15,
                  marginBottom: 14,
                }}
              >
                Information
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14,
                  marginBottom: 24,
                }}
              >
                <InfoField label="Name" value={doctor.name} />
                <InfoField label="Email" value={doctor.email} />
                <InfoField label="Experience" value={doctor.experience} />
                <InfoField label="Speciality" value={doctor.speciality} isSelect />
                <InfoField label="Fees (₹)" value={String(doctor.fees)} />
                <InfoField label="Address" value={doctor.address} />
              </div>

              {/* Divider */}
              <div
                style={{ height: 1, background: t.border, marginBottom: 24 }}
              />

              {/* Certificates Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: t.blue,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 700,
                    color: t.text,
                    fontSize: 15,
                  }}
                >
                  Uploaded Certificates
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 20,
                }}
              >
                <CertificateCard
                  title="Degree Certificate"
                  subtitle={doctor.qualifications?.[0] || "Bachelor's Degree"}
                  verified={doctor.degreeVerified ?? false}
                  accentColor={t.blue}
                  accentLight={t.blue2}
                  imageUrl={doctor.degreeCertificate}
                  icon={<GraduationCap size={32} color={t.blue} strokeWidth={1.5} />}
                />
                <CertificateCard
                  title="Medical Registration Certificate"
                  subtitle={`${doctor.speciality} Specialist`}
                  verified={doctor.medicalVerified ?? false}
                  accentColor={t.teal}
                  accentLight={t.brandLight}
                  imageUrl={doctor.medicalCertificate}
                  icon={<FilePlus2 size={32} color={t.teal} strokeWidth={1.5} />}
                />
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !rejecting && setShowRejectModal(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(15,28,46,0.6)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 420,
                background: "white",
                borderRadius: 20,
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>Reject Doctor Request</h3>
                <button
                  onClick={() => !rejecting && setShowRejectModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: t.sub, padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: 14, color: t.sub, marginBottom: 16, lineHeight: 1.5 }}>
                Please provide a reason for rejecting Dr. {doctor.name}'s verification request. This reason will be visible to the doctor.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Medical certificate is expired..."
                disabled={rejecting}
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 12,
                  borderRadius: 12,
                  border: `1.5px solid ${t.border}`,
                  fontSize: 14,
                  resize: "vertical",
                  marginBottom: 20,
                  fontFamily: "inherit",
                  outline: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = t.blue}
                onBlur={(e) => e.target.style.borderColor = t.border}
              />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejecting}
                  style={{
                    padding: "10px 16px",
                    background: "white",
                    border: `1.5px solid ${t.border}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: rejecting ? "not-allowed" : "pointer",
                    color: t.sub,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  style={{
                    padding: "10px 16px",
                    background: "#f43f5e",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: rejecting ? "not-allowed" : "pointer",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: rejecting ? 0.7 : 1,
                  }}
                >
                  {rejecting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .lg\\:pl-64 { padding-left: 256px !important; }
        @media (max-width: 1024px) {
          .lg\\:pl-64 { padding-left: 0 !important; }
          .hidden.lg\\:block { display: none !important; }
          .lg\\:hidden { display: flex !important; }
        }
        .lg\\:hidden { display: none; }
        body { margin: 0; }
        * { box-sizing: border-box; }
      `}</style>

      <ConfirmModal
        isOpen={showAcceptConfirm}
        onClose={() => setShowAcceptConfirm(false)}
        onConfirm={confirmAccept}
        title="Approve Doctor?"
        message={`Are you sure you want to approve Dr. ${doctor?.name}? This will grant them access to the platform.`}
        confirmText="Approve"
        type="info"
      />
    </div>
  );
};

export default DoctorRequestDetails;
