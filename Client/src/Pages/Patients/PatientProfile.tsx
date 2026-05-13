import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser, logout, updateUser } from "../../redux/user/userSlice";
import Cropper from 'react-easy-crop';
import getCroppedImg from "../../utils/cropImage";
import AuthService from "../../services/AuthService";
import PatientService from "../../services/PatientService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  icon: string;
  href?: string;
  action?: () => void;
  badge?: number;
  active?: boolean;
}

interface ProfileData {
  name: string;
  patientId: string;
  gender: string;
  age: string;
  phone: string;
  email: string;
  dob: string;
  bloodGroup: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}


// ─── Sidebar Nav Item ──────────────────────────────────────────────────────────
function NavLink({ item }: { item: NavItem }) {
  const [hovered, setHovered] = useState(false);
  const isActive = item.active;

  const handleClick = (e: React.MouseEvent) => {
    if (item.action) {
      e.preventDefault();
      item.action();
    }
  };

  return (
    <a
      href={item.href || "#"}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? "white" : hovered ? "var(--blue)" : "var(--sub)",
        background: isActive
          ? "linear-gradient(135deg, var(--blue), var(--blue2))"
          : hovered
            ? "var(--blue-xlight)"
            : "transparent",
        transition: "all 0.18s",
        boxShadow: isActive ? "0 4px 14px rgba(21,96,232,.28)" : "none",
        position: "relative",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} width={16} height={16}>
        <path d={item.icon} />
      </svg>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span
          style={{
            width: 20, height: 20, borderRadius: "50%",
            background: "#f59e0b",
            color: "white",
            fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {item.badge}
        </span>
      )}
    </a>
  );
}

// ─── Info Field ────────────────────────────────────────────────────────────────
function InfoField({ label, value, editing, name, onChange, type = "text", colSpan = 1 }: {
  label: string; value: string; editing: boolean; name: string;
  onChange: (n: string, v: string) => void; type?: string; colSpan?: number;
}) {
  return (
    <div style={{ gridColumn: `span ${colSpan}` }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: ".9px",
        color: "var(--sub)", marginBottom: 6,
      }}>
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          style={{
            width: "100%", padding: "11px 14px",
            border: "1.5px solid var(--blue)",
            borderRadius: 10, fontSize: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "var(--text)", background: "var(--blue-xlight)",
            outline: "none", transition: "all .2s",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div style={{
          padding: "11px 14px",
          border: "1.5px solid var(--border)",
          borderRadius: 10, fontSize: 14,
          color: value ? "var(--text)" : "var(--sub)",
          background: "var(--bg)",
          fontWeight: 500,
        }}>
          {value || "—"}
        </div>
      )}
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, lastUpdated, onEdit, onDelete }: {
  icon: string; title: string; lastUpdated?: string;
  onEdit?: () => void; onDelete?: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingBottom: 16, marginBottom: 24,
      borderBottom: "1.5px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--blue-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={2} width={15} height={15}>
            <path d={icon} />
          </svg>
        </div>
        <span style={{
          fontSize: 13, fontWeight: 800, color: "var(--text)",
          letterSpacing: ".8px", textTransform: "uppercase",
        }}>
          {title}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {lastUpdated && (
          <span style={{ fontSize: 11, color: "var(--sub)", fontWeight: 600 }}>
            Last Updated: {lastUpdated}
          </span>
        )}
        {onEdit && (
          <button onClick={onEdit} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--sub)", display: "flex", padding: 4, borderRadius: 6,
            transition: "color .2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--blue)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--sub)")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--sub)", display: "flex", padding: 4, borderRadius: 6,
            transition: "color .2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--sub)")}
          >
            {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg> */}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const handleLogout = async () => {
    await AuthService.logout();
    dispatch(logout());
    navigate(FRONTEND_ROUTES.LOGIN);
  };

  // If the server reports the account is blocked (403), log out immediately
  useEffect(() => {
    const handleBlocked = async () => {
      dispatch(logout());
      navigate(`${FRONTEND_ROUTES.LOGIN}?error=blocked`, { replace: true });
    };
    window.addEventListener("user:blocked", handleBlocked);
    return () => window.removeEventListener("user:blocked", handleBlocked);
  }, [dispatch, navigate]);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [referCopied, setReferCopied] = useState(false);

  // Image upload & crop states
  const [toast, setToast] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState<File | null>(null);
  const [cropModal, setCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name: currentUser?.name || "",
    patientId: currentUser?.id ? `PT${currentUser.id.substring(0, 6).toUpperCase()}` : "PT000000",
    gender: "",
    age: "",
    phone: "",
    email: currentUser?.email || "",
    dob: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const [draft, setDraft] = useState<ProfileData>(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await PatientService.getProfile();
        if (res.success) {
          const data = res.data;
          const mappedData = {
            name: data.name || "",
            patientId: data.customId || "PT000000",
            gender: data.gender || "",
            age: data.dob ? calculateAge(data.dob) : "",
            phone: data.phone || "",
            email: data.email || "",
            dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
            bloodGroup: data.bloodGroup || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "",
            pincode: data.pincode || "",
          };
          setProfile(mappedData);
          setDraft(mappedData);
          if (data.profileImage) {
            setAvatar(data.profileImage);
            dispatch(updateUser({ profileImage: data.profileImage }));
          }
        }
      } catch (error: any) {
        // 403 = account has been blocked by admin
        if (error?.response?.status === 403) {
          await AuthService.logout();
          dispatch(logout());
          navigate(`${FRONTEND_ROUTES.LOGIN}?error=blocked`, { replace: true });
          return;
        }
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [currentUser?.id]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleFieldChange = (name: string, value: string) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const savePersonal = async () => {
    try {
      const res = await PatientService.updateProfile(draft);
      if (res.success) {
        setProfile(draft);
        setEditingPersonal(false);
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        await AuthService.logout();
        dispatch(logout());
        navigate(`${FRONTEND_ROUTES.LOGIN}?error=blocked`, { replace: true });
        return;
      }
      console.error("Error updating personal info:", error);
    }
  };

  const saveAddress = async () => {
    try {
      const res = await PatientService.updateProfile(draft);
      if (res.success) {
        setProfile(draft);
        setEditingAddress(false);
      }
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditingPersonal(false);
    setEditingAddress(false);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  /** Validates image-only, then opens the crop modal */
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed (JPG, PNG, GIF, WebP, etc.)");
      e.target.value = "";
      return;
    }
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      showToast(`Image must be smaller than ${maxMB} MB.`);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = (_: any, pixels: any) => { setCroppedAreaPixels(pixels); };

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("profileImage", file);
      const res = await PatientService.updateProfile(formData);
      if (res?.success) {
        const newImgUrl = res.data?.profileImage;
        setAvatar(newImgUrl || null);
        setPreviewUrl(null);
        setSelectedImg(null);
        showToast("Profile picture updated!");
        dispatch(updateUser({ profileImage: newImgUrl }));
      } else {
        showToast(res?.message || "Upload failed.");
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        await AuthService.logout();
        dispatch(logout());
        navigate(`${FRONTEND_ROUTES.LOGIN}?error=blocked`, { replace: true });
        return;
      }
      showToast("Upload failed. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (blob) {
        const croppedFile = new File([blob], "profile-picture.jpg", { type: "image/jpeg" });
        setSelectedImg(croppedFile);
        setPreviewUrl(URL.createObjectURL(blob));
        setCropModal(false);
        await handleAvatarUpload(croppedFile);
      }
    } catch (e) {
      console.error(e);
      showToast("Cropping failed. Please try again.");
    }
  };

  const handleRefer = () => {
    navigator.clipboard.writeText("https://takecare.app/ref/PT254654");
    setReferCopied(true);
    setTimeout(() => setReferCopied(false), 2200);
  };

  const navItems: NavItem[] = [
    { label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z", href: "/dashboard" },
    { label: "My Appointments", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", href: "/appointments" },
    { label: "Wallet", icon: "M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7M16 2v4M8 2v4M3 10h18M22 19l-3 3-1.5-1.5", href: "/wallet" },
    { label: "Invoices", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8", href: "/invoices" },
    { label: "Message", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", href: "/messages", badge: 1 },
    { label: "Settings", icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 8v4l3 3", href: "/settings" },
    { label: "Change Password", icon: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4", href: FRONTEND_ROUTES.RESET_PASSWORD_LOGGED_IN },
    { label: "Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", href: "/profile", active: true },
    { label: "Logout", icon: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9", action: handleLogout },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #1560e8; --blue2: #0d4bc4;
          --teal: #00bfa5;
          --blue-light: #e8f0fe; --blue-xlight: #f4f7fe;
          --text: #0f1c2e; --sub: #5a6a80; --border: #dde6f5;
          --bg: #f4f7fe; --green: #16a34a; --red: #ef4444;
        }
        html, body { height: 100%; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(21,96,232,.15); }
          50%      { box-shadow: 0 0 0 12px rgba(21,96,232,.04); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .card {
          background: white;
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(21,96,232,.06);
          animation: fade-up .5s ease both;
        }
        .card:nth-child(2) { animation-delay: .08s; }
        .card:nth-child(3) { animation-delay: .16s; }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15,28,46,.45);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; animation: fade-up .2s ease both;
        }
        .modal-box {
          background: white; border-radius: 20px; padding: 36px;
          width: 100%; max-width: 380px; text-align: center;
          box-shadow: 0 20px 60px rgba(15,28,46,.2);
        }

        .avatar-wrap:hover .avatar-overlay { opacity: 1 !important; }

        @media (max-width: 900px) {
          .layout { flex-direction: column !important; }
          .sidebar { width: 100% !important; }
          .content { min-width: unset !important; }
        }
        @media (max-width: 520px) {
          .page-header { padding: 28px 20px 24px !important; }
          .fields-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Shared Navbar ── */}
      <Navbar activePage="Profile" />

      {/* ── Page header banner ── */}
      <div className="page-header" style={{
        background: "linear-gradient(135deg, #0d4bc4 0%, #1560e8 50%, #00bfa5 100%)",
        padding: "36px 48px 32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative crosses */}
        {[{ top: 24, left: 40 }, { top: 16, right: 80 }, { bottom: 20, left: "40%" }].map((pos, i) => (
          <div key={i} style={{ position: "absolute", ...pos, opacity: 0.12 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={20} height={20}>
              <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </div>
        ))}
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {["Home", "Profile"].map((crumb, i) => (
            <div key={crumb} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2.5} width={12} height={12}><polyline points="9 18 15 12 9 6" /></svg>}
              <span style={{ fontSize: 13, color: i === 1 ? "white" : "rgba(255,255,255,.65)", fontWeight: i === 1 ? 600 : 400 }}>{crumb}</span>
            </div>
          ))}
        </div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 700, color: "white", marginBottom: 6 }}>Profile</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)" }}>Book appointments with 500+ verified specialists across the country</p>
      </div>

      {/* ── Layout ── */}
      <div className="layout" style={{
        display: "flex", gap: 24,
        padding: "28px 48px 60px",
        maxWidth: 1200, margin: "0 auto",
        alignItems: "flex-start",
      }}>

        {/* ── Sidebar ── */}
        <div className="sidebar" style={{
          width: 240, flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Profile card */}
          <div style={{
            background: "white",
            border: "1.5px solid var(--border)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(21,96,232,.06)",
            animation: "fade-up .4s ease both",
          }}>
            {/* Banner */}
            <div style={{
              height: 80,
              background: "linear-gradient(135deg,#0d4bc4,#1560e8 60%,#00bfa5)",
              position: "relative",
            }}>
              {/* Medical pattern dots */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  width: 4, height: 4, borderRadius: "50%",
                  background: "rgba(255,255,255,.15)",
                  left: `${(i % 4) * 28 + 8}%`,
                  top: `${Math.floor(i / 4) * 38 + 10}%`,
                }} />
              ))}
            </div>

            {/* Avatar */}
            <div style={{ padding: "0 20px 20px", marginTop: -36 }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                {/* Avatar circle */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  border: "3px solid white",
                  background: "var(--blue-light)",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(21,96,232,.2)",
                  animation: "pulse-ring 3s ease-in-out infinite",
                  position: "relative",
                  filter: avatarUploading ? "brightness(0.6)" : "none",
                  transition: "filter .2s",
                }}>
                  {(previewUrl || avatar)
                    ? <img src={previewUrl || avatar!} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={1.5} width={30} height={30}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                      </svg>
                    </div>
                  }
                  {avatarUploading && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 20, height: 20, border: "3px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    </div>
                  )}
                </div>
                {/* Camera button */}
                {!avatarUploading && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    title="Change profile picture (images only)"
                    style={{
                      position: "absolute", bottom: 0, right: -2,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "linear-gradient(135deg,var(--blue2),var(--blue))",
                      border: "2px solid white", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(21,96,232,.4)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={11} height={11}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                )}
              </div>
              <input ref={fileRef} id="patientProfileUpload" type="file" accept="image/*" onChange={onImageChange} style={{ display: "none" }} />

              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, marginBottom: 6 }}>
                Patient ID · {profile.patientId}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--sub)" }}>
                <span>{profile.gender}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
                <span>{profile.age}</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{
            background: "white",
            border: "1.5px solid var(--border)",
            borderRadius: 20,
            padding: 12,
            boxShadow: "0 4px 24px rgba(21,96,232,.06)",
            display: "flex", flexDirection: "column", gap: 2,
            animation: "fade-up .45s ease both",
          }}>
            {navItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="content" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Tab */}
          <div style={{ animation: "fade-up .4s ease both" }}>
            <div style={{
              display: "inline-flex",
              background: "white",
              border: "1.5px solid var(--border)",
              borderRadius: 12, padding: 4,
              boxShadow: "0 2px 10px rgba(21,96,232,.06)",
            }}>
              <div style={{
                padding: "8px 20px", borderRadius: 9,
                background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                color: "white", fontSize: 13, fontWeight: 700,
                boxShadow: "0 3px 10px rgba(21,96,232,.28)",
              }}>
                Profile
              </div>
            </div>
          </div>

          {/* ── Personal Information ── */}
          <div className="card">
            <SectionHeader
              icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
              title="Personal Information"
              lastUpdated="24/10/2023"
              onEdit={() => { setDraft(profile); setEditingPersonal(true); }}
              onDelete={() => setShowDeleteModal(true)}
            />

            {/* Photo row */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
              {/* Avatar preview */}
              <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  border: "2.5px solid var(--border)",
                  background: "var(--bg)", overflow: "hidden",
                  filter: avatarUploading ? "brightness(0.6)" : "none",
                  transition: "filter .2s",
                  position: "relative",
                }}>
                  {(previewUrl || avatar)
                    ? <img src={previewUrl || avatar!} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--sub)" strokeWidth={1.5} width={28} height={28}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                      </svg>
                    </div>
                  }
                  {avatarUploading && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 20, height: 20, border: "3px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    </div>
                  )}
                </div>
                {!avatarUploading && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    title="Upload profile picture — images only (JPG, PNG, WebP, max 5 MB)"
                    style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "linear-gradient(135deg,var(--blue2),var(--blue))",
                      border: "2px solid white", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(21,96,232,.4)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={11} height={11}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Upload hints */}
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarUploading}
                  style={{
                    padding: "8px 16px", borderRadius: 9, cursor: avatarUploading ? "not-allowed" : "pointer",
                    border: "1.5px solid var(--blue)", background: "var(--blue-xlight)",
                    color: "var(--blue)", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 6,
                    marginBottom: 6, transition: "all .2s",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  {avatarUploading ? "Uploading…" : "Upload Photo"}
                </button>
                <p style={{ fontSize: 11, color: "var(--sub)", margin: 0 }}>
                  JPG, PNG, WebP, GIF · Max 5 MB · Images only
                </p>
              </div>
            </div>

            {/* Refer & Delete row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              <button
                onClick={handleRefer}
                style={{
                  flex: 1, minWidth: 180,
                  padding: "13px 20px",
                  borderRadius: 11, border: "none",
                  background: referCopied
                    ? "linear-gradient(135deg,var(--green),#15803d)"
                    : "linear-gradient(135deg,var(--blue),var(--blue2))",
                  color: "white",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(21,96,232,.25)",
                  transition: "all .3s",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={15} height={15}>
                  {referCopied
                    ? <polyline points="20 6 9 17 4 12" />
                    : <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  }
                </svg>
                {referCopied ? "Link Copied!" : "Refer Friends"}
              </button>

            </div>

            {/* Information heading */}
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 3, height: 16, borderRadius: 2, background: "linear-gradient(var(--blue),var(--teal))" }} />
              Information
            </div>

            {/* Fields grid */}
            <div className="fields-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              <InfoField label="Full Name" value={profile.name} editing={false} name="name" onChange={() => { }} colSpan={2} />
              <InfoField label="Date of Birth" value={profile.dob} editing={false} name="dob" onChange={() => { }} type="date" />
              <InfoField label="Gender" value={profile.gender} editing={false} name="gender" onChange={() => { }} />
              <InfoField label="Phone Number" value={profile.phone} editing={false} name="phone" onChange={() => { }} type="tel" />
              <InfoField label="Email Address" value={profile.email} editing={false} name="email" onChange={() => { }} type="email" />
              <InfoField label="Blood Group" value={profile.bloodGroup} editing={false} name="bloodGroup" onChange={() => { }} />
            </div>
          </div>

          {/* ── Address ── */}
          <div className="card">
            <SectionHeader
              icon="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
              title="Address"
              onEdit={() => { setDraft(profile); setEditingAddress(true); }}
            />

            {/* Add new address */}
            {!profile.address && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <button
                  onClick={() => { setDraft(profile); setEditingAddress(true); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8,
                    border: "1.5px dashed rgba(21,96,232,.3)",
                    background: "var(--blue-xlight)", color: "var(--blue)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    transition: "all .2s",
                  }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Address
                </button>
              </div>
            )}

            {/* Address fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <InfoField label="Address" value={profile.address} editing={false} name="address" onChange={() => { }} colSpan={1} />
              <div className="fields-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                <InfoField label="City" value={profile.city} editing={false} name="city" onChange={() => { }} />
                <InfoField label="State" value={profile.state} editing={false} name="state" onChange={() => { }} />
                <InfoField label="Country" value={profile.country} editing={false} name="country" onChange={() => { }} />
                <InfoField label="Pincode" value={profile.pincode} editing={false} name="pincode" onChange={() => { }} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Shared Footer ── */}
      <Footer />

      {/* ── Personal Info Modal ── */}
      {editingPersonal && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-box" style={{ maxWidth: 640, textAlign: 'left', overflowY: 'auto', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>
              Edit Personal Information
            </div>
            <div className="fields-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              <InfoField label="Full Name" value={draft.name} editing={true} name="name" onChange={handleFieldChange} colSpan={2} />
              <InfoField label="Date of Birth" value={draft.dob} editing={true} name="dob" onChange={handleFieldChange} type="date" />
              <InfoField label="Gender" value={draft.gender} editing={true} name="gender" onChange={handleFieldChange} />
              <InfoField label="Phone Number" value={draft.phone} editing={true} name="phone" onChange={handleFieldChange} type="tel" />
              <InfoField label="Email Address" value={draft.email} editing={true} name="email" onChange={handleFieldChange} type="email" />
              <InfoField label="Blood Group" value={draft.bloodGroup} editing={true} name="bloodGroup" onChange={handleFieldChange} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={cancelEdit} style={{
                padding: "10px 22px", borderRadius: 10,
                border: "1.5px solid var(--border)", background: "white",
                color: "var(--sub)", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={savePersonal} style={{
                padding: "10px 22px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(21,96,232,.28)",
              }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Address Modal ── */}
      {editingAddress && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-box" style={{ maxWidth: 640, textAlign: 'left', overflowY: 'auto', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>
              Edit Address
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <InfoField label="Address" value={draft.address} editing={true} name="address" onChange={handleFieldChange} colSpan={1} />
              <div className="fields-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                <InfoField label="City" value={draft.city} editing={true} name="city" onChange={handleFieldChange} />
                <InfoField label="State" value={draft.state} editing={true} name="state" onChange={handleFieldChange} />
                <InfoField label="Country" value={draft.country} editing={true} name="country" onChange={handleFieldChange} />
                <InfoField label="Pincode" value={draft.pincode} editing={true} name="pincode" onChange={handleFieldChange} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={cancelEdit} style={{
                padding: "10px 22px", borderRadius: 10,
                border: "1.5px solid var(--border)", background: "white",
                color: "var(--sub)", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={saveAddress} style={{
                padding: "10px 22px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(21,96,232,.28)",
              }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── Crop Modal ── */}
      {cropModal && imageToCrop && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
          <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,.5)" }}>
            {/* Header */}
            <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", margin: 0, fontFamily: "'Fraunces',serif" }}>Crop Profile Picture</h3>
              <button onClick={() => setCropModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            {/* Crop area */}
            <div style={{ position: "relative", width: "100%", height: 380, background: "#000" }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>
            {/* Controls */}
            <div style={{ padding: 28 }}>
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--sub)" }}>Zoom</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range" value={zoom} min={1} max={3} step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--blue)", cursor: "pointer" }}
                />
              </div>
              <div style={{ fontSize: 11, color: "var(--sub)", marginBottom: 20, textAlign: "center" }}>
                Only image files accepted · Drag to reposition · Scroll to zoom
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setCropModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1.5px solid var(--border)", background: "white", color: "var(--sub)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCrop}
                  style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,var(--blue2),var(--blue))", color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(21,96,232,.3)" }}
                >
                  Apply & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div style={{
        position: "fixed", bottom: 28, right: 28,
        background: toast.toLowerCase().includes("fail") || toast.toLowerCase().includes("only") || toast.toLowerCase().includes("smaller")
          ? "linear-gradient(135deg,#dc2626,#b91c1c)"
          : "linear-gradient(135deg,var(--blue2),var(--blue))",
        color: "white", padding: "12px 22px", borderRadius: 12,
        fontWeight: 600, fontSize: 13,
        boxShadow: "0 8px 24px rgba(21,96,232,.35)",
        display: "flex", alignItems: "center", gap: 8,
        zIndex: 999,
        opacity: toast ? 1 : 0,
        transform: toast ? "translateY(0)" : "translateY(16px)",
        transition: "all .3s",
        pointerEvents: "none",
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={15} height={15}>
          {toast.toLowerCase().includes("fail") || toast.toLowerCase().includes("only") || toast.toLowerCase().includes("smaller")
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <polyline points="20 6 9 17 4 12" />
          }
        </svg>
        {toast}
      </div>
    </>
  );
}
