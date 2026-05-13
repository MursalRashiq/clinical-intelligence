import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser, logout, setUser } from "../../redux/user/userSlice";
import AuthService from "../../services/AuthService";
import PatientService from "../../services/PatientService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import DoctorSidebar from "../../components/Doctor/SideBar";
import TopNav from "../../components/Doctor/TopNav";
import Cropper from 'react-easy-crop';
import getCroppedImg from "../../utils/cropImage";

const SPECIALTIES = ["General Physician", "Dentist", "Orthodontist", "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician", "Psychiatrist", "Orthopedic", "Gynecologist", "Endodontist", "Periodontist"];

interface DoctorProfile {
  fullName: string; email: string; phone: string;
  address: string; city: string; state: string; country: string; pincode: string;
  bloodGroup: string; experience: string; specialty: string;
  videoFee: string; chatFee: string; about: string;
  languages: string[]; profileImage: string | null;
  licenseNumber: string; ratingAvg: number; ratingCount: number;
  verificationDocuments: string[];
  qualifications: string[];
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 36, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#191b23" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#424655", fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e7e7f3", color: "#424655", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onSave} disabled={saving} style={{ padding: "10px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0a2d78,#1560e8)", color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? .75 : 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field components ──────────────────────────────────────────────────────────
function MField({ label, value, onChange, type = "text", disabled, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} disabled={disabled} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", background: disabled ? "#f8fafc" : "white", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
        onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = "#1560e8"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#dde6f5"; }}
      />
    </div>
  );
}

function MSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", background: "white", fontFamily: "inherit", outline: "none" }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Section Card with edit icon ───────────────────────────────────────────────
function SectionCard({ title, icon, onEdit, children }: {
  title: string; icon: string; onEdit?: () => void; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1.5px solid #f0f0f8" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, marginBottom: 20, borderBottom: "1.5px solid #f0f0f8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#1560e8" }}>{icon}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#191b23", letterSpacing: ".8px", textTransform: "uppercase" }}>{title}</span>
        </div>
        {onEdit && (
          <button onClick={onEdit} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: hov ? "#1560e8" : "#5a6a80", transition: "color .2s" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
          </button>
        )}

        {/* ── Crop Modal ── */}
        {/* Note: logic for cropModal UI would be injected here if this component were inside the page logic scope */}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#5a6a80", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: "0.9rem", color: value ? "#191b23" : "#aab4c4", fontWeight: 500 }}>{value || "—"}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorProfilePage() {
  const dispatch = useDispatch(); const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav] = useState("Profile Settings");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"personal" | "professional" | "address" | "languages" | null>(null);
  const [newLang, setNewLang] = useState("");

  const doctorName = currentUser?.name ? `Dr. ${currentUser.name}` : "Doctor";

  const empty: DoctorProfile = {
    fullName: currentUser?.name || "", email: currentUser?.email || "", phone: "",
    address: "", city: "", state: "", country: "", pincode: "",
    bloodGroup: "", experience: "", specialty: "",
    videoFee: "", chatFee: "", about: "", languages: [],
    profileImage: currentUser?.profileImage || null,
    licenseNumber: "", ratingAvg: 0, ratingCount: 0,
    verificationDocuments: [], qualifications: [],
  };

  const [profile, setProfile] = useState<DoctorProfile>(empty);
  const [draft, setDraft] = useState<DoctorProfile>(empty);

  useEffect(() => {
    // Fetch both doctor-specific data AND the user profile (which returns presigned S3 URLs)
    Promise.all([
      AuthService.getDoctorProfile(),
      PatientService.getProfile()
    ]).then(([doctorRes, userRes]) => {
      const d = doctorRes?.success ? doctorRes.data : null;
      // user profile endpoint returns the unified DTO with presigned profileImage
      const u = userRes?.success ? userRes.data : null;

      // Populate from doctor doc's populated userId as fallback
      const docUser = (d?.userId && typeof d.userId === 'object') ? d.userId as any : null;

      const mapped: DoctorProfile = {
        fullName: u?.name || docUser?.name || currentUser?.name || "",
        email: u?.email || docUser?.email || currentUser?.email || "",
        phone: u?.phone || docUser?.phone || "",
        address: u?.address || docUser?.address || "",
        city: u?.city || docUser?.city || "",
        state: u?.state || docUser?.state || "",
        country: u?.country || docUser?.country || "",
        pincode: u?.pincode || docUser?.pincode || "",
        bloodGroup: u?.bloodGroup || docUser?.bloodGroup || "",
        experience: d?.experienceYears != null ? `${d.experienceYears}` : "",
        specialty: d?.specialty || "",
        videoFee: d?.VideoFees != null ? `${d.VideoFees}` : "",
        chatFee: d?.ChatFees != null ? `${d.ChatFees}` : "",
        about: d?.about || "",
        languages: d?.languages || [],
        // Use the presigned URL from user profile endpoint (u.profileImage) first
        profileImage: u?.profileImage || docUser?.profileImage || currentUser?.profileImage || null,
        licenseNumber: d?.licenseNumber || "",
        ratingAvg: d?.ratingAvg || 0,
        ratingCount: d?.ratingCount || 0,
        verificationDocuments: d?.verificationDocuments || [],
        qualifications: d?.qualifications || [],
      };
      setProfile(mapped); setDraft(mapped);
    }).catch(err => {
      if (err?.response?.status === 403) { dispatch(logout()); navigate(`${FRONTEND_ROUTES.DOCTOR_LOGIN}?error=blocked`, { replace: true }); }
      console.error("Failed to fetch doctor profile:", err);
    });
  }, [currentUser]);

  const openModal = (m: typeof modal) => { setDraft({ ...profile }); setModal(m); };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", draft.fullName);
      formData.append("phone", draft.phone);
      formData.append("bloodGroup", draft.bloodGroup);
      formData.append("address", draft.address);
      formData.append("city", draft.city);
      formData.append("state", draft.state);
      formData.append("country", draft.country);
      formData.append("pincode", draft.pincode);

      const additionalInfo = {
        specialty: draft.specialty,
        VideoFees: draft.videoFee ? Number(draft.videoFee) : null,
        ChatFees: draft.chatFee ? Number(draft.chatFee) : null,
        licenseNumber: draft.licenseNumber,
        languages: draft.languages,
        experienceYears: draft.experience ? Number(draft.experience) : null,
        about: draft.about,
      };
      formData.append("additionalInformation", JSON.stringify(additionalInfo));

      if (selectedImg) {
        formData.append("profileImage", selectedImg);
      }

      const res = await PatientService.updateProfile(formData);
      if (res?.success) {
        // The unified DTO is a flat object: res.data.profileImage (no nested .user)
        const updatedProfile = res.data;
        const updated: DoctorProfile = {
          ...draft,
          profileImage: updatedProfile?.profileImage || draft.profileImage
        };
        setProfile(updated);
        setDraft(updated);
        setSelectedImg(null);
        setPreviewUrl(null);
        setModal(null);
        showToast("Profile updated successfully!");

        // Sync new name/image into Redux store
        const userInfo = AuthService.getCurrentUserInfo();
        if (userInfo) {
          dispatch(setUser({ ...userInfo, profileImage: updatedProfile?.profileImage, name: updatedProfile?.name } as any));
        }
      } else {
        showToast(res?.message || "Update failed.");
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      showToast("Update failed. Please try again.");
    } finally { setSaving(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── Change Password ──────────────────────────────────────────────────────────
  const [pwModal, setPwModal] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [pwVisible, setPwVisible] = useState({ old: false, new: false, confirm: false });

  const openPwModal = () => { setPwForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" }); setPwError(""); setPwModal(true); };
  const closePwModal = () => { setPwModal(false); setPwError(""); };

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmNewPassword) {
      setPwError("All fields are required."); return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters."); return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwError("New passwords do not match."); return;
    }
    setPwSaving(true);
    try {
      const res = await AuthService.changePassword(
        { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword, confirmNewPassword: pwForm.confirmNewPassword },
        "doctor"
      );
      if (res?.success) {
        closePwModal();
        showToast("Password changed successfully!");
      } else {
        setPwError(res?.message || "Failed to change password.");
      }
    } catch (err: any) {
      setPwError(err?.message || "Something went wrong.");
    } finally { setPwSaving(false); }
  };
  const [upDoc, setUpDoc] = useState<number | null>(null);
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpDoc(index);
    try {
      const formData = new FormData();
      if (index === 0) formData.append("medicalLicense", file);
      else formData.append("degreeCertificate", file);
      const res = await AuthService.updateDoctorDocuments(formData);
      if (res?.success) {
        setProfile(p => {
          const docs = [...p.verificationDocuments];
          if (res.data?.verificationDocuments) {
            docs[index] = res.data.verificationDocuments[index];
          }
          return { ...p, verificationDocuments: docs };
        });
        showToast(`${index === 0 ? "License" : "Degree"} updated successfully!`);
      }
    } catch (err) {
      console.error("Document upload failed:", err);
      showToast("Upload failed.");
    } finally { setUpDoc(null); }
  };

  const handleViewDoc = async (index: number) => {
    try {
      const res = await AuthService.getDocumentUrl(index);
      if (res?.success && res.data?.url) {
        window.open(res.data.url, "_blank");
      } else {
        showToast("Failed to generate view link.");
      }
    } catch (err) {
      console.error("View document failed:", err);
      showToast("Error opening document.");
    }
  };
  const set = (k: keyof DoctorProfile, v: string) => setDraft(p => ({ ...p, [k]: v }));
  const [selectedImg, setSelectedImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cropping States
  const [cropModal, setCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.fullName);
      formData.append("profileImage", file);
      const res = await PatientService.updateProfile(formData);
      if (res?.success) {
        const newImgUrl = res.data?.profileImage;
        setProfile(p => ({ ...p, profileImage: newImgUrl || p.profileImage }));
        setPreviewUrl(null);
        setSelectedImg(null);
        showToast("Profile picture updated!");
        const userInfo = AuthService.getCurrentUserInfo();
        if (userInfo) {
          dispatch(setUser({ ...userInfo, profileImage: newImgUrl } as any));
        }
      } else {
        showToast(res?.message || "Upload failed.");
      }
    } catch (e) {
      console.error(e);
      showToast("Upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], "profile-picture.jpg", { type: "image/jpeg" });
        const objectUrl = URL.createObjectURL(croppedBlob);
        setSelectedImg(croppedFile);
        setPreviewUrl(objectUrl);
        setCropModal(false);
        // Upload immediately after cropping
        await handleAvatarUpload(croppedFile);
      }
    } catch (e) {
      console.error(e);
      showToast("Cropping failed");
    }
  };

  const addLang = () => { const t = newLang.trim(); if (t && !draft.languages.includes(t)) setDraft(p => ({ ...p, languages: [...p.languages, t] })); setNewLang(""); };
  const removeLang = (l: string) => setDraft(p => ({ ...p, languages: p.languages.filter(x => x !== l) }));

  const avatarSrc = previewUrl || profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "D")}&background=1560e8&color=fff&size=128`;

  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;}
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        *{box-sizing:border-box;}
      `}</style>

      <div style={{ fontFamily: "Inter,sans-serif", background: "#faf8ff", minHeight: "100vh", color: "#191b23" }}>
        <DoctorSidebar doctorName={doctorName} specialty={(currentUser as any)?.specialty || profile.specialty || "Specialist"} activeNav={activeNav} onNavChange={setActiveNav} onLogout={async () => { await AuthService.logout(); dispatch(logout()); navigate(FRONTEND_ROUTES.DOCTOR_LOGIN); }} />
        <TopNav />

        <main style={{ marginLeft: 256, paddingTop: 64, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 36px" }}>
            <h1 style={{ fontFamily: "Manrope,sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#191b23", marginBottom: 8 }}>Profile Settings</h1>
            <p style={{ color: "#424655", marginBottom: 36 }}>Manage your professional profile and account details.</p>

            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, alignItems: "start" }}>

              {/* ── Left ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Avatar card */}
                <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1.5px solid #f0f0f8", textAlign: "center" }}>
                  <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                    <img src={avatarSrc} alt={profile.fullName} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", outline: "4px solid rgba(21,96,232,.08)", filter: avatarUploading ? "brightness(0.6)" : "none", transition: "filter .2s" }} />
                    {avatarUploading ? (
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 24, height: 24, border: "3px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      </div>
                    ) : (
                      <button
                        onClick={() => document.getElementById("profileUpload")?.click()}
                        style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0a2d78,#1560e8)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(21,96,232,.35)" }}
                        title="Change profile picture"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>photo_camera</span>
                      </button>
                    )}
                    <input id="profileUpload" type="file" style={{ display: "none" }} onChange={onImageChange} accept="image/*" />
                  </div>
                  {previewUrl && !avatarUploading && (
                    <p style={{ fontSize: "0.7rem", color: "#1560e8", fontWeight: 600, marginBottom: 8 }}>Uploading...</p>
                  )}
                  <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: "1rem", color: "#191b23" }}>{profile.fullName || doctorName}</h2>
                  {profile.specialty && <span style={{ display: "inline-block", marginTop: 6, padding: "3px 14px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 700, background: "#58b9fd", color: "#00476d", letterSpacing: ".05em" }}>{profile.specialty.toUpperCase()}</span>}
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    {[{ l: "Experience", v: profile.experience ? `${profile.experience}y` : "—" }, { l: "Rating", v: profile.ratingCount > 0 ? `${profile.ratingAvg.toFixed(1)}/5` : "—" }].map(({ l, v }) => (
                      <div key={l} style={{ flex: 1, padding: "8px", borderRadius: 10, background: "#f2f3fe", textAlign: "center" }}>
                        <p style={{ fontSize: "0.65rem", color: "#424655", fontWeight: 500, marginBottom: 2 }}>{l}</p>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#334e99" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <SectionCard title="Account Security" icon="security">
                  <p style={{ fontSize: "0.85rem", color: "#424655", marginBottom: 16 }}>Keep your account safe by updating your password regularly.</p>
                  <button onClick={openPwModal}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#e7e7f3", color: "#334e99", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_reset</span>
                    Change Password
                  </button>
                </SectionCard>
              </div>

              {/* ── Right ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Personal Info */}
                <SectionCard title="Personal Information" icon="person" onEdit={() => openModal("personal")}>
                  <div style={grid2}>
                    <InfoRow label="Full Name" value={profile.fullName} />
                    <InfoRow label="Email" value={profile.email} />
                    <InfoRow label="Phone" value={profile.phone} />
                    <InfoRow label="Blood Group" value={profile.bloodGroup} />
                    <InfoRow label="License No." value={profile.licenseNumber} />
                    <InfoRow label="Experience" value={profile.experience ? `${profile.experience} years` : ""} />
                  </div>
                  {profile.about && <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#f8faff", border: "1px solid #e8f0fe" }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#5a6a80", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>About</p>
                    <p style={{ fontSize: "0.875rem", color: "#191b23", lineHeight: 1.6 }}>{profile.about}</p>
                  </div>}
                </SectionCard>

                {/* Address */}
                <SectionCard title="Address Information" icon="location_on" onEdit={() => openModal("address")}>
                  <div style={grid2}>
                    <InfoRow label="Address" value={profile.address} />
                    <InfoRow label="City" value={profile.city} />
                    <InfoRow label="State" value={profile.state} />
                    <InfoRow label="Country" value={profile.country} />
                    <InfoRow label="Pincode" value={profile.pincode} />
                  </div>
                </SectionCard>

                {/* Professional */}
                <SectionCard title="Professional Details" icon="work" onEdit={() => openModal("professional")}>
                  <div style={grid2}>
                    <InfoRow label="Specialty" value={profile.specialty} />
                    <InfoRow label="Video Fee" value={profile.videoFee ? `₹${profile.videoFee}` : ""} />
                    {/* <InfoRow label="Chat Fee" value={profile.chatFee?`₹${profile.chatFee}`:""}/> */}
                    {profile.qualifications.length > 0 && <div style={{ gridColumn: "span 2" }}>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#5a6a80", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>Qualifications</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {profile.qualifications.map(q => <span key={q} style={{ padding: "4px 12px", borderRadius: 999, background: "#e8f0fe", color: "#1560e8", fontSize: "0.8rem", fontWeight: 600 }}>{q}</span>)}
                      </div>
                    </div>}
                  </div>
                </SectionCard>

                {/* Languages */}
                <SectionCard title="Known Languages" icon="translate" onEdit={() => openModal("languages")}>
                  {profile.languages.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {profile.languages.map(l => (
                        <span key={l} style={{ padding: "6px 16px", borderRadius: 999, background: "#f2f3fe", border: "1.5px solid rgba(195,198,215,.4)", fontSize: "0.875rem", fontWeight: 500, color: "#191b23" }}>{l}</span>
                      ))}
                    </div>
                  ) : <p style={{ color: "#aab4c4", fontSize: "0.875rem" }}>No languages added yet.</p>}
                </SectionCard>

                {/* Verification Documents */}
                {(profile.verificationDocuments.length > 0) && (
                  <SectionCard title="Verification Documents" icon="verified">
                    <p style={{ fontSize: "0.8rem", color: "#5a6a80", marginBottom: 14 }}>Documents submitted during onboarding verification.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      {profile.verificationDocuments.map((_, i) => {
                        const labels = ["Medical License", "Degree Certificate"];
                        const isUp = upDoc === i;
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, border: "1.5px solid #dde6f5", background: "#f8faff", position: "relative" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: isUp ? "#f2f3fe" : "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {isUp ? (
                                <div style={{ width: 16, height: 16, border: "2px solid #1560e8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                              ) : (
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#1560e8" }}>description</span>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#191b23" }}>{labels[i] || `Document ${i + 1}`}</p>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3, padding: "2px 10px", borderRadius: 999, background: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 700 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                                Uploaded
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleViewDoc(i)}
                                style={{ cursor: "pointer", color: "#5a6a80", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #dde6f5", boxShadow: "0 1px 2px rgba(0,0,0,.05)", transition: "all .2s" }}
                                title="View Document"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                              </button>
                              <label style={{ cursor: "pointer", color: "#1560e8", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #dde6f5", boxShadow: "0 1px 2px rgba(0,0,0,.05)", transition: "all .2s" }} title="Change Document">
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cloud_upload</span>
                                <input type="file" style={{ display: "none" }} onChange={e => handleDocUpload(e, i)} accept=".pdf,.jpg,.jpeg,.png" />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                )}

              </div>
            </div>
          </div>
        </main>

        {/* ── Modals ── */}
        {modal === "personal" && (
          <EditModal title="Edit Personal Information" onClose={closeModal} onSave={handleSave} saving={saving}>
            <div style={grid2}>
              <MField label="Full Name" value={draft.fullName} onChange={v => set("fullName", v)} />
              <MField label="Email" type="email" value={draft.email} onChange={v => set("email", v)} disabled />
              <MField label="Phone" value={draft.phone} onChange={v => set("phone", v)} placeholder="+91 XXXXX XXXXX" />
              <MField label="Blood Group" value={draft.bloodGroup} onChange={v => set("bloodGroup", v)} placeholder="e.g. A+" />
              <MField label="License Number" value={draft.licenseNumber} onChange={v => set("licenseNumber", v)} />
              <MField label="Experience (Years)" type="number" value={draft.experience} onChange={v => set("experience", v)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>About / Bio</label>
              <textarea value={draft.about} onChange={e => setDraft(p => ({ ...p, about: e.target.value }))} rows={3} placeholder="Brief professional bio..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", fontFamily: "inherit", resize: "vertical", outline: "none" }}
                onFocus={e => e.currentTarget.style.borderColor = "#1560e8"}
                onBlur={e => e.currentTarget.style.borderColor = "#dde6f5"} />
            </div>
          </EditModal>
        )}

        {modal === "address" && (
          <EditModal title="Edit Address" onClose={closeModal} onSave={handleSave} saving={saving}>
            <div style={{ gridColumn: "span 2" }}>
              <MField label="Street Address" value={draft.address} onChange={v => set("address", v)} placeholder="House / Street / Area" />
            </div>
            <div style={grid2}>
              <MField label="City" value={draft.city} onChange={v => set("city", v)} />
              <MField label="State" value={draft.state} onChange={v => set("state", v)} />
              <MField label="Country" value={draft.country} onChange={v => set("country", v)} />
              <MField label="Pincode" value={draft.pincode} onChange={v => set("pincode", v)} />
            </div>
          </EditModal>
        )}

        {modal === "professional" && (
          <EditModal title="Edit Professional Details" onClose={closeModal} onSave={handleSave} saving={saving}>
            <MSelect label="Specialty" value={draft.specialty} onChange={v => set("specialty", v)} options={SPECIALTIES} />
            <div style={grid2}>
              <MField label="Video Consultation Fee (₹)" type="number" value={draft.videoFee} onChange={v => set("videoFee", v)} />
              {/* <MField label="Chat Consultation Fee (₹)" type="number" value={draft.chatFee} onChange={v => set("chatFee", v)} /> */}
            </div>
          </EditModal>
        )}

        {modal === "languages" && (
          <EditModal title="Manage Languages" onClose={closeModal} onSave={handleSave} saving={saving}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, minHeight: 40 }}>
              {draft.languages.map(l => (
                <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1.5px solid rgba(195,198,215,.4)", background: "#f2f3fe", fontSize: "0.875rem", fontWeight: 500 }}>
                  {l}
                  <button onClick={() => removeLang(l)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ba1a1a", lineHeight: 1, fontSize: 14 }}>✕</button>
                </span>
              ))}
              {draft.languages.length === 0 && <p style={{ color: "#aab4c4", fontSize: "0.875rem" }}>No languages yet.</p>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={newLang} onChange={e => setNewLang(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addLang(); }}
                placeholder="Type a language and press Enter..."
                style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", fontFamily: "inherit", outline: "none" }}
                onFocus={e => e.currentTarget.style.borderColor = "#1560e8"}
                onBlur={e => e.currentTarget.style.borderColor = "#dde6f5"} />
              <button onClick={addLang} style={{ padding: "10px 18px", borderRadius: 8, background: "#1560e8", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>Add</button>
            </div>
          </EditModal>
        )}

        {/* ── Change Password Modal ── */}
        {pwModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
            <div style={{ background: "white", borderRadius: 20, padding: 36, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#1560e8" }}>lock_reset</span>
                  </div>
                  <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#191b23", margin: 0 }}>Change Password</h3>
                </div>
                <button onClick={closePwModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#424655", fontSize: 20, lineHeight: 1 }}>✕</button>
              </div>

              {pwError && (
                <div style={{ background: "#fff0f0", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: "0.85rem", color: "#dc2626", fontWeight: 600, marginBottom: 18 }}>
                  {pwError}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {([
                  { key: "oldPassword" as const, label: "Current Password", visKey: "old" as const },
                  { key: "newPassword" as const, label: "New Password", visKey: "new" as const },
                  { key: "confirmNewPassword" as const, label: "Confirm New Password", visKey: "confirm" as const },
                ] as const).map(({ key, label, visKey }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#424655", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={pwVisible[visKey] ? "text" : "password"}
                        value={pwForm[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") handleChangePassword(); }}
                        placeholder="••••••••"
                        style={{ width: "100%", padding: "10px 42px 10px 12px", borderRadius: 8, border: "1.5px solid #dde6f5", fontSize: "0.9rem", color: "#191b23", background: "white", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                        onFocus={e => e.currentTarget.style.borderColor = "#1560e8"}
                        onBlur={e => e.currentTarget.style.borderColor = "#dde6f5"}
                      />
                      <button
                        type="button"
                        onClick={() => setPwVisible(v => ({ ...v, [visKey]: !v[visKey] }))}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5a6a80", display: "flex", alignItems: "center" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{pwVisible[visKey] ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
                <button onClick={closePwModal} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#e7e7f3", color: "#424655", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleChangePassword} disabled={pwSaving} style={{ padding: "10px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0a2d78,#1560e8)", color: "white", fontWeight: 700, cursor: pwSaving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: pwSaving ? .75 : 1 }}>
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Crop Modal ── */}
        {cropModal && imageToCrop && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
            <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #f0f0f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a1d2e", margin: 0 }}>Crop Profile Picture</h3>
                <button onClick={() => setCropModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div style={{ position: "relative", width: "100%", height: 400, background: "#000" }}>
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

              <div style={{ padding: 32 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#64748b" }}>Zoom</span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1560e8" }}>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#1560e8", cursor: "pointer" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setCropModal(false)}
                    style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCrop}
                    style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0a2d78,#1560e8)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(21,96,232,0.25)", transition: "all .2s" }}
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        <div style={{ position: "fixed", bottom: 32, right: 32, background: "#334e99", color: "white", padding: "12px 22px", borderRadius: 10, fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 8px 24px rgba(51,78,153,.35)", display: "flex", alignItems: "center", gap: 8, zIndex: 999, opacity: toast ? 1 : 0, transform: toast ? "translateY(0)" : "translateY(16px)", transition: "all .3s", pointerEvents: "none" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>{toast}
        </div>
      </div>
    </>
  );
}
