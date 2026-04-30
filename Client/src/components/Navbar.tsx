import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { theme } from "../theme";
import HeartbeatIcon from "./HeartbeatIcon";
import { logout, selectCurrentUser } from "../redux/user/userSlice";
import { FRONTEND_ROUTES } from "../utils/constants";
import AuthService from "../services/AuthService";

interface NavbarProps {
  /** Highlight a nav link as active by label e.g. "Home" */
  activePage?: string;
}

const navLinks = [
  { label: "Home",    href: FRONTEND_ROUTES.HOME   },
  { label: "Doctors", href: "#" },
  { label: "About",   href: "#"             },
  { label: "Contact", href: "#"             },
];

const Navbar = ({ activePage }: NavbarProps) => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate(FRONTEND_ROUTES.LOGIN);
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,.96)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${theme.border}`,
        height: 66,
        padding: "0 clamp(20px, 5vw, 60px)",
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}
    >
      {/* Logo */}
      <Link
        to={FRONTEND_ROUTES.HOME}
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginRight: "auto" }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${theme.blue}, ${theme.teal})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(21,96,232,.25)",
          }}
        >
          <HeartbeatIcon size={19} />
        </div>
        <span
          style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700, color: theme.brandDark }}
        >
          Clinical <span style={{ color: theme.brandLight }}>Intelligence</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4 }} className="hidden md:flex">
        {navLinks.map(({ label, href }) => {
          const isActive = activePage === label;
          const isHovered = hoveredLink === label;
          return (
            <Link
              key={label}
              to={href}
              onMouseEnter={() => setHoveredLink(label)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive || isHovered ? theme.blue : theme.sub,
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 8,
                background: isActive || isHovered ? theme.blueLight : "transparent",
                transition: "all .2s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Action buttons or User Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {currentUser ? (
          <div style={{ position: "relative" }}>
            <Link 
               to={FRONTEND_ROUTES.PATIENT_PROFILE}
               style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "4px 8px", borderRadius: 12, transition: "background 0.2s", textDecoration: "none" }}
               onMouseEnter={(e) => e.currentTarget.style.background = theme.blueLight}
               onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
               <div style={{ textAlign: "right" }} className="hidden sm:block">
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.text }}>{currentUser.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: theme.teal, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Patient</p>
               </div>
               <div
                  style={{
                      width: 40, height: 40, borderRadius: 12, border: "none",
                      background: theme.blueLight, color: theme.blue,
                      display: "flex", alignItems: "center", justifyContent: "center",
                  }}
               >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               </div>
            </Link>
          </div>
        ) : (
          <>
            <Link
              to={FRONTEND_ROUTES.LOGIN}
              style={{
                padding: "8px 20px",
                border: `1.5px solid ${theme.blue}`,
                borderRadius: 8,
                background: "white",
                color: theme.blue,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Login
            </Link>
            <Link
              to={FRONTEND_ROUTES.REGISTER}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: 8,
                background: `linear-gradient(135deg, ${theme.blue}, ${theme.blue2})`,
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 3px 12px rgba(21,96,232,.25)",
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
