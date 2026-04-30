import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  // Step 1 – Registration
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 – Verification
  medicalSchool: string;
  degree: string;
  graduationYear: string;
  yearsOfPractice: string;
  previousAffiliation: string;
  primarySpecialty: string;
  customSpecialty: string;
  // Step 3 – Specialty (reuses Step 2 specialty fields, step 3 is just specialty)
  // Step 4 – Fees
  videoFee: string;
  videoEnabled: boolean;
  chatFee: string;
  chatEnabled: boolean;
  // Step 5 – Documents
  medicalLicense: File | null;
  degreeCertificate: File | null;
}

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
  const [codeIndex, setCodeIndex] = useState(0);
  const codes = [
    { f: "🇮🇳", c: "+91" },
    { f: "🇺🇸", c: "+1" },
    { f: "🇬🇧", c: "+44" },
    { f: "🇦🇺", c: "+61" },
    { f: "🇦🇪", c: "+971" },
    { f: "🇨🇦", c: "+1" },
  ];
  const cycleCode = () => setCodeIndex((i) => (i + 1) % codes.length);

  return (
    <div className="w-full flex flex-col gap-0">
      {/* Hero */}
      <div className="mb-10 text-center">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4"
          style={{ background: "linear-gradient(135deg,#58b9fd,#1560E8)", color: "#fff" }}
        >
          Step 01 / 05 — Account Setup
        </span>
        <h1
          className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "Manrope, sans-serif", background: "linear-gradient(135deg,#0A2D78,#1560E8,#1A8FD1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          Create your clinical profile.
        </h1>
        <p className="text-lg leading-relaxed max-w-md mx-auto" style={{ color: "#424655" }}>
          Join the leading network of specialized medical professionals.
          Your secure digital sanctuary awaits.
        </p>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <FieldLabel>Full Name</FieldLabel>
          <Input
            icon="person"
            placeholder="Enter full name"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Phone Number</FieldLabel>
          <div className="relative flex w-full">
            <div
              className="flex items-center gap-2 px-3 cursor-pointer rounded-tl-lg border-b-2 border-transparent transition-all shrink-0"
              style={{ background: "#e1e2ed", color: "#191b23", fontFamily: "Inter, sans-serif" }}
              onClick={cycleCode}
              title="Tap to change country"
            >
              <span>{codes[codeIndex].f}</span>
              <span className="font-semibold text-sm">{codes[codeIndex].c}</span>
              <MaterialIcon name="arrow_drop_down" className="text-gray-500" />
            </div>
            <input
              type="tel"
              maxLength={15}
              placeholder="98765 43210"
              value={data.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full rounded-tr-lg px-4 py-3 text-sm outline-none transition-all border-b-2 border-transparent focus:border-[#1560E8] min-w-0"
              style={{
                background: "#e1e2ed",
                color: "#191b23",
                fontFamily: "Inter, sans-serif",
                borderLeft: "1px solid rgba(195,198,215,0.3)"
              }}
            />
          </div>
        </div>
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
        <div>
          <FieldLabel>Create Password</FieldLabel>
          <Input
            icon="lock"
            type="password"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => onChange("password", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Confirm Password</FieldLabel>
          <Input
            icon="verified"
            type="password"
            placeholder="••••••••"
            value={data.confirmPassword}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
          />
        </div>
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
              <FieldLabel>Medical School / Institution</FieldLabel>
              <Input
                placeholder="e.g. Johns Hopkins School of Medicine"
                value={data.medicalSchool}
                onChange={(e) => onChange("medicalSchool", e.target.value)}
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
              <div>
                <FieldLabel>Graduation Year</FieldLabel>
                <Input
                  type="number"
                  placeholder="YYYY"
                  value={data.graduationYear}
                  onChange={(e) => onChange("graduationYear", e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <FieldLabel>Previous Affiliation</FieldLabel>
              <Input
                placeholder="e.g. Mayo Clinic"
                value={data.previousAffiliation}
                onChange={(e) => onChange("previousAffiliation", e.target.value)}
              />
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
                "Cardiology","Dermatology","Emergency Medicine","Endocrinology",
                "Gastroenterology","Internal Medicine","Neurology",
                "Obstetrics & Gynecology","Oncology","Pediatrics","Psychiatry",
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
                $105 – $150
              </span>
              .
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: "#424655" }}>Your Average Fee</span>
                <span className="font-bold" style={{ color: "#191b23" }}>
                  ${data.videoFee || "0.00"}
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
        <div
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
        </div>
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
  const doctorStyles = `
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .items-end { align-items: flex-end; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .shrink-0 { flex-shrink: 0; }
    .flex-1 { flex: 1 1 0%; }
    .hidden { display: none; }
    
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .w-10 { width: 2.5rem; }
    .h-10 { height: 2.5rem; }
    .w-12 { width: 3rem; }
    .h-12 { height: 3rem; }
    .w-16 { width: 4rem; }
    .h-16 { height: 4rem; }
    .w-64 { width: 16rem; }
    .w-80 { width: 20rem; }
    .max-w-md { max-width: 28rem; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-3xl { max-width: 48rem; }
    .max-w-4xl { max-width: 56rem; }
    
    .gap-0 { gap: 0; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .gap-x-8 { column-gap: 2rem; }
    .gap-y-6 { row-gap: 1.5rem; }
    
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .p-10 { padding: 2.5rem; }
    .p-12 { padding: 3rem; }
    .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-1.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .pt-2 { padding-top: 0.5rem; }
    .pt-6 { padding-top: 1.5rem; }
    .pt-8 { padding-top: 2rem; }
    
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-5 { margin-bottom: 1.25rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-10 { margin-bottom: 2.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-10 { margin-top: 2.5rem; }
    .mt-12 { margin-top: 3rem; }
    .mt-auto { margin-top: auto; }
    
    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-3xl { border-radius: 1.5rem; }
    
    .text-[10px] { font-size: 0.625rem; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-base { font-size: 1rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-4xl { font-size: 2.25rem; }
    
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }
    .tracking-widest { letter-spacing: 0.1em; }
    .tracking-tighter { letter-spacing: -0.05em; }
    
    .leading-relaxed { line-height: 1.625; }
    .leading-tight { line-height: 1.25; }
    .leading-snug { line-height: 1.375; }
    
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    
    .border { border: 1px solid #e1e2ed; }
    .border-b-2 { border-bottom-width: 2px; }
    .border-t { border-top: 1px solid #e1e2ed; }
    .border-r { border-right: 1px solid #e1e2ed; }
    .border-2 { border-width: 2px; }
    .border-dashed { border-style: dashed; }
    .border-transparent { border-color: transparent; }
    .border-white { border-color: #fff; }
    
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    
    .bg-white { background-color: #fff; }
    .bg-blue-50 { background-color: #eff6ff; }
    .bg-green-600 { background-color: #16a34a; }
    .bg-gray-50 { background-color: #f9fafb; }
    
    .text-white { color: #fff; }
    .text-blue-500 { color: #3b82f6; }
    .text-green-600 { color: #16a34a; }
    .text-yellow-500 { color: #eab308; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .shrink-0 { flex-shrink: 0; }
    
    .mx-auto { margin-left: auto; margin-right: auto; }
    .sticky { position: sticky; }
    .top-0 { top: 0; }
    .z-50 { z-index: 50; }
    .z-10 { z-index: 10; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .-top-20 { top: -5rem; }
    .-right-20 { right: -5rem; }
    .bottom-20 { bottom: 5rem; }
    .-left-16 { left: -4rem; }
    .blur-3xl { filter: blur(64px); }
    .pointer-events-none { pointer-events: none; }
    .overflow-hidden { overflow: hidden; }
    .overflow-y-auto { overflow-y: auto; }
    .min-h-screen { min-height: 100vh; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-500 { transition-duration: 500ms; }
    
    .cursor-pointer { cursor: pointer; }
    
    @media (min-width: 768px) {
      .md\:flex { display: flex; }
      .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\:col-span-2 { grid-column: span 2 / span 2; }
      .md\:flex-row { flex-direction: row; }
      .md\:items-center { align-items: center; }
      .md\:w-48 { width: 12rem; }
      .md\:mt-0 { margin-top: 0; }
    }
    
    @media (min-width: 1024px) {
      .lg\:flex { display: flex; }
      .lg\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
      .lg\:col-span-12 { grid-column: span 12 / span 12; }
      .lg\:col-span-8 { grid-column: span 8 / span 8; }
      .lg\:col-span-7 { grid-column: span 7 / span 7; }
      .lg\:col-span-5 { grid-column: span 5 / span 5; }
      .lg\:col-span-4 { grid-column: span 4 / span 4; }
      .lg\:text-5xl { font-size: 3rem; }
      .lg\:p-12 { padding: 3rem; }
    }
    
    @media (min-width: 1280px) {
      .xl\:block { display: block; }
    }
    
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }
  `;
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    medicalSchool: "",
    degree: "",
    graduationYear: "",
    yearsOfPractice: "",
    previousAffiliation: "",
    primarySpecialty: "",
    customSpecialty: "",
    videoFee: "120.00",
    videoEnabled: true,
    chatFee: "45.00",
    chatEnabled: false,
    medicalLicense: null,
    degreeCertificate: null,
  });

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
      <style>{doctorStyles}</style>
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
        style={{
          background: "linear-gradient(135deg, #050d1f 0%, #0c1e4a 40%, #0e2a6e 70%, #0f1e45 100%)",
          fontFamily: "Inter, sans-serif",
          minHeight: "100vh",
        }}
      >
        {/* ── Top Nav ───────────────────────────────────────────────────────── */}
        <header
          className="w-full sticky top-0 z-50"
          style={{
            background: "rgba(5,13,31,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
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
                    style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Manrope, sans-serif", textDecoration: "none" }}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button style={{ color: "rgba(255,255,255,0.6)" }}>
                <MaterialIcon name="notifications" />
              </button>
              <button style={{ color: "rgba(255,255,255,0.6)" }}>
                <MaterialIcon name="account_circle" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <aside
            className="hidden lg:flex flex-col gap-2 p-4 pt-8 w-64 shrink-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="mb-8 px-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                    onClick={() => setCurrentStep(step.id as Step)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all"
                    style={{
                      background: isActive ? "rgba(21,96,232,0.2)" : "transparent",
                      color: isActive ? "#58b9fd" : isDone ? "#4ade80" : "rgba(255,255,255,0.45)",
                      fontWeight: isActive ? 700 : 500,
                      boxShadow: isActive ? "0 0 0 1px rgba(88,185,253,0.3)" : "none",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 14,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <MaterialIcon
                      name={isDone ? "check_circle" : step.icon}
                      fill={isActive || isDone}
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
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                Progress
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ background: SignatureGradient, width: `${progress}%` }}
                />
              </div>
              <div className="text-xs mt-2 font-bold" style={{ color: "#58b9fd" }}>
                Step {currentStep} of 5
              </div>
            </div>

            {/* Help */}
            <div
              className="p-4 rounded-xl mt-2"
              style={{
                background: "rgba(88,185,253,0.08)",
                border: "1px solid rgba(88,185,253,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon name="support_agent" className="" style={{ color: "#58b9fd" }} />
                <span className="text-xs font-semibold" style={{ color: "#58b9fd" }}>Need Help?</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Our concierge team is available 24/7 to assist with your medical credentialing.
              </p>
            </div>
          </aside>

          {/* ── Main Canvas ─────────────────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-12">
            <div className="max-w-3xl mx-auto">
              {/* Glass Card Wrapper */}
              <div
                style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 24,
                  boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
                  padding: "48px 48px 36px",
                  marginBottom: 32,
                }}
              >
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
                className="mt-10 pt-6 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(195,198,215,0.2)" }}
              >
                <button
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1) as Step)}
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all"
                  style={{
                    color: "#405AA6",
                    fontFamily: "Manrope, sans-serif",
                    opacity: currentStep === 1 ? 0 : 1,
                    pointerEvents: currentStep === 1 ? "none" : "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <MaterialIcon name="arrow_back" />
                  BACK
                </button>

                <button
                  onClick={() => { if (!isLast) setCurrentStep((s) => Math.min(5, s + 1) as Step); }}
                  className="flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-all active:scale-95"
                  style={{
                    background: SignatureGradient,
                    fontFamily: "Manrope, sans-serif",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(21,96,232,0.45)",
                  }}
                >
                  {isLast ? "Finish Onboarding" : currentStep === 1 ? "Create Account" : "Save & Continue"}
                  <MaterialIcon name="arrow_forward" />
                </button>
              </div>
              </div>{/* end glass card */}
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
          style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.35)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p>© 2024 Clinical Intelligence Systems. All rights reserved.</p>
          <div className="flex gap-6 mt-2 md:mt-0">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((link) => (
              <a key={link} href="#" style={{ textDecoration: "none", color: "inherit" }}>{link}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}