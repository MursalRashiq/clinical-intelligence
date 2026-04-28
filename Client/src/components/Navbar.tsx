import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { theme } from "../theme";
import HeartbeatIcon from "./HeartbeatIcon";
import { logout, selectCurrentUser } from "../redux/user/userSlice";
import { FRONTEND_ROUTES } from "../utils/constants";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
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
            <div 
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "4px 8px", borderRadius: 12, transition: "background 0.2s" }}
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
            </div>

            {isDropdownOpen && (
               <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "white",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  border: `1px solid ${theme.border}`,
                  padding: "8px",
                  minWidth: "180px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  zIndex: 1000
               }}>
                  <Link
                     to={FRONTEND_ROUTES.RESET_PASSWORD_LOGGED_IN}
                     onClick={() => setIsDropdownOpen(false)}
                     style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        textDecoration: "none",
                        color: theme.sub,
                        fontSize: 14,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s"
                     }}
                     onMouseEnter={(e) => { e.currentTarget.style.background = theme.blueLight; e.currentTarget.style.color = theme.blue; }}
                     onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.sub; }}
                  >
                     <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                     Change Password
                  </Link>
                  <button 
                     onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                     style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: theme.sub,
                        fontSize: 14,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        transition: "all 0.2s"
                     }}
                     onMouseEnter={(e) => { e.currentTarget.style.background = theme.blueLight; e.currentTarget.style.color = theme.blue; }}
                     onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.sub; }}
                  >
                     <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                     Logout
                  </button>
               </div>
            )}
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
