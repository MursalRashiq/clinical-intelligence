import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { toast } from "sonner";

import TopNav from "../../components/Doctor/TopNav";
import DoctorSidebar from "../../components/Doctor/SideBar";
const navItems = [
  { icon: "dashboard", label: "Dashboard", active: true, fill: true },
  { icon: "pending_actions", label: "Requests" },
  { icon: "calendar_today", label: "Appointments" },
  { icon: "schedule", label: "Available Timings" },
  { icon: "account_balance_wallet", label: "Wallet" },
  { icon: "chat", label: "Message" },
];

const bottomNavItems = [
  { icon: "settings", label: "Profile Settings" },
  { icon: "logout", label: "Logout" },
];

const stats = [
  {
    icon: "groups",
    label: "Total Patients",
    value: "978",
    badge: "+15% week",
    color: "bg-[#405aa6]/10 text-[#405aa6]",
  },
  {
    icon: "person_search",
    label: "Patients Today",
    value: "80",
    badge: "+15% day",
    color: "bg-[#006495]/10 text-[#006495]",
  },
  {
    icon: "event_available",
    label: "Appointments Today",
    value: "50",
    badge: "+20% day",
    color: "bg-[#913300]/10 text-[#913300]",
  },
];

const weeklyBars: { day: string; appt: number; rev: number; active?: boolean }[] = [
  { day: "MON", appt: 64, rev: 96 },
  { day: "TUE", appt: 96, rev: 128 },
  { day: "WED", appt: 80, rev: 160 },
  { day: "THU", appt: 128, rev: 192, active: true },
  { day: "FRI", appt: 112, rev: 176 },
  { day: "SAT", appt: 48, rev: 64 },
  { day: "SUN", appt: 32, rev: 40 },
];

const notifications = [
  {
    icon: "check_circle",
    bg: "bg-green-50",
    text: "green-600",
    title: "Booking Confirmed",
    sub: "21 Mar 2024 10:30 AM",
    time: "Just Now",
    highlight: true,
  },
  {
    icon: "reviews",
    bg: "bg-blue-50",
    text: "blue-600",
    title: "You have a New Review for your Appointment",
    time: "5 Days Ago",
  },
  {
    icon: "calendar_month",
    bg: "bg-amber-50",
    text: "amber-600",
    title: "You have Appointment with Ahmed",
    sub: "by 01:20 PM",
    time: "12:55 PM",
  },
  {
    icon: "payments",
    bg: "bg-[#b4c5ff]/20",
    text: "[#405aa6]",
    title: "Sent an amount of ₹200",
    sub: "for an Appointment by 01:20 PM",
    time: "2 Days Ago",
  },
  {
    icon: "reviews",
    bg: "bg-blue-50",
    text: "blue-600",
    title: "You have a New Review for your Appointment",
    time: "5 Days Ago",
  },
];

const patients = [
  {
    name: "Ahmed Khan",
    id: "CI-29402",
    service: "Root Canal Treatment",
    time: "01:20 PM",
    timeColor: "text-[#405aa6]",
    status: "Waiting",
    statusClass: "bg-[#58b9fd]/30 text-[#00476d]",
    dotClass: "bg-[#58b9fd]",
    action: { label: "Start Session", class: "text-[#405aa6] hover:bg-[#405aa6]/10" },
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9D2ad-uDlr1btfVKIzs_A1z2UeyImMc5EBkfOSv5xc5njDBqFH7n6gUSKg25z307cae2Fh_G61KDXKrtVM6vkJzrk45GYNXDdLnhKdXwVMz5_0jQG8Le1hNwbawS1a4GduDK5yGUcWRFp22eyU6ErB9AmZ0UoreI1VHfE7Xgm1MWC1faZq4OfmPV1XBAldg2stFX-p0lGYRD0Xhuh0eyY-AO1dckddlLgd7_C8qbGBl1mBccb6kzAix1MS9zZX8pdjJmvdQAMxTT-",
  },
  {
    name: "Sarah Johnson",
    id: "CI-29405",
    service: "Dental Cleaning",
    time: "02:00 PM",
    timeColor: "text-[#191b23]",
    status: "Scheduled",
    statusClass: "bg-slate-100 text-slate-500",
    dotClass: "bg-slate-300",
    action: { icon: "more_vert", class: "text-slate-400 hover:text-[#191b23]" },
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDijaz4u2y9YFBXyeyI5frW3dJlzRRTnlX3d7dY0aHHP2lruIv__3hLj_FXnYQmbwui9Y-xhlmKWZswXrqQHIOFdnfqoVaRXacoDcXnxZfVnkfcKmkhnwOami05_77sqMJ4IOO99-h7JnvtZqXyacfQzW3inEKN91iRHekIIpgFqNqBFSx9ovv8JREDNuDa0_nxSfQx9VaYMQjGnXDEF38HavGsoy8F5xBbLlKuxs5LPqAN--adLkdLxv9ZPVk4Rv7xLINi_nTTqYcr",
  },
];

const gradientStyle = {
  background: "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)",
};

export default function DoctorDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const doctorName = currentUser?.name ? `Dr. ${currentUser.name}` : "Doctor";

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate(FRONTEND_ROUTES.DOCTOR_LOGIN);
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed");
    }
  };


  return (
    <div className="min-h-screen bg-[#faf8ff] font-sans text-[#191b23]">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .fill-icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        body { font-family: 'Inter', sans-serif; }
        .font-headline { font-family: 'Manrope', sans-serif; }
      `}</style>

      {/* Sidebar */}
      <DoctorSidebar
        doctorName={doctorName}
        specialty={(currentUser as any)?.specialty || "Clinical Specialist"}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onLogout={handleLogout}
      />

      {/* Main */}
      <main className="ml-64 min-h-screen">
        {/* Top Nav */}
        <TopNav />
        {/* Content */}
        <div className="pt-32 pb-12 px-8 max-w-7xl mx-auto space-y-8">
          {/* Welcome */}
          <section>
            <h2 className="font-headline text-3xl font-extrabold text-[#191b23] tracking-tight">Dashboard Overview</h2>
            <p className="text-[#424655] mt-1">Good morning, {doctorName}. Here is what's happening today.</p>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map(({ icon, label, value, badge, color }) => (
              <div key={label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100/50 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${color}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{badge}</span>
                </div>
                <p className="text-[#424655] text-sm font-medium">{label}</p>
                <h3 className="font-headline text-4xl font-extrabold mt-1 text-[#191b23]">{value}</h3>
              </div>
            ))}
          </div>

          {/* Chart + Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100/50 shadow-sm flex flex-col">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h4 className="font-headline font-bold text-lg">Weekly Overview</h4>
                  <p className="text-xs text-[#424655]">Mar 14 - Mar 21, 2024</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={gradientStyle}></span>
                    <span className="text-xs font-medium text-[#424655]">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#58b9fd]"></span>
                    <span className="text-xs font-medium text-[#424655]">Appointments</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-end justify-between gap-4 h-64 px-2">
                {weeklyBars.map(({ day, appt, rev, active }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex justify-center gap-1 items-end">
                      <div
                        className="w-4 bg-[#58b9fd] rounded-t-sm transition-all"
                        style={{ height: `${appt}px` }}
                      ></div>
                      <div
                        className="w-4 rounded-t-sm transition-all"
                        style={{ height: `${rev}px`, ...gradientStyle }}
                      ></div>
                    </div>
                    <span className={`text-[10px] font-bold ${active ? "text-[#1560E8]" : "text-[#424655]"}`}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-[#f2f3fe] p-6 rounded-xl border border-slate-100/30 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-headline font-bold text-lg">Notifications</h4>
                <button className="text-xs font-bold text-[#1560E8] hover:underline">Clear All</button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className={`bg-white p-4 rounded-xl border border-slate-50 shadow-sm flex gap-3 relative overflow-hidden ${!n.highlight ? "bg-white/50" : ""}`}
                  >
                    {n.highlight && (
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={gradientStyle}></div>
                    )}
                    <div className={`w-10 h-10 rounded-lg ${n.bg} text-${n.text} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-xl">{n.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${n.highlight ? "font-bold" : "font-medium"} text-[#191b23]`}>{n.title}</p>
                      {n.sub && <p className="text-[10px] text-[#424655] mt-0.5">{n.sub}</p>}
                      <p className={`text-[10px] font-bold mt-1 ${n.highlight ? "text-[#405aa6]" : "text-[#424655]"}`}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <section className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-headline font-bold text-xl">Immediate Appointments</h4>
              <div className="flex gap-2">
                {["search", "filter_list"].map((icon) => (
                  <button key={icon} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    {["Patient Name", "Service", "Time", "Status", "Action"].map((h, i) => (
                      <th key={h} className={`pb-4 font-bold text-xs text-[#424655] uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {patients.map((p) => (
                    <tr key={p.id} className="group hover:bg-[#f2f3fe] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#191b23]">{p.name}</p>
                            <p className="text-[10px] text-[#424655]">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-medium text-[#191b23]">{p.service}</span>
                      </td>
                      <td className="py-4">
                        <span className={`text-xs font-bold ${p.timeColor}`}>{p.time}</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${p.statusClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.dotClass}`}></span>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {p.action.label ? (
                          <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${p.action.class}`}>
                            {p.action.label}
                          </button>
                        ) : (
                          <button className={`p-2 rounded-lg transition-all ${p.action.class}`}>
                            <span className="material-symbols-outlined">{p.action.icon}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* FAB */}
      <button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        style={gradientStyle}
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}
