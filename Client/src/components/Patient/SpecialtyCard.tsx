import { useState } from "react";
import type { Specialty } from "../../types/index";
import { theme } from "../../theme";

interface SpecialtyCardProps {
  spec: Specialty;
}

const SpecialtyCard = ({ spec }: SpecialtyCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="/doctors.html"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        border: `1.5px solid ${hovered ? theme.blue : theme.border}`,
        borderRadius: 18,
        padding: "24px 20px",
        textAlign: "center",
        cursor: "pointer",
        textDecoration: "none",
        transition: "all .25s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 8px 28px rgba(21,96,232,.12)" : "none",
        display: "block",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: hovered ? theme.blue : theme.blueLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
          fontSize: 24,
          transition: "all .25s",
        }}
      >
        {spec.icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 3 }}>
        {spec.name}
      </div>
      <div style={{ fontSize: 12, color: theme.sub }}>{spec.count} Doctors</div>
    </a>
  );
};

export default SpecialtyCard;
