import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FRONTEND_ROUTES, DOCTOR_API_ROUTES, USER_ROLES } from "../../utils/constants";
import axiosInstance from "../../api/axiosInstance";
import { type FormData } from "../../types/doctor.type";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4 | 5;


// ── Helpers ──────────────────────────────────────────────────────────────────
const SignatureGradient =
  "linear-gradient(135deg, #0A2D78 0%, #1560E8 50%, #1A8FD1 100%)";

const steps = [
  { id: 1, label: "Registration", icon: "person_add" },
  { id: 2, label: "Verification", icon: "verified_user" },
  { id: 3, label: "Specialty", icon: "medical_services" },
  { id: 4, label: "Fees", icon: "payments" },
  { id: 5, label: "Documents", icon: "upload_file" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function MaterialIcon({
  name,
  fill = false,
  className = "",
}: {
  name: string;
  fill?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        display: "inline-block",
        lineHeight: 1,
        verticalAlign: "middle",
      }}
    >
      {name}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2 px-1"
      style={{ color: "#424655", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>
      {children}
    </label>
  );
}

function Input({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: string }) {
  return (
    <div className="relative">
      {icon && (
        <MaterialIcon
          name={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}
      <input
        {...props}
        className={`w-full rounded-t-lg px-4 py-3 text-sm outline-none transition-all
          border-b-2 border-transparent focus:border-[#1560E8]
          ${icon ? "pl-12" : ""}`}
        style={{
          background: "#e1e2ed",
          color: "#191b23",
          fontFamily: "Inter, sans-serif",
        }}
      />
    </div>
  );
}

function PasswordInput({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      {icon && (
        <MaterialIcon
          name={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`w-full rounded-t-lg px-4 py-3 text-sm outline-none transition-all
          border-b-2 border-transparent focus:border-[#1560E8]
          ${icon ? "pl-12" : ""} pr-12`}
        style={{
          background: "#e1e2ed",
          color: "#191b23",
          fontFamily: "Inter, sans-serif",
        }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1560E8] transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center"
      >
        <MaterialIcon name={show ? "visibility" : "visibility_off"} />
      </button>
    </div>
  );
}

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-t-lg px-4 py-3 text-sm outline-none transition-all border-b-2 border-transparent focus:border-[#1560E8]"
      style={{
        background: "#e1e2ed",
        color: "#191b23",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center cursor-pointer gap-3">
      <div
        className="relative"
        style={{ width: 52, height: 28 }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute inset-0 rounded-full transition-all"
          style={{ background: checked ? "#1560E8" : "#e1e2ed" }}
        />
        <div
          className="absolute top-[3px] rounded-full bg-white shadow transition-all"
          style={{
            width: 22,
            height: 22,
            left: checked ? 27 : 3,
          }}
        />
      </div>
      {label && (
        <span className="text-sm font-semibold" style={{ color: "#424655" }}>
          {label}
        </span>
      )}
    </label>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

// Step 1: Registration
function StepRegistration({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col gap-0">
      {/* Hero */}
      <div className="mb-10">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4"
          style={{ background: "#58b9fd", color: "#00476d" }}
        >
          Step 01 / 05
        </span>
        <h1
          className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "Manrope, sans-serif", color: "#191b23" }}
        >
          Create your clinical profile.
        </h1>
        <p className="text-lg leading-relaxed max-w-md" style={{ color: "#424655" }}>
          Join the leading network of specialized medical professionals. Secure
          your digital sanctuary.
        </p>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <FieldLabel>First Name</FieldLabel>
          <Input
            placeholder="Enter full name"
            value={data.Name}
            onChange={(e) => onChange("Name", e.target.value)}
          />
        </div>
        {/* <div>
          <FieldLabel>Last Name</FieldLabel>
          <Input
            placeholder="Enter last name"
            value={data.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
        </div> */}
        <div className="md:col-span-2">
          <FieldLabel>Professional Email</FieldLabel>
          <Input
            icon="alternate_email"
            type="email"
            placeholder="doctor@clinical-intelligence.com"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Phone Number</FieldLabel>
          <Input
            icon="phone"
            type="tel"
            placeholder="+91 (555) 000-0000"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Create Password</FieldLabel>
          <PasswordInput
            icon="lock"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => onChange("password", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Confirm Password</FieldLabel>
          <PasswordInput
            icon="verified"
            placeholder="••••••••"
            value={data.confirmPassword}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
          />
        </div>
      </div>

      {/* Login redirect */}
      <div className="mt-8">
        <p className="text-sm" style={{ color: "#424655" }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate(FRONTEND_ROUTES.DOCTOR_LOGIN)}
            className="font-bold hover:underline transition-colors"
            style={{ color: "#1560E8", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            Login here
          </button>
        </p>
      </div>

      {/* Social proof */}
      <div className="mt-12 flex items-center gap-6 pt-8"
        style={{ borderTop: "1px solid rgba(195,198,215,0.3)" }}>
        <div className="flex -space-x-3 overflow-hidden">
          {["Dr. Sarah", "Dr. James", "Dr. Maya"].map((name) => (
            <div
              key={name}
              className="inline-block h-10 w-10 rounded-full ring-2 ring-white flex items-center justify-center text-white text-xs font-bold"
              style={{ background: SignatureGradient }}
            >
              {name.split(" ")[1][0]}
            </div>
          ))}
        </div>
        <p className="text-xs font-medium" style={{ color: "#424655" }}>
          Join 2,500+ verified doctors managing clinical intelligence daily.
        </p>
      </div>
    </div>
  );
}

// Step 2: Verification
function StepVerification({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div>
      <div className="mb-10">
        <span
          className="text-sm font-semibold uppercase tracking-widest block mb-2"
          style={{ color: "#006495", fontFamily: "Manrope, sans-serif" }}
        >
          Step 2 of 5
        </span>
        <h1
          className="text-4xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "Manrope, sans-serif", color: "#191b23" }}
        >
          Professional Credentials
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "#424655" }}>
          Complete your verification details to finalise your clinical onboarding.
        </p>
      </div>

      <div className="space-y-8">
        {/* Academic */}
        <div className="rounded-xl p-8 shadow-sm" style={{ background: "#fff" }}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "#dbe1ff", color: "#334e99" }}
            >
              <MaterialIcon name="school" />
            </div>
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Academic Background
            </h3>
          </div>
          <div className="space-y-6">
            <div>
              <FieldLabel>Medical License Number</FieldLabel>
              <Input
                placeholder="e.g. LIC12345678"
                value={data.licenseNumber}
                onChange={(e) => onChange("licenseNumber", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel>Degree Obtained</FieldLabel>
                <Input
                  placeholder="e.g. MD, MBBS, DO"
                  value={data.degree}
                  onChange={(e) => onChange("degree", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="rounded-xl p-8 shadow-sm" style={{ background: "#fff" }}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "#cbe6ff", color: "#006495" }}
            >
              <MaterialIcon name="work_history" />
            </div>
            <h3
              className="text-xl font-bold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Clinical Experience
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <FieldLabel>Years of Practice</FieldLabel>
              <Select
                value={data.yearsOfPractice}
                onChange={(e) => onChange("yearsOfPractice", e.target.value)}
              >
                <option value="" disabled>
                  Select years of practice
                </option>
                <option>Less than 1 year</option>
                <option>1-5 years</option>
                <option>5-10 years</option>
                <option>10-20 years</option>
                <option>20+ years</option>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Specialty
function StepSpecialty({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div>
      <div className="mb-10">
        <span
          className="text-sm font-semibold uppercase tracking-widest block mb-2"
          style={{ color: "#006495", fontFamily: "Manrope, sans-serif" }}
        >
          Step 3 of 5
        </span>
        <h1
          className="text-4xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "Manrope, sans-serif", color: "#191b23" }}
        >
          Medical Specialty
        </h1>
        <p className="text-lg leading-relaxed" style={{ color: "#424655" }}>
          Define your area of expertise so patients can find the right care.
        </p>
      </div>

      <div className="rounded-xl p-8 shadow-sm" style={{ background: "#fff" }}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#ffdbce", color: "#913300" }}
          >
            <MaterialIcon name="stethoscope" />
          </div>
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Primary Specialization
          </h3>
        </div>
        <div className="space-y-6">
          <div>
            <FieldLabel>Select Specialty</FieldLabel>
            <Select
              value={data.primarySpecialty}
              onChange={(e) => onChange("primarySpecialty", e.target.value)}
            >
              <option value="" disabled>
                Select your area of expertise
              </option>
              {[
                "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology",
                "Gastroenterology", "Internal Medicine", "Neurology",
                "Obstetrics & Gynecology", "Oncology", "Pediatrics", "Psychiatry",
                "Surgery",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
              <option value="other">Other (Specify below)</option>
            </Select>
          </div>
          <div>
            <FieldLabel>Custom Specialty</FieldLabel>
            <input
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "#f2f3fe",
                border: "2px dashed #c3c6d7",
                color: "#191b23",
                fontFamily: "Inter, sans-serif",
              }}
              placeholder="Specify your specialty if not listed above"
              value={data.customSpecialty}
              onChange={(e) => onChange("customSpecialty", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Professional Bio / About</FieldLabel>
            <textarea
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all border-2 border-transparent focus:border-[#1560E8]"
              style={{
                background: "#f2f3fe",
                color: "#191b23",
                fontFamily: "Inter, sans-serif",
                minHeight: "120px",
                resize: "vertical"
              }}
              placeholder="Tell patients about your background, approach to care, and expertise..."
              value={data.about}
              onChange={(e) => onChange("about", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tip */}
      <div
        className="mt-8 rounded-xl p-6"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      >
        <div className="flex gap-4">
          <MaterialIcon name="lightbulb" className="text-yellow-500" />
          <div>
            <h4 className="font-bold text-sm mb-1">Tip</h4>
            <p className="text-xs leading-relaxed" style={{ color: "#424655" }}>
              Doctors with clearly defined specialties receive 3× more targeted
              appointment requests on the Clinical Intelligence network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Fees
function StepFees({
  data,
  onChange,
  onToggle,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onToggle: (k: "videoEnabled" | "chatEnabled", v: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-10">
        <span
          className="text-sm font-semibold uppercase tracking-widest block mb-2"
          style={{ color: "#006495", fontFamily: "Manrope, sans-serif" }}
        >
          Step 4 of 5
        </span>
        <h1
          className="text-4xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "Manrope, sans-serif", color: "#191b23" }}
        >
          Consultation Fees
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "#424655" }}>
          Set your professional rates for different consultation modes. These
          fees will be visible to patients during the booking process.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Video Call – featured */}
        <div
          className="lg:col-span-8 rounded-xl p-8 border transition-all hover:shadow-xl"
          style={{
            background: "#fff",
            borderColor: "rgba(195,198,215,0.3)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#dbe1ff", color: "#334e99" }}
              >
                <MaterialIcon name="video_chat" fill className="text-3xl" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Video Call
                </h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "#424655" }}>
                  Real-time clinical assessment with face-to-face video
                  interaction and screen sharing capabilities.
                </p>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "#58b9fd", color: "#00476d" }}
                  >
                    Recommended
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "#e7e7f3", color: "#424655" }}
                  >
                    Standard: 20 Min
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-4 shrink-0">
              <Toggle
                checked={data.videoEnabled}
                onChange={(v) => onToggle("videoEnabled", v)}
                label="Enabled"
              />
              <div className="relative w-full md:w-48">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg"
                  style={{ color: "#334e99" }}
                >
                  $
                </span>
                <input
                  type="number"
                  className="w-full rounded-lg py-4 pl-10 pr-4 text-xl font-bold outline-none focus:ring-2 focus:ring-[#1560E8] transition-all"
                  style={{
                    background: "#e7e7f3",
                    color: "#191b23",
                    fontFamily: "Manrope, sans-serif",
                  }}
                  placeholder="0.00"
                  value={data.videoFee}
                  onChange={(e) => onChange("videoFee", e.target.value)}
                  disabled={!data.videoEnabled}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div
          className="lg:col-span-4 rounded-xl p-6 flex flex-col justify-between border"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(195,198,215,0.3)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MaterialIcon name="analytics" className="text-[#006495]" />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#006495" }}
              >
                Market Insights
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#424655" }}>
              Based on your specialty in{" "}
              <span className="font-bold" style={{ color: "#191b23" }}>
                {data.primarySpecialty || "your specialty"}
              </span>
              , the average consultation fee is{" "}
              <span className="font-bold" style={{ color: "#334e99" }}>
                ₹500 – ₹2500
              </span>
              .
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: "#424655" }}>Your Average Fee</span>
                <span className="font-bold" style={{ color: "#191b23" }}>
                  ₹{data.videoFee || "0.00"}
                </span>
              </div>
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ background: "#e1e2ed" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    background: "#006495",
                    width: `${Math.min((parseFloat(data.videoFee || "0") / 200) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div
            className="mt-6 p-4 rounded-lg border"
            style={{
              background: "rgba(255,181,153,0.15)",
              borderColor: "rgba(145,51,0,0.15)",
            }}
          >
            <div className="flex gap-3">
              <MaterialIcon name="info" className="text-[#913300]" />
              <p className="text-xs leading-snug" style={{ color: "#7f2b00" }}>
                Platform fees (10%) are automatically deducted from these rates.
              </p>
            </div>
          </div>
        </div>

        {/* Chat */}
        {/* <div
          className="lg:col-span-5 rounded-xl p-8 border transition-all hover:shadow-xl"
          style={{
            background: "#fff",
            borderColor: "rgba(195,198,215,0.3)",
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: "#e7e7f3", color: "#334e99" }}
              >
                <MaterialIcon name="chat" className="text-2xl" />
              </div>
              <Toggle
                checked={data.chatEnabled}
                onChange={(v) => onToggle("chatEnabled", v)}
              />
            </div>
            <div>
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Chat
              </h3>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: "#424655" }}
              >
                Asynchronous or real-time text-based consultation via the
                internal messaging system.
              </p>
            </div>
            <div className="relative w-full">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base"
                style={{ color: "#334e99" }}
              >
                $
              </span>
              <input
                type="number"
                className="w-full rounded-lg py-3 pl-9 pr-4 text-lg font-bold outline-none focus:ring-2 focus:ring-[#1560E8] transition-all"
                style={{
                  background: "#e7e7f3",
                  color: "#191b23",
                  fontFamily: "Manrope, sans-serif",
                }}
                placeholder="0.00"
                value={data.chatFee}
                onChange={(e) => onChange("chatFee", e.target.value)}
                disabled={!data.chatEnabled}
              />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

// Step 5: Documents
function StepDocuments({
  data,
  onFile,
}: {
  data: FormData;
  onFile: (k: "medicalLicense" | "degreeCertificate", f: File | null) => void;
}) {
  const handleDrop =
    (key: "medicalLicense" | "degreeCertificate") =>
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] ?? null;
        if (file) onFile(key, file);
      };

  const handleFileInput =
    (key: "medicalLicense" | "degreeCertificate") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) onFile(key, file);
      };

  return (
    <div>
      <div className="mb-10">
        <span
          className="text-sm font-semibold uppercase tracking-widest block mb-2"
          style={{ color: "#006495", fontFamily: "Manrope, sans-serif" }}
        >
          Step 5 of 5
        </span>
        <h1
          className="text-4xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "Manrope, sans-serif", color: "#191b23" }}
        >
          Finalizing Your Sanctuary
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "#424655" }}>
          To maintain clinical integrity, please provide your professional
          credentials. All documents are encrypted and reviewed by our
          verification committee.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Medical License – large upload */}
        <div className="lg:col-span-7">
          <div
            className="rounded-xl p-8 shadow-sm border relative overflow-hidden group"
            style={{
              background: "#fff",
              borderColor: "rgba(195,198,215,0.15)",
            }}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <MaterialIcon name="description" className="text-8xl" />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Upload Medical License
            </h3>
            <p className="text-sm mb-8" style={{ color: "#424655" }}>
              Valid state-issued practitioner license. PDF or JPEG accepted.
            </p>

            <div
              className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer"
              style={{ borderColor: "rgba(195,198,215,0.5)", background: "#f9fafe" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop("medicalLicense")}
            >
              {data.medicalLicense ? (
                <div className="flex items-center gap-4 w-full max-w-sm">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "#fff", color: "#006495" }}
                  >
                    <MaterialIcon name="picture_as_pdf" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {data.medicalLicense.name}
                    </p>
                    <p className="text-[10px] font-bold flex items-center gap-1 text-green-600">
                      <MaterialIcon name="check_circle" fill className="text-sm" />
                      Successfully uploaded
                    </p>
                  </div>
                  <button
                    onClick={() => onFile("medicalLicense", null)}
                    className="transition-colors"
                    style={{ color: "#ba1a1a" }}
                  >
                    <MaterialIcon name="delete" />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "#dbe1ff", color: "#334e99" }}
                  >
                    <MaterialIcon name="cloud_upload" className="text-3xl" />
                  </div>
                  <p
                    className="font-semibold mb-1"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Drag and drop file here
                  </p>
                  <p className="text-xs" style={{ color: "#424655" }}>
                    Max file size: 10MB
                  </p>
                  <label
                    className="mt-6 px-6 py-2 border rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors hover:bg-blue-50"
                    style={{
                      borderColor: "#334e99",
                      color: "#334e99",
                      fontFamily: "Manrope, sans-serif",
                    }}
                  >
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={handleFileInput("medicalLicense")}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="lg:col-span-5 space-y-6">
          {/* Degree Certificate */}
          <div
            className="rounded-xl p-6 shadow-sm border"
            style={{
              background: "#fff",
              borderColor: "rgba(195,198,215,0.15)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Degree Certificate
              </h3>
              <span
                className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter"
                style={{ background: "#58b9fd", color: "#00476d" }}
              >
                Required
              </span>
            </div>

            {data.degreeCertificate ? (
              <div
                className="rounded-lg p-4 flex items-center gap-4 border"
                style={{ background: "#f2f3fe", borderColor: "rgba(195,198,215,0.2)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "#fff", color: "#006495" }}
                >
                  <MaterialIcon name="picture_as_pdf" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {data.degreeCertificate.name}
                  </p>
                  <p className="text-[10px] font-bold flex items-center gap-1 text-green-600">
                    <MaterialIcon name="check_circle" fill className="text-sm" />
                    Successfully uploaded
                  </p>
                </div>
                <button
                  onClick={() => onFile("degreeCertificate", null)}
                  style={{ color: "#424655" }}
                >
                  <MaterialIcon name="delete" />
                </button>
              </div>
            ) : (
              <label
                className="block border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: "rgba(195,198,215,0.5)" }}
              >
                <MaterialIcon name="upload_file" className="text-[#334e99]" />
                <span className="text-sm font-semibold" style={{ color: "#334e99" }}>
                  Upload Degree
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleFileInput("degreeCertificate")}
                />
              </label>
            )}
          </div>

          {/* Verification Tip */}
          <div
            className="rounded-xl p-6 border"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.4)",
            }}
          >
            <div className="flex gap-4">
              <MaterialIcon name="info" className="text-[#913300]" />
              <div>
                <h4 className="font-bold text-sm mb-1">Quick Verification Tip</h4>
                <p className="text-xs leading-relaxed" style={{ color: "#424655" }}>
                  Ensure all four corners of the document are visible and the
                  text is legible to avoid delays in your onboarding process.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div
            className="rounded-xl p-6 border"
            style={{ background: "#f2f3fe", borderColor: "rgba(195,198,215,0.2)" }}
          >
            <h5 className="font-bold text-sm mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
              Why trust Clinical Intelligence?
            </h5>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "shield", label: "HIPAA Compliant" },
                { icon: "lock", label: "256-bit Encryption" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{ background: "#fff", borderColor: "rgba(195,198,215,0.3)" }}
                >
                  <MaterialIcon name={icon} className="text-blue-500 text-sm" />
                  <span className="text-xs font-bold" style={{ color: "#191b23" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DoctorOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Initialize step from query param if available
  const stepParam = searchParams.get("step");
  const initialStep = stepParam ? (parseInt(stepParam) as Step) : 1;

  const [currentStep, setCurrentStep] = useState<Step>(initialStep);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(location.state?.formData || {
    Name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    degree: "",
    yearsOfPractice: "",
    primarySpecialty: "",
    customSpecialty: "",
    about: "",
    videoFee: "120.00",
    videoEnabled: true,
    chatFee: "45.00",
    chatEnabled: false,
    medicalLicense: null,
    degreeCertificate: null,
  });

  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return (
          formData.Name.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.phone.trim() !== "" &&
          formData.password !== "" &&
          formData.password === formData.confirmPassword
        );
      case 2:
        return (
          formData.licenseNumber.trim() !== "" &&
          formData.degree.trim() !== "" &&
          formData.yearsOfPractice.trim() !== ""
        );
      case 3:
        return (
          formData.primarySpecialty.trim() !== "" &&
          (formData.primarySpecialty !== "other" || formData.customSpecialty.trim() !== "") &&
          formData.about.trim() !== ""
        );
      case 4:
        const videoOk = !formData.videoEnabled || formData.videoFee.trim() !== "";
        const chatOk = !formData.chatEnabled || formData.chatFee.trim() !== "";
        return videoOk && chatOk && (formData.videoEnabled || formData.chatEnabled);
      case 5:
        return formData.medicalLicense !== null && formData.degreeCertificate !== null;
      default:
        return true;
    }
  };

  const canNavigateTo = (targetStep: number) => {
    if (targetStep <= currentStep) return true;
    for (let i = 1; i < targetStep; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: "videoEnabled" | "chatEnabled", value: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = (
    key: "medicalLicense" | "degreeCertificate",
    file: File | null
  ) => {
    setFormData((prev) => ({ ...prev, [key]: file }));
  };

  const progress = ((currentStep - 1) / 4) * 100;
  const isLast = currentStep === 5;

  return (
    <>
      {/* Load Material Symbols + fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#faf8ff", fontFamily: "Inter, sans-serif" }}
      >
        {/* ── Top Nav ───────────────────────────────────────────────────────── */}
        <header
          className="w-full sticky top-0 z-50 shadow-sm"
          style={{ background: "#FAF8FF" }}
        >
          <div className="flex justify-between items-center px-6 py-4 max-w-full mx-auto">
            <div className="flex items-center gap-8">
              <span
                className="text-xl font-bold"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  background: SignatureGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Clinical Intelligence
              </span>
              <nav className="hidden md:flex gap-6">
                {["Onboarding Status", "Help", "Support"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm font-semibold transition-colors"
                    style={{
                      color: "#424655",
                      fontFamily: "Manrope, sans-serif",
                      textDecoration: "none",
                    }}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button style={{ color: "#334e99" }}>
                <MaterialIcon name="notifications" />
              </button>
              <button style={{ color: "#334e99" }}>
                <MaterialIcon name="account_circle" />
              </button>
            </div>
          </div>
          <div style={{ height: 1, background: "#F2F3FE" }} />
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <aside
            className="hidden lg:flex flex-col gap-2 p-4 pt-8 w-64 shrink-0 border-r"
            style={{
              background: "#F2F3FE",
              borderColor: "rgba(195,198,215,0.3)",
            }}
          >
            <div className="mb-8 px-2">
              <p
                className="text-xs"
                style={{ color: "#424655" }}
              >
                Onboarding Progress
              </p>
            </div>

            <nav className="flex flex-col gap-1">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (canNavigateTo(step.id)) {
                        setCurrentStep(step.id as Step);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${!canNavigateTo(step.id) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    disabled={!canNavigateTo(step.id)}
                    style={{
                      background: isActive ? "#fff" : "transparent",
                      color: isActive
                        ? "#1560E8"
                        : isDone
                          ? "#006495"
                          : "#424655",
                      fontWeight: isActive ? 700 : 500,
                      boxShadow: isActive
                        ? "0 1px 3px rgba(0,0,0,0.08)"
                        : "none",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 14,
                      border: "none",
                    }}
                  >
                    <MaterialIcon
                      name={isDone ? "check_circle" : step.icon}
                      fill={isActive || isDone}
                      className={
                        isDone
                          ? "text-[#006495]"
                          : isActive
                            ? "text-[#1560E8]"
                            : ""
                      }
                    />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Progress */}
            <div
              className="mt-auto p-4 rounded-xl"
              style={{
                background: "rgba(225,226,237,0.4)",
                border: "1px solid rgba(195,198,215,0.2)",
              }}
            >
              <div
                className="text-[10px] uppercase tracking-widest font-bold mb-2"
                style={{ color: "#424655" }}
              >
                Progress
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "#d9d9e5" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    background: SignatureGradient,
                    width: `${progress}%`,
                  }}
                />
              </div>
              <div
                className="text-xs mt-2 font-bold"
                style={{ color: "#334e99" }}
              >
                Step {currentStep} of 5
              </div>
            </div>

            {/* Help */}
            <div
              className="p-4 rounded-xl mt-2"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon name="info" className="text-[#334e99]" />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#334e99" }}
                >
                  Need Help?
                </span>
              </div>
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: "#424655" }}
              >
                Our concierge team is available 24/7 to assist with your
                medical credentialing.
              </p>
            </div>
          </aside>

          {/* ── Main Canvas ─────────────────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Step content */}
              {currentStep === 1 && (
                <StepRegistration data={formData} onChange={handleChange} />
              )}
              {currentStep === 2 && (
                <StepVerification data={formData} onChange={handleChange} />
              )}
              {currentStep === 3 && (
                <StepSpecialty data={formData} onChange={handleChange} />
              )}
              {currentStep === 4 && (
                <StepFees
                  data={formData}
                  onChange={handleChange}
                  onToggle={handleToggle}
                />
              )}
              {currentStep === 5 && (
                <StepDocuments data={formData} onFile={handleFile} />
              )}

              {/* ── Navigation Buttons ───────────────────────────────────────── */}
              <div
                className="mt-12 pt-8 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(195,198,215,0.2)" }}
              >
                <button
                  onClick={() =>
                    setCurrentStep((s) => Math.max(2, s - 1) as Step)
                  }
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all hover:translate-x-[-4px]"
                  style={{
                    color: "#405AA6",
                    fontFamily: "Manrope, sans-serif",
                    opacity: currentStep <= 2 ? 0 : 1,
                    pointerEvents: currentStep <= 2 ? "none" : "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <MaterialIcon name="arrow_back" />
                  BACK
                </button>

                <button
                  onClick={async () => {
                    if (isStepComplete(currentStep)) {
                      if (!isLast) {
                        if (currentStep === 1) {
                          // Call register API to check if email exists and send OTP
                          try {
                            setLoading(true);
                            await axiosInstance.post(DOCTOR_API_ROUTES.REGISTER, {
                              name: formData.Name,
                              email: formData.email,
                              phone: formData.phone,
                              password: formData.password,
                              confirmPassword: formData.confirmPassword,
                              role: USER_ROLES.DOCTOR
                            });
                            navigate(FRONTEND_ROUTES.DOCTOR_VERIFY_OTP, { state: { formData } });
                          } catch (error: any) {
                            console.error("Registration failed", error);
                            const msg = error.response?.data?.message || "Registration failed. Please check your details or try again later.";
                            toast.error(msg);
                          } finally {
                            setLoading(false);
                          }
                        } else {
                          setCurrentStep((s) => (s + 1) as Step);
                        }
                      } else {
                        // Final finish - Submit data to backend
                        try {
                          setLoading(true);
                          const submitData = new FormData();

                          // Append regular fields
                          Object.entries(formData).forEach(([key, value]) => {
                            if (value !== null && typeof value !== 'object') {
                              submitData.append(key, String(value));
                            }
                          });

                          // Append files
                          if (formData.medicalLicense) {
                            submitData.append("medicalLicense", formData.medicalLicense);
                          }
                          if (formData.degreeCertificate) {
                            submitData.append("degreeCertificate", formData.degreeCertificate);
                          }

                          await axiosInstance.post(DOCTOR_API_ROUTES.SUBMIT_VERIFICATION, submitData, {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          });

                          navigate(FRONTEND_ROUTES.DOCTOR_PENDING);
                        } catch (error) {
                          console.error("Failed to submit verification", error);
                          alert("Failed to submit verification. Please try again.");
                        } finally {
                          setLoading(false);
                        }
                      }
                    }
                  }}
                  className={`flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 hover:shadow-xl hover:-translate-y-0.5 ${!isStepComplete(currentStep) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  disabled={!isStepComplete(currentStep)}
                  style={{
                    background: isStepComplete(currentStep) ? SignatureGradient : "#a1a1a1",
                    fontFamily: "Manrope, sans-serif",
                    border: "none",
                    boxShadow: isStepComplete(currentStep) ? "0 8px 24px rgba(51,78,153,0.25)" : "none",
                  }}
                >
                  {loading ? "Submitting..." : isLast ? "Finish Onboarding" : currentStep === 1 ? "Create Account" : "Save & Continue"}
                  <MaterialIcon name="arrow_forward" />
                </button>
              </div>
            </div>
          </main>

          {/* ── Right Panel (decorative, Step 1 only) ──────────────────────── */}
          {currentStep === 1 && (
            <div
              className="hidden xl:block w-80 shrink-0 relative overflow-hidden"
              style={{ background: "#f2f3fe" }}
            >
              <div className="relative z-10 h-full p-10 flex flex-col justify-end">
                <div
                  className="p-8 rounded-3xl border space-y-6 shadow-2xl"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(12px)",
                    borderColor: "rgba(255,255,255,0.5)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                    style={{ background: SignatureGradient }}
                  >
                    <MaterialIcon name="stethoscope" fill />
                  </div>
                  <h3
                    className="text-2xl font-bold leading-tight"
                    style={{ fontFamily: "Manrope, sans-serif", color: "#334e99" }}
                  >
                    Patient data, beautifully synthesized.
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#424655" }}>
                    Experience a workspace designed for focus. We handle the
                    complexity so you can provide world-class care.
                  </p>
                  <div className="space-y-3 pt-2">
                    {[
                      "HIPAA Compliant Infrastructure",
                      "AI-Assisted Diagnostics",
                      "Real-time Cross-Facility Sync",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: "#58b9fd" }}
                        />
                        <span className="text-xs font-medium" style={{ color: "#191b23" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative icons */}
                <div
                  className="mt-8 flex items-center gap-4"
                  style={{ opacity: 0.3, color: "#334e99" }}
                >
                  {["health_and_safety", "monitor_heart", "pill", "psychology"].map(
                    (icon) => (
                      <MaterialIcon key={icon} name={icon} className="text-4xl" />
                    )
                  )}
                </div>
              </div>

              {/* Blobs */}
              <div
                className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: SignatureGradient, opacity: 0.05 }}
              />
              <div
                className="absolute bottom-20 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
                style={{ background: "#58b9fd", opacity: 0.1 }}
              />
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <footer
          className="px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs font-medium"
          style={{ background: "#f2f3fe", color: "#737686" }}
        >
          <p>© 2024 Clinical Intelligence Systems. All rights reserved.</p>
          <div className="flex gap-6 mt-2 md:mt-0">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="hover:text-[#334e99] transition-colors"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {link}
                </a>
              )
            )}
          </div>
        </footer>
      </div>
    </>
  );
}