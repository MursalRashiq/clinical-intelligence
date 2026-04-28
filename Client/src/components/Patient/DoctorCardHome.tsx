import { useState } from "react";
import type { Doctor } from "../../types/index";
import { theme } from "../../theme";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (name: string) => void;
}

const DoctorCard = ({ doctor, onBook }: DoctorCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: theme.bg,
        border: `1.5px solid ${hovered ? "rgba(21,96,232,.2)" : theme.border}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "all .25s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 38px rgba(21,96,232,.12)" : "none",
      }}
    >
      {/* Photo */}
      <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
        {!imgError ? (
          <img
            src={doctor.photo}
            alt={doctor.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              transition: "transform .4s",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(160deg,#c8d9f8,#a0bef5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
            }}
          >
            👨‍⚕️
          </div>
        )}

        {/* Availability badge */}
        {doctor.available && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              borderRadius: 100,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(0,191,165,.88)",
              color: "white",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ● Available
          </div>
        )}

        {/* Rating badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255,255,255,.92)",
            borderRadius: 100,
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24">
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill="#f59e0b"
            />
          </svg>
          {doctor.rating}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 8,
            background: doctor.specColor?.bg ?? theme.blueLight,
            color: doctor.specColor?.text ?? theme.blue,
          }}
        >
          {doctor.specialty}
        </div>

        <div
          style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 700, marginBottom: 5 }}
        >
          {doctor.name}
        </div>

        <div
          style={{
            fontSize: 13,
            color: theme.sub,
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 14,
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={theme.blue} strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {doctor.location}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <div
            style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: theme.blue }}
          >
            {doctor.fee}
          </div>
          <button
            onClick={() => onBook(doctor.name)}
            style={{
              padding: "9px 18px",
              border: "none",
              borderRadius: 9,
              background: `linear-gradient(135deg, ${theme.blue}, ${theme.blue2})`,
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(21,96,232,.22)",
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
