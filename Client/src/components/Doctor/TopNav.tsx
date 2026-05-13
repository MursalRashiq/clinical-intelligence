import { useNavigate } from "react-router-dom";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/user/userSlice";
import { useState, useEffect } from "react";
import PatientService from "../../services/PatientService";

export default function TopNav() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const doctorName = currentUser?.name ? `Dr. ${currentUser.name}` : "Doctor";
  const doctorSpecialty = (currentUser as any)?.specialty || "Clinical Specialist";

  // Fetch presigned profile image URL from the user profile endpoint
  useEffect(() => {
    PatientService.getProfile()
      .then((res: any) => {
        if (res?.success && res.data?.profileImage) {
          setAvatarUrl(res.data.profileImage);
        } else {
          setAvatarUrl(null);
        }
      })
      .catch(() => setAvatarUrl(null));
  }, [currentUser?.profileImage]);

  // Generate initials-based default avatar
  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "DR";
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1560e8&color=fff&size=64&bold=true`;

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-12 flex justify-between items-center px-8 bg-white/70 backdrop-blur-xl shadow-sm border-b border-slate-100">
      <div className="flex items-center gap-4">
        <h1
          className="text-xs font-semibold font-headline leading-none"
          style={{
            background: "linear-gradient(to right, #0A2D78, #1560E8, #1A8FD1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Clinical Intelligence
        </h1>
        <div className="hidden md:flex ml-8 gap-6">
          <button
            onClick={() => navigate(FRONTEND_ROUTES.DOCTOR_DASHBOARD)}
            className="px-1 py-1 text-blue-700 font-semibold border-b-2 border-blue-600 transition-all bg-transparent border-none cursor-pointer text-sm"
          >
            Overview
          </button>
          <button
            className="px-1 py-1 text-slate-500 hover:text-blue-600 transition-all bg-transparent border-none cursor-pointer text-sm"
          >
            Patients
          </button>
          <button
            className="px-1 py-1 text-slate-500 hover:text-blue-600 transition-all bg-transparent border-none cursor-pointer text-sm"
          >
            Analytics
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {["notifications", "settings"].map((icon) => (
            <button key={icon} className="p-1.5 text-[#424655] hover:bg-blue-50/50 rounded-full transition-all">
              <span className="material-symbols-outlined text-xl">{icon}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-bold text-[#191b23] leading-tight">{doctorName}</p>
            <p className="text-[10px] text-[#424655] font-medium">{doctorSpecialty}</p>
          </div>
          <button
            onClick={() => navigate(FRONTEND_ROUTES.DOCTOR_PROFILE)}
            className="p-0 bg-transparent border-none cursor-pointer"
            title="View Profile"
          >
            <img
              src={avatarUrl || defaultAvatar}
              alt="Doctor Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#405aa6]/20 hover:ring-[#1560e8]/40 transition-all"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
