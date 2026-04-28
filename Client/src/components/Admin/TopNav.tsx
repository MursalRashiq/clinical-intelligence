import React, { useState } from "react";
import { LogOut, User, Menu, Bell } from "lucide-react";
import { toast } from "sonner";
import { theme as t } from "../../theme";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin, selectCurrentAdmin } from "../../redux/admin/adminSlice";
import adminService from "../../services/adminService";

interface TopNavProps {
  onMenuClick?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const dispatch = useDispatch();
  const currentAdmin = useSelector(selectCurrentAdmin);

  const handleLogout = async () => {
    try {
      await adminService.logoutAdmin();
      dispatch(logoutAdmin());
      toast.success("Logged out successfully");
      window.location.href = FRONTEND_ROUTES.ADMIN_LOGIN;
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav style={{ 
      height: 72, 
      background: "rgba(255, 255, 255, 0.8)", 
      backdropFilter: "blur(12px)", 
      borderBottom: `1px solid ${t.border}`, 
      padding: "0 24px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      position: "sticky", 
      top: 0, 
      zIndex: 40,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onMenuClick}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            border: `1.5px solid ${t.border}`, 
            background: "white", 
            color: t.sub, 
            cursor: "pointer" 
          }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.text }}>Dashboard</h2>
            <p style={{ margin: 0, fontSize: 11, color: t.sub, fontWeight: 500 }}>Welcome back, {currentAdmin?.name || 'Admin'}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Notifications */}
        <button style={{ 
            position: "relative",
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            border: "none", 
            background: t.blueLight, 
            color: t.blue, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            cursor: "pointer"
        }}>
            <Bell size={18} />
            <span style={{ 
                position: "absolute", 
                top: 10, 
                right: 10, 
                width: 6, 
                height: 6, 
                background: "#f43f5e", 
                borderRadius: "50%", 
                border: "2px solid white" 
            }} />
        </button>

        {/* User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 20, borderLeft: `1px solid ${t.border}` }}>
          <div style={{ textAlign: "right" }} className="hidden sm:block">
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: t.text }}>{currentAdmin?.name || 'Admin User'}</p>
            <p style={{ margin: 0, fontSize: 10, color: t.teal, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>Super Admin</p>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 14, 
                background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`, 
                color: "white", 
                border: "none", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(21,96,232,0.2)"
              }}
            >
              <User size={20} />
            </button>

            {showLogoutMenu && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowLogoutMenu(false)} />
                <div style={{ 
                    position: "absolute", 
                    right: 0, 
                    marginTop: 12, 
                    width: 200, 
                    background: "white", 
                    borderRadius: 16, 
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)", 
                    border: `1px solid ${t.border}`, 
                    padding: 8, 
                    zIndex: 50 
                }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      color: "#f43f5e",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fff1f2"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
          .hidden.sm\\:block { display: block !important; }
          .lg\\:hidden { display: none !important; }
          @media (max-width: 640px) {
              .hidden.sm\\:block { display: none !important; }
          }
          @media (max-width: 1024px) {
              .lg\\:hidden { display: flex !important; }
          }
      `}</style>
    </nav>
  );
};

export default TopNav;
