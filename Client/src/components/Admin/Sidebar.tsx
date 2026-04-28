import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart2,
  Zap,
  Stethoscope,
  Users,
  Calendar,
  Grid,
  DollarSign,
  Mail,
  LogOut,
  Activity,
  X,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { theme as t } from "../../theme";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../../redux/admin/adminSlice";
import { adminService } from "../../services/adminService";

interface SidebarProps {
  onMobileClose?: () => void;
}

const sidebarItems = [
  { label: "Dashboard", icon: BarChart2, path: FRONTEND_ROUTES.ADMIN_DASHBOARD },
  { label: "Doctor Request", icon: Zap, path: "/admin/doctor-request", hasNotification: true },
  { label: "Doctors", icon: Stethoscope, path: "/admin/doctors" },
  { label: "Patients", icon: Users, path: FRONTEND_ROUTES.ADMIN_PATIENTS },
  { label: "Appointments", icon: Calendar, path: "/admin/appointments" },
  { label: "Speciality", icon: Grid, path: "/admin/speciality" },
  { label: "Earnings", icon: DollarSign, path: "/admin/earnings" },
  { label: "Reviews", icon: Star, path: "/admin/reviews" },
  { label: "Messages", icon: Mail, path: "/admin/messages" },
];

const Sidebar: React.FC<SidebarProps> = ({ onMobileClose }) => {
  const dispatch = useDispatch();

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

  const activeStyle = {
    backgroundColor: t.blueLight,
    color: t.blue,
    fontWeight: 700
  };

  const navItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 12,
    transition: "all 0.2s",
    textDecoration: "none",
    color: t.sub,
    fontSize: 14,
    fontWeight: 500
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100%", 
      background: "white", 
      borderRight: `1.5px solid ${t.border}`,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Brand Section */}
      <div style={{ 
        padding: "24px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        borderBottom: `1px solid ${t.blueXLight}` 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            height: 36, 
            width: 36, 
            background: t.blueLight, 
            borderRadius: 10, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: t.blue 
          }}>
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <h1 style={{ 
            fontSize: 18, 
            fontWeight: 800, 
            color: t.text, 
            fontFamily: "Fraunces, serif",
            margin: 0
          }}>
            Clinical <span style={{ color: t.blue }}>Intelligence</span>
          </h1>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: t.sub }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "20px 12px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {sidebarItems.map((item) => (
            <motion.div key={item.label} whileHover={{ x: 4 }}>
              <NavLink
                to={item.path}
                onClick={onMobileClose}
                style={({ isActive }) => ({
                  ...navItemStyle,
                  ...(isActive ? activeStyle : {})
                })}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.hasNotification && (
                  <span style={{ 
                    marginLeft: "auto", 
                    width: 6, 
                    height: 6, 
                    background: t.teal, 
                    borderRadius: "50%" 
                  }} />
                )}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div style={{ padding: 16, borderTop: `1px solid ${t.blueXLight}` }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            background: "transparent",
            color: t.sub,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fff1f2";
            e.currentTarget.style.color = "#e11d48";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = t.sub;
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
