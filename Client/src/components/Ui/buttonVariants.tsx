import { theme as t } from "../../theme";

export const buttonVariants = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
    cursor: "pointer",
    border: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    gap: "8px",
    outline: "none"
  },
  variants: {
    default: {
      background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
      color: "white",
      boxShadow: "0 4px 12px rgba(21,96,232,0.2)"
    },
    outline: {
      background: "white",
      color: t.text,
      border: `1.5px solid ${t.border}`
    },
    ghost: {
      background: "transparent",
      color: t.sub
    },
    secondary: {
      background: t.blueLight,
      color: t.blue
    },
    danger: {
      background: "rgba(244, 63, 94, 0.1)",
      color: "#f43f5e"
    }
  },
  sizes: {
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "10px 20px" },
    lg: { padding: "14px 28px", fontSize: "15px" },
    icon: { width: "40px", height: "40px", padding: "0" }
  }
};
