// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientSpec {
  label: string;
  value: string;
}

interface HistoryRecord {
  id: string;
  aptId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  dateTime: string;
  location: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const patientSpecs: PatientSpec[] = [
  { label: "Appointment", value: "Video Call" },
  { label: "Patient Gender", value: "Male" },
  { label: "Blood Group", value: "AB+" },
  { label: "Patient Age", value: "42 Years" },
];

const historyRecords: HistoryRecord[] = [
  {
    id: "1",
    aptId: "#Apt0001",
    name: "Adrian",
    age: 42,
    gender: "Male",
    bloodGroup: "AB+",
    dateTime: "11 Nov 2024, 10:45 AM",
    location: "Alabama, USA",
  },
  {
    id: "2",
    aptId: "#AptC001",
    name: "Adrian",
    age: 42,
    gender: "Male",
    bloodGroup: "AB+",
    dateTime: "11 Nov 2024, 10:45 AM",
    location: "Alabama, USA",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({
  icon,
  label,
  active = false,
  filled = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
  filled?: boolean;
}) {
  return (
    <a
      href="#"
      className={`px-4 py-3 mx-2 flex items-center gap-3 rounded-lg text-sm tracking-wide transition-colors ${
        active
          ? "bg-white text-[#1560E8] font-bold shadow-sm"
          : "text-[#424655] hover:text-[#1560E8] hover:bg-white/50"
      }`}
    >
      <span
        className="material-symbols-outlined"
        style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span>{label}</span>
    </a>
  );
}

function SpecCard({ label, value }: PatientSpec) {
  return (
    <div className="bg-[#f2f3fe] p-4 rounded-xl">
      <p className="text-xs text-[#424655] font-medium uppercase mb-1">{label}</p>
      <p className="text-sm font-bold text-[#191b23]">{value}</p>
    </div>
  );
}

function HistoryRow({ record }: { record: HistoryRecord }) {
  return (
    <div className="bg-white p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6 group hover:bg-[#e7e7f3] transition-all duration-300">
      {/* Identity */}
      <div className="flex items-center gap-4 flex-1">
        <div className="h-12 w-12 rounded-full bg-[#f2f3fe] flex items-center justify-center text-[#334e99] group-hover:bg-white transition-colors">
          <span className="material-symbols-outlined">description</span>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <p className="font-bold text-[#191b23]">{record.aptId}</p>
            <span className="h-1 w-1 rounded-full bg-[#737686]" />
            <p className="text-sm text-[#191b23] font-semibold">{record.name}</p>
          </div>
          <div className="flex gap-3 text-xs text-[#424655] mt-1">
            <span>Age: {record.age}</span>
            <span>{record.gender}</span>
            <span>{record.bloodGroup}</span>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#424655] tracking-wider mb-1">
            Date &amp; Time
          </span>
          <span className="text-sm font-medium">{record.dateTime}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#424655] tracking-wider mb-1">
            Location
          </span>
          <span className="text-sm font-medium">{record.location}</span>
        </div>
        <button className="bg-[#f2f3fe] text-[#334e99] px-6 py-2 rounded-lg text-xs font-bold uppercase hover:bg-[#334e99] hover:text-white transition-all">
          Details
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentDoctor, logoutDoctor } from "../../redux/doctor/doctorSlice";
import { toast } from "sonner";
import DoctorSidebar from "../../components/Doctor/SideBar";
import TopNav from "../../components/Doctor/TopNav";
import AuthService from "../../services/AuthService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { appointmentService } from "../../services/AppointmentService";
import { useEffect, useState } from "react";
import type { PopulatedAppointment } from "../../types/appointment.types";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  if (/[APap][Mm]/.test(timeStr)) return timeStr;
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    return `${((h % 12) || 12).toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${suffix}`;
  } catch {
    return timeStr;
  }
}

function getPatientName(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.name) return appt.patientId.name;
  return appt.patientName || "Unknown Patient";
}

function getPatientEmail(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.email) return appt.patientId.email;
  return "";
}

function getPatientPhone(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.phone) return appt.patientId.phone;
  return "";
}

function getPatientId(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.customId) return appt.patientId.customId;
  if (typeof appt.patientId === "object" && appt.patientId?.id) return appt.patientId.id;
  return appt.customId || appt._id;
}

function getPatientAvatar(appt: PopulatedAppointment): string {
  if (typeof appt.patientId === "object" && appt.patientId?.profileImage) return appt.patientId.profileImage;
  const name = getPatientName(appt);
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1560e8&color=fff&size=64&bold=true`;
}

export default function AppointmentDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentDoctor = useSelector(selectCurrentDoctor);
  const { appointmentId } = useParams();

  const [appointment, setAppointment] = useState<PopulatedAppointment | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const doctorName =
    currentDoctor?.role === "doctor" && currentDoctor?.name
      ? `Dr. ${currentDoctor.name}`
      : "Doctor";

  // Fetch appointment details
  useEffect(() => {
    if (appointmentId) {
      appointmentService
        .getAppointmentById(appointmentId)
        .then((res) => setAppointment(res?.data || res))
        .catch(() => toast.error("Failed to load appointment details"))
        .finally(() => setLoadingDetail(false));
    }
  }, [appointmentId]);

  const handleReschedule = () => {
    if (!appointment) return toast.info("No appointment data");
    // Simple example: move date forward by one day
    const newDate = new Date(appointment.appointmentDate);
    newDate.setDate(newDate.getDate() + 1);
    const rescheduleData = {
      appointmentDate: newDate.toISOString(),
      appointmentTime: appointment.appointmentTime,
    };
    appointmentService
      .rescheduleAppointment(appointment._id || appointment.id, rescheduleData)
      .then(() => toast.success("Reschedule requested"))
      .catch(() => toast.error("Reschedule failed"));
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#191b23]" style={{ fontFamily: "Inter, sans-serif" }}>
      <DoctorSidebar doctorName={doctorName} specialty={"Clinical Specialist"} activeNav="Appointments" onNavChange={() => {}} onLogout={() => {}} />
      <main className="ml-64 min-h-screen">
        <TopNav />

        <div className="pt-28 px-8 pb-12 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <button onClick={handleBack} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#f2f3fe] hover:bg-[#e7e7f3] transition-colors">
                <span className="material-symbols-outlined text-[#191b23]">arrow_back</span>
              </button>
              <h2
                className="text-2xl font-bold tracking-tight text-[#191b23]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Appointment Details
              </h2>
            </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-8">

            {/* ── Main Appointment Card ── */}
            <div className="col-span-12 lg:col-span-8">
      {loadingDetail ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm text-gray-500">Loading appointment details...</span>
        </div>
      ) : appointment && (
        <div className="bg-white rounded-xl p-8 relative overflow-hidden group">
          {/* Decorative tonal blob */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full transition-all group-hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)",
            }}
          />

          <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-32 w-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img
                  src={getPatientAvatar(appointment)}
                  alt={getPatientName(appointment)}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#58b9fd] rounded-full flex items-center justify-center text-[#00476d] border-4 border-white">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {appointment.appointmentType?.toLowerCase() === "video_call" ? "videocam" : "event"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {getPatientName(appointment)}
                </h3>
                <span className="px-3 py-1 bg-[#e7e7f3] text-[#424655] text-xs font-semibold rounded-full">
                  {appointment.customId || appointment._id || "#Apt"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-[#424655]">
                {[
                  { icon: "event", text: formatDate(appointment.appointmentDate) },
                  { icon: "schedule", text: formatTime(appointment.appointmentTime) },
                  { icon: "location_on", text: appointment.location || "Location" },
                ].map(({ icon, text }) => (
                  <div key={icon} className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lg text-[#334e99]">
                      {icon}
                    </span>
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                       <button onClick={handleReschedule} className="bg-[#405aa6]/10 text-[#405aa6] px-6 py-3 rounded-md text-sm font-bold uppercase hover:bg-[#405aa6]/20 transition-all">
                         Reschedule
                       </button>
                    </div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {patientSpecs.map((spec) => (
                    <SpecCard key={spec.label} {...spec} />
                  ))}
                </div>
              </div>
            )}
            </div>

            {/* ── Secondary Panel ── */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Consultation Fee */}
              <div className="bg-white p-8 rounded-xl border border-[#c3c6d7]/30 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4
                    className="font-bold text-lg text-[#191b23]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Consultation Fee
                  </h4>
                  <div className="p-2 bg-[#006495]/10 rounded-lg text-[#006495]">
                    <span className="material-symbols-outlined text-xl">payments</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className="text-4xl font-extrabold text-[#334e99]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    $50
                  </span>
                  <span className="text-sm text-[#424655] font-medium">for Video Call</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#c3c6d7]/15">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#424655]">Payment Status</span>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Paid
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#424655]">Transaction ID</span>
                    <span className="font-mono text-[#191b23]">#TRX-882194</span>
                  </div>
                </div>
              </div>

              {/* Doctor's Note */}
              <div className="bg-[#b94300]/10 p-6 rounded-xl border border-[#b94300]/20">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="material-symbols-outlined text-[#913300]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    warning
                  </span>
                  <h4
                    className="font-bold text-[#370e00] text-sm uppercase tracking-wide"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Doctor's Note
                  </h4>
                </div>
                <p className="text-sm text-[#424655] leading-relaxed italic">
                  "Patient reported mild sensitivity to cold after previous session. Monitor gum
                  inflammation in lower left molar area."
                </p>
              </div>
            </div>

            {/* ── Patient History ── */}
            <div className="col-span-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3
                    className="text-2xl font-bold text-[#191b23]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Patient History
                  </h3>
                  <p className="text-sm text-[#424655] mt-1">
                    Timeline of past interactions with Adrian
                  </p>
                </div>
                <button className="text-blue-600 text-sm font-semibold hover:underline">
                  View Archived Records
                </button>
              </div>

              <div className="space-y-4">
                {historyRecords.map((record) => (
                  <HistoryRow key={record.id} record={record} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FAB ── */}
      <button className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50"
        style={{
          background: "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)",
        }}
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}