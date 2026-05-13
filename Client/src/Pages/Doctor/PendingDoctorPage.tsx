import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  UserCheck,
  LogOut,
  Edit3,
  FolderOpen,
  Bell,
  ChevronRight,
  Activity,
  Calendar,
  Users,
  Lock,
  Award,
  AlertCircle,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import AuthService from "../../services/AuthService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { logout, updateUser } from "../../redux/user/userSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  icon: React.ReactNode;
  label: string;
  locked?: boolean;
  route?: string;
}

interface ChecklistItem {
  label: string;
  done: boolean;
}

interface TimelineStep {
  label: string;
  sub: string;
  done: boolean;
  active?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { icon: <Activity size={18} />, label: "Dashboard", locked: true },
  { icon: <Users size={18} />, label: "Patients", locked: true },
  { icon: <Calendar size={18} />, label: "Appointments", locked: true },
  { icon: <UserCheck size={18} />, label: "Profile Settings", locked: false, route: FRONTEND_ROUTES.DOCTOR_PROFILE },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Sidebar({ mobile, onClose, user, doctorProfile, onLogout }: { mobile?: boolean; onClose?: () => void; user: any; doctorProfile: any; onLogout: () => void }) {
  const navigate = useNavigate();
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : "DR";

  return (
    <aside
      className={`${
        mobile
          ? "fixed inset-0 z-50 flex"
          : "hidden lg:flex w-64 flex-col"
      }`}
    >
      {mobile && (
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div
        className={`relative flex flex-col h-full bg-white border-r border-slate-100 ${
          mobile ? "w-64 shadow-2xl" : "w-64"
        }`}
      >
        {/* Brand */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight font-headline">
              Clinical Intelligence
            </span>
          </div>
          {mobile && (
            <button
              onClick={onClose}
              className="absolute top-5 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Doctor info */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">Dr. {user?.name || "Clinician"}</p>
              {doctorProfile?.verificationStatus === "rejected" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Approval
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ icon, label, locked, route }) => (
            <button
              key={label}
              disabled={locked}
              onClick={() => {
                if (!locked && route) {
                  navigate(route);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                locked
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {icon}
              <span className="flex-1 text-left">{label}</span>
              {locked && <Lock size={13} className="text-slate-300" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Submission Status</h3>
      <ul className="space-y-3">
        {items.map(({ label, done }) => (
          <li key={label} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                done ? "bg-emerald-100" : "bg-slate-100"
              }`}
            >
              {done ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              )}
            </div>
            <span className={`text-sm ${done ? "text-slate-700" : "text-slate-400"}`}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineCard({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-5">Verification Progress</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-100" />
        <ol className="space-y-5 relative">
          {steps.map(({ label, sub, done, active }) => (
            <li key={label} className="flex gap-4 items-start">
              <div
                className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                  done
                    ? "bg-emerald-500 border-emerald-500"
                    : active
                    ? "bg-white border-blue-500"
                    : "bg-white border-slate-200"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={12} className="text-white" />
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                ) : null}
              </div>
              <div className="pt-0.5">
                <p
                  className={`text-sm font-medium ${
                    done ? "text-slate-700" : active ? "text-blue-700" : "text-slate-400"
                  }`}
                >
                  {label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
              {active && (
                <span className="ml-auto mt-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function EtaCard() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Clock size={20} className="text-white" />
        </div>
        <span className="text-[10px] font-semibold bg-white/15 px-2.5 py-1 rounded-full uppercase tracking-wide">
          Estimated
        </span>
      </div>
      <p className="text-blue-200 text-xs font-medium mb-1">Approval window</p>
      <p className="text-3xl font-bold tracking-tight mb-1">24–48 hrs</p>
      <p className="text-blue-200 text-xs leading-relaxed">
        You'll receive an email notification once your account has been approved by our admin team.
      </p>
    </div>
  );
}

function NotificationsCard({ items }: { items: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Recent Activity</h3>
        <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {items.length} new
        </span>
      </div>
      <ul className="space-y-3">
        {items.map(({ icon, text, time, color }) => (
          <li key={text} className="flex gap-3 items-start">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-600 leading-snug">{text}</p>
              <p className="text-[10px] text-slate-400 mt-1">{time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApprovalPending() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const userInfo = AuthService.getCurrentUserInfo();
    if (!userInfo) {
      navigate(FRONTEND_ROUTES.DOCTOR_LOGIN);
      return;
    }
    setUser(userInfo);

    const fetchProfile = async () => {
      try {
        const response = await AuthService.getDoctorProfile();
        if (response.success) {
          setDoctorProfile(response.data);
          
          // Update Redux state with latest status
          dispatch(updateUser({
            verificationStatus: response.data.verificationStatus,
            rejectionReason: response.data.rejectionReason
          }));

          // If approved, redirect to dashboard
          if (response.data.verificationStatus === "approved") {
            navigate(FRONTEND_ROUTES.DOCTOR_DASHBOARD);
          }
        }
      } catch (error) {
        console.error("Failed to fetch doctor profile", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const dynamicChecklist: ChecklistItem[] = [
    { 
      label: "Degree Certificate Uploaded", 
      done: (doctorProfile?.verificationDocuments?.length || 0) > 0 
    },
    { 
      label: "Medical License Uploaded", 
      done: (doctorProfile?.verificationDocuments?.length || 0) > 1 
    },
    { 
      label: "Profile Information Completed", 
      done: !!(doctorProfile?.specialty && doctorProfile?.qualifications?.length) 
    },
  ];

  const status = doctorProfile?.verificationStatus?.toLowerCase();
  const dynamicTimeline: TimelineStep[] = [
    { 
      label: "Account Created", 
      sub: formatDate(doctorProfile?.createdAt), 
      done: true 
    },
    { 
      label: "Documents Uploaded", 
      sub: formatDate(doctorProfile?.updatedAt || doctorProfile?.createdAt), 
      done: (doctorProfile?.verificationDocuments?.length || 0) > 0 
    },
    { 
      label: status === "rejected" ? "Application Rejected" : "Under Admin Review", 
      sub: status === "rejected" ? "Changes required" : "In progress", 
      done: status === "approved",
      active: status === "pending" || status === "rejected"
    },
    { 
      label: "Account Approved", 
      sub: status === "approved" ? "Completed" : "Estimated 24–48 hrs", 
      done: status === "approved" 
    },
  ];

  const dynamicNotifications = [
    {
      icon: status === "rejected" ? <AlertCircle size={15} /> : <ShieldCheck size={15} />,
      text: status === "rejected" 
        ? `Rejection feedback: ${doctorProfile?.rejectionReason || "Check your details"}`
        : "Documents received and queued for review",
      time: "Recent",
      color: status === "rejected" ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50",
    },
    {
      icon: <Bell size={15} />,
      text: "Admin team has been notified of your application",
      time: "Recent",
      color: "text-blue-600 bg-blue-50",
    },
  ];

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate(FRONTEND_ROUTES.DOCTOR_LOGIN);
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Failed to logout");
    }
  };
  
  const [resubmitting, setResubmitting] = useState(false);
  const handleResubmit = async () => {
    if (doctorProfile?.rejectionCount >= 3) {
      toast.error("Maximum resubmission attempts reached. Please contact support.");
      return;
    }

    setResubmitting(true);
    try {
      const response = await AuthService.resubmitVerification();
      if (response.success) {
        toast.success("Application resubmitted successfully!");
        setDoctorProfile(response.data);
        // Dispatch update to redux if needed
        dispatch(updateUser({
          verificationStatus: response.data.verificationStatus,
          rejectionReason: null
        }));
      } else {
        toast.error(response.message || "Failed to resubmit application");
      }
    } catch (error) {
      console.error("Resubmission error", error);
      toast.error("An error occurred during resubmission");
    } finally {
      setResubmitting(false);
    }
  };

  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : "DR";

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-body">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-body text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-headline, .font-body, * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scalePop {
          0% { opacity: 0; transform: scale(0.85); }
          70% { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .anim-fade-1 { animation: fadeUp 0.45s ease both; }
        .anim-fade-2 { animation: fadeUp 0.45s 0.07s ease both; }
        .anim-fade-3 { animation: fadeUp 0.45s 0.14s ease both; }
        .anim-fade-4 { animation: fadeUp 0.45s 0.21s ease both; }
        .anim-pop { animation: scalePop 0.5s 0.05s cubic-bezier(.34,1.56,.64,1) both; }
        .spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>

      {/* Sidebar */}
      <Sidebar user={user} doctorProfile={doctorProfile} onLogout={handleLogout} />
      {sidebarOpen && <Sidebar mobile onClose={() => setSidebarOpen(false)} user={user} doctorProfile={doctorProfile} onLogout={handleLogout} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              {status === "rejected" ? (
                <>
                  <X size={16} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    Application Rejected — Changes Required
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Pending Approval — Limited Access
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-4 lg:px-8 py-8 max-w-6xl mx-auto w-full">

          {/* Hero section */}
          <div className="anim-fade-1 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-8 p-8">

                {/* Illustration area */}
                <div className="relative w-36 h-36 shrink-0 anim-pop">
                  {/* Rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 spin-slow" />
                  <div className="absolute inset-3 rounded-full border border-blue-100" />
                  {/* Icon bg */}
                  <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
                    <UserCheck size={34} className="text-white" />
                  </div>
                  {/* Badge */}
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center shadow-sm">
                    <Clock size={16} className="text-white" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 text-center md:text-left">
                  {status === "rejected" ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full mb-3">
                        <AlertCircle size={14} className="text-red-500" />
                        Application Rejected
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                        Verification Request Declined
                      </h1>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 max-w-xl">
                        <p className="text-red-800 text-sm font-semibold mb-1">Reason for Rejection:</p>
                        <p className="text-red-700 text-sm italic">
                          "{doctorProfile?.rejectionReason || "Please contact support for more details."}"
                        </p>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                        You can update your profile or re-upload your documents to address the issues mentioned above and resubmit your application for review.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Under Review
                      </div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                        Your Account is Under Review
                      </h1>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                        Our admin team is currently verifying your professional details and uploaded medical
                        documents. You'll receive an email notification once approved.
                      </p>
                    </>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                    {status === "rejected" && (
                      <div className="w-full mb-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Activity size={12} />
                          Resubmission attempts: {doctorProfile?.rejectionCount || 0} / 3
                        </div>
                      </div>
                    )}
                    
                    {status === "rejected" && (doctorProfile?.rejectionCount || 0) < 3 && (
                      <button 
                        onClick={handleResubmit}
                        disabled={resubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Resubmit Application
                      </button>
                    )}

                    {status === "rejected" && (doctorProfile?.rejectionCount || 0) < 3 && (
                      <button 
                        onClick={() => navigate(FRONTEND_ROUTES.DOCTOR_PROFILE)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm"
                      >
                        <Edit3 size={16} className="text-slate-500" />
                        Update Profile Details
                      </button>
                    )}

                    {status === "rejected" && (doctorProfile?.rejectionCount || 0) >= 3 && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 text-sm font-semibold rounded-xl border border-slate-200">
                        <AlertCircle size={16} />
                        Resubmission Limit Reached
                      </div>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-sm shadow-blue-200"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Info banner */}
              <div className={`border-t border-slate-100 ${doctorProfile?.verificationStatus === "rejected" ? "bg-red-50/50" : "bg-blue-50/50"} px-8 py-4 flex items-center gap-3`}>
                <div className={`w-7 h-7 rounded-lg ${doctorProfile?.verificationStatus === "rejected" ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center shrink-0`}>
                  {doctorProfile?.verificationStatus === "rejected" ? <X size={15} className="text-red-600" /> : <Award size={15} className="text-blue-600" />}
                </div>
                <p className="text-sm text-slate-600">
                  {doctorProfile?.verificationStatus === "rejected" ? (
                    <span className="font-semibold text-slate-800">Your application requires changes. Please address the feedback above.</span>
                  ) : (
                    <>
                      <span className="font-semibold text-slate-800">Verification takes 24–48 hours.</span>{" "}
                      You will receive a notification once your account is approved. Until then, access to
                      clinical tools is restricted.
                    </>
                  )}
                </p>
                <ChevronRight size={16} className="text-slate-400 ml-auto shrink-0" />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 anim-fade-2">
            {/* Left col */}
            <div className="lg:col-span-2 space-y-5">
              <div className="anim-fade-2"><ChecklistCard items={dynamicChecklist} /></div>
              <div className="anim-fade-3"><TimelineCard steps={dynamicTimeline} /></div>
              <div className="anim-fade-4"><NotificationsCard items={dynamicNotifications} /></div>
            </div>

            {/* Right col */}
            <div className="space-y-5">
              <div className="anim-fade-2"><EtaCard /></div>

              {/* What's locked card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm anim-fade-3">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Locked Until Approved
                </h3>
                <ul className="space-y-2.5">
                  {[
                    { icon: <Activity size={15} />, label: "Full Dashboard" },
                    { icon: <Users size={15} />, label: "Patient Management" },
                    { icon: <Calendar size={15} />, label: "Appointments" },
                  ].map(({ icon, label }) => (
                    <li key={label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        {icon}
                      </div>
                      <span className="text-sm text-slate-400">{label}</span>
                      <Lock size={12} className="text-slate-300 ml-auto" />
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    These features become available immediately after your account is approved.
                  </p>
                </div>
              </div>

              {/* Support card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm anim-fade-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Bell size={15} className="text-slate-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Need Help?</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  If verification takes longer than 48 hours, contact our support team for an update.
                </p>
                <button className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-xl transition-colors">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white px-8 py-5 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto">
            <p className="text-xs text-slate-400">
              © 2026 Clinical Intelligence · All rights reserved
            </p>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Service", "Support"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
