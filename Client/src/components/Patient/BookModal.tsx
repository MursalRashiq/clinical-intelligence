import { useState } from "react";
import type { BookingForm } from "../../types/index";
import { theme } from "../../theme";
import { timeSlots, visitTypes } from "../../types/data";

interface BookModalProps {
  doctorName: string;
  onClose: () => void;
}

const BookModal = ({ doctorName, onClose }: BookModalProps) => {
  const [form, setForm] = useState<BookingForm>({
    firstName: "",
    lastName: "",
    date: "",
    timeSlot: "2:00 PM",
    visitType: "📹 Video Call",
  });
  const [confirmed, setConfirmed] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onClose, 2400);
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 13px",
    border: `1.5px solid ${theme.border}`,
    borderRadius: 10,
    fontFamily: "inherit",
    fontSize: 14,
    color: theme.text,
    background: theme.bg,
    outline: "none",
    appearance: "none" as const,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".9px",
    color: theme.sub,
    marginBottom: 6,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(12,22,41,.5)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 20,
          padding: 36,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 64px rgba(0,0,0,.18)",
          position: "relative",
          animation: "pop .3s ease both",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 30,
            height: 30,
            border: `1.5px solid ${theme.border}`,
            borderRadius: 8,
            background: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.sub,
            fontSize: 14,
          }}
        >
          ✕
        </button>

        <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Book Appointment
        </h3>
        <p style={{ fontSize: 14, color: theme.blue, fontWeight: 600, marginBottom: 18 }}>
          with {doctorName}
        </p>

        {/* Name row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          {(["firstName", "lastName"] as const).map((field, i) => (
            <div key={field} style={{ flex: 1 }}>
              <label style={labelStyle}>{i === 0 ? "First Name" : "Last Name"}</label>
              <input
                type="text"
                placeholder={i === 0 ? "Jane" : "Smith"}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                style={fieldStyle}
              />
            </div>
          ))}
        </div>

        {/* Date */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            min={today}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            style={fieldStyle}
          />
        </div>

        {/* Time slot */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Time Slot</label>
          <select
            value={form.timeSlot}
            onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))}
            style={fieldStyle}
          >
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        {/* Visit type */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Visit Type</label>
          <select
            value={form.visitType}
            onChange={(e) => setForm((f) => ({ ...f, visitType: e.target.value }))}
            style={fieldStyle}
          >
            {visitTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          style={{
            width: "100%",
            padding: 13,
            border: "none",
            borderRadius: 11,
            background: `linear-gradient(135deg, ${theme.blue}, ${theme.blue2})`,
            color: "white",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 5px 18px rgba(21,96,232,.25)",
          }}
        >
          Confirm Appointment
        </button>

        {confirmed && (
          <div
            style={{
              marginTop: 11,
              padding: 11,
              borderRadius: 9,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              background: "#e0f7f4",
              border: "1.5px solid #86efdb",
              color: "#007a64",
            }}
          >
            ✓ Booked! A confirmation will be sent to your email.
          </div>
        )}

        <style>{`@keyframes pop{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      </div>
    </div>
  );
};

export default BookModal;
