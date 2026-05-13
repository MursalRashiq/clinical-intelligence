import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/Admin/Sidebar";
import TopNav from "../../components/Admin/TopNav";
import { adminService } from "../../services/AdminService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Search,
    Check,
    ChevronDown,
    Filter,
    Download,
    CheckCircle2,
    XCircle,
    Clock3,
    Stethoscope,
} from "lucide-react";
import { theme as t } from "../../theme";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DoctorRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
    speciality: string;
    department: string;
    experience: string;
    fees: number;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
}

interface ButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "default" | "ghost" | "outline" | "secondary";
    size?: "sm" | "md" | "lg";
    style?: React.CSSProperties;
}

// ─── Button ─────────────────────────────────────────────────────────────────────
const Button = ({
    children,
    className,
    onClick,
    disabled,
    variant = "default",
    size = "md",
    style,
}: ButtonProps) => {
    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        fontWeight: "600",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        gap: "8px",
        outline: "none",
        opacity: disabled ? 0.5 : 1,
    };

    const variants: Record<string, React.CSSProperties> = {
        default: {
            background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
            color: "white",
            boxShadow: "0 4px 12px rgba(21,96,232,0.2)",
        },
        ghost: { background: "transparent", color: t.sub },
        outline: { background: "white", color: t.text, border: `1.5px solid ${t.border}` },
        secondary: { background: t.blueLight, color: t.blue },
    };

    const sizes: Record<string, React.CSSProperties> = {
        sm: { padding: "6px 12px", fontSize: "12px" },
        md: { padding: "10px 20px", fontSize: "14px" },
        lg: { padding: "14px 28px", fontSize: "15px" },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={{ ...base, ...variants[variant], ...sizes[size], ...style }}
            onMouseEnter={(e) => {
                if (!disabled) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
                if (!disabled) e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            {children}
        </button>
    );
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_REQUESTS: DoctorRequest[] = [
    { id: "d1", name: "Edalin Hendry", email: "edalin@gmail.com", phone: "+1 504 368 6874", profileImage: null, speciality: "Dentist", department: "Dentistry", experience: "3 Years", fees: 200, status: "pending", createdAt: "2024-06-01" },
    { id: "d2", name: "Sarah Johnson", email: "sarah.j@gmail.com", phone: "+1 612 455 7890", profileImage: null, speciality: "Cardiologist", department: "Cardiology", experience: "8 Years", fees: 500, status: "approved", createdAt: "2024-06-03" },
    { id: "d3", name: "Michael Chen", email: "m.chen@gmail.com", phone: "+1 312 990 1122", profileImage: null, speciality: "Dermatologist", department: "Dermatology", experience: "5 Years", fees: 350, status: "rejected", createdAt: "2024-06-04" },
    { id: "d4", name: "Priya Nair", email: "priya.n@gmail.com", phone: "+91 99876 54321", profileImage: null, speciality: "Pediatrician", department: "Pediatrics", experience: "6 Years", fees: 300, status: "pending", createdAt: "2024-06-05" },
    { id: "d5", name: "David Wilson", email: "d.wilson@gmail.com", phone: "+44 7700 900123", profileImage: null, speciality: "Neurologist", department: "Neurology", experience: "10 Years", fees: 700, status: "approved", createdAt: "2024-06-06" },
    { id: "d6", name: "Aisha Patel", email: "aisha.p@gmail.com", phone: "+91 98765 43210", profileImage: null, speciality: "Orthopedist", department: "Orthopedics", experience: "4 Years", fees: 400, status: "pending", createdAt: "2024-06-07" },
    { id: "d7", name: "James Lee", email: "james.l@gmail.com", phone: "+1 408 555 0199", profileImage: null, speciality: "Psychiatrist", department: "Psychiatry", experience: "7 Years", fees: 450, status: "rejected", createdAt: "2024-06-08" },
    { id: "d8", name: "Emily Brown", email: "emily.b@gmail.com", phone: "+1 213 555 0177", profileImage: null, speciality: "Oncologist", department: "Oncology", experience: "12 Years", fees: 800, status: "pending", createdAt: "2024-06-09" },
];

const LIMIT = 8;

const STATUS_CONFIG = {
    pending: {
        label: "Pending",
        color: "#D97706",
        bg: "#FEF3C7",
        border: "rgba(217,119,6,0.2)",
        icon: <Clock3 size={12} />,
    },
    approved: {
        label: "Approved",
        color: "#0f6e56",
        bg: "rgba(0,191,165,0.10)",
        border: "rgba(0,191,165,0.2)",
        icon: <CheckCircle2 size={12} />,
    },
    rejected: {
        label: "Rejected",
        color: "#f43f5e",
        bg: "rgba(244,63,94,0.10)",
        border: "rgba(244,63,94,0.2)",
        icon: <XCircle size={12} />,
    },
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const DoctorRequestsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<DoctorRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const getInitials = (name?: string) => {
        if (!name) return "??";
        return name
            .split(" ")
            .filter(Boolean)
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchRequests = useCallback(
        async (currentPage: number) => {
            setLoading(true);
            try {
                const res = await adminService.getDoctorRequests();
                
                if (res.success && res.data) {
                    const mappedData: DoctorRequest[] = res.data.map((d: any) => ({
                        id: d.id,
                        name: d.name,
                        email: d.email,
                        phone: d.phone || "N/A",
                        profileImage: d.profileImage,
                        speciality: d.department || "N/A",
                        department: d.department || "General",
                        experience: `${d.experienceYears || 0} Years`,
                        fees: d.VideoFees || 0,
                        status: d.status.toLowerCase(),
                        createdAt: d.createdAt
                    }));

                    // Local filtering to only show PENDING requests
                    let filtered = mappedData.filter((d) => {
                        const matchSearch =
                            !debouncedSearch ||
                            d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            d.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            d.speciality.toLowerCase().includes(debouncedSearch.toLowerCase());
                        
                        // Only show pending status as requested
                        return matchSearch && d.status === "pending";
                    });

                    const total = Math.ceil(filtered.length / LIMIT);
                    setTotalPages(total || 1);
                    setRequests(filtered.slice((currentPage - 1) * LIMIT, currentPage * LIMIT));
                } else {
                    toast.error(res.message || "Failed to fetch requests");
                    setRequests([]);
                }
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Error connecting to server";
                toast.error(message);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, statusFilter]
    );

    useEffect(() => {
        fetchRequests(page);
    }, [page, fetchRequests]);

    const handleAccept = async (id: string) => {
        try {
            const res = await adminService.approveDoctorRequest(id);
            if (res.success) {
                toast.success("Doctor request accepted successfully");
                setRequests((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r))
                );
            } else {
                toast.error(res.message || "Failed to accept doctor request");
            }
        } catch {
            toast.error("Failed to accept doctor request");
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await adminService.rejectDoctorRequest(id, "Rejected by Admin");
            if (res.success) {
                toast.success("Doctor request rejected");
                setRequests((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
                );
            } else {
                toast.error(res.message || "Failed to reject doctor request");
            }
        } catch {
            toast.error("Failed to reject doctor request");
        }
    };

    const pagesToShow = useMemo(() => {
        const pages: number[] = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [page, totalPages]);

    const cardStyle: React.CSSProperties = {
        background: "white",
        borderRadius: 24,
        boxShadow: "0 10px 40px rgba(21,96,232,0.04)",
        border: `1.5px solid ${t.border}`,
        overflow: "hidden",
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                width: "100%",
                background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: t.text,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            {/* Desktop Sidebar */}
            <div
                style={{ width: 256, position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50 }}
                className="hidden lg:block"
            >
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 60 }}
                        className="lg:hidden"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(15, 28, 46, 0.4)",
                                backdropFilter: "blur(4px)",
                            }}
                        />
                        <motion.div
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ type: "spring", damping: 30, stiffness: 450 }}
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 256,
                                background: "white",
                                boxShadow: "24px 0 48px rgba(0,0,0,0.1)",
                            }}
                        >
                            <Sidebar onMobileClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div
                style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 256, minWidth: 0 }}
                className="lg:pl-64"
            >
                <TopNav onMenuClick={() => setSidebarOpen(true)} />

                <main style={{ flex: 1, padding: "40px clamp(20px, 5vw, 60px)" }}>
                    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                        {/* Page Header */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                marginBottom: 40,
                                gap: 20,
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        background: "rgba(21, 96, 232, 0.08)",
                                        borderRadius: 100,
                                        padding: "6px 16px",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: t.blue,
                                        marginBottom: 16,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            background: t.teal,
                                            display: "inline-block",
                                        }}
                                    />
                                    Clinical Intelligence Portal
                                </div>
                                <h1
                                    style={{
                                        fontFamily: "Fraunces, serif",
                                        fontSize: "clamp(28px, 4vw, 38px)",
                                        fontWeight: 700,
                                        margin: 0,
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Doctor{" "}
                                    <em style={{ fontStyle: "italic", color: t.blue, fontWeight: 500 }}>
                                        Requests
                                    </em>
                                </h1>
                            </div>

                            <Button variant="secondary" style={{ height: 48, padding: "0 24px" }}>
                                <Download size={18} />
                                Export Requests
                            </Button>
                        </div>

                        {/* Search & Filters */}
                        <div
                            style={{
                                ...cardStyle,
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 24,
                                padding: "20px 24px",
                                flexWrap: "wrap",
                                gap: 16,
                                background: "rgba(255,255,255,0.7)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            {/* Search */}
                            <div style={{ position: "relative", minWidth: "clamp(280px, 40%, 500px)", flex: 1 }}>
                                <Search
                                    size={20}
                                    style={{
                                        position: "absolute",
                                        left: 16,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: t.sub,
                                        opacity: 0.6,
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or speciality..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px 14px 48px",
                                        borderRadius: 14,
                                        border: `1.5px solid ${t.border}`,
                                        fontSize: 15,
                                        outline: "none",
                                        fontFamily: "inherit",
                                        background: "white",
                                        color: "#000",
                                        transition: "border-color 0.2s",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                    }}
                                />
                            </div>

                        </div>

                        {/* Table */}
                        <div style={cardStyle}>
                            {loading ? (
                                <div style={{ padding: 100, textAlign: "center" }}>
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            border: `3px solid ${t.blueLight}`,
                                            borderTop: `3px solid ${t.blue}`,
                                            borderRadius: "50%",
                                            animation: "spin 1s linear infinite",
                                            margin: "0 auto 24px",
                                        }}
                                    />
                                    <p style={{ color: t.sub, fontWeight: 600, fontSize: 16 }}>
                                        Loading doctor requests...
                                    </p>
                                </div>
                            ) : requests.length === 0 ? (
                                <div style={{ padding: 100, textAlign: "center" }}>
                                    <div
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: "50%",
                                            background: t.blueLight,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 20px",
                                        }}
                                    >
                                        <Stethoscope size={32} color={t.blue} />
                                    </div>
                                    <h3
                                        style={{
                                            color: t.text,
                                            fontSize: 20,
                                            marginBottom: 10,
                                            fontWeight: 700,
                                        }}
                                    >
                                        No Doctor Requests Found
                                    </h3>
                                    <p style={{ color: t.sub, fontSize: 16 }}>
                                        Refine your filters or search criteria.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            textAlign: "left",
                                        }}
                                    >
                                        <thead style={{ background: t.blueXLight }}>
                                            <tr>
                                                {[
                                                    "Doctor Profile",
                                                    "Contact Info",
                                                    "Speciality",
                                                    "Experience",
                                                    "Fees (₹)",
                                                    "Status",
                                                    "Actions",
                                                ].map((col, i) => (
                                                    <th
                                                        key={col}
                                                        style={{
                                                            padding: "20px 24px",
                                                            fontSize: 12,
                                                            fontWeight: 800,
                                                            textTransform: "uppercase",
                                                            color: t.sub,
                                                            letterSpacing: "1.5px",
                                                            textAlign: i === 6 ? "center" : "left",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((req) => {
                                                const statusCfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                                                return (
                                                    <tr
                                                        key={req.id}
                                                        style={{
                                                            borderBottom: `1.5px solid ${t.blueXLight}`,
                                                            transition: "background 0.2s",
                                                        }}
                                                        className="table-row-hover"
                                                    >
                                                        {/* Doctor Profile */}
                                                        <td style={{ padding: "20px 24px" }}>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 16,
                                                                }}
                                                            >
                                                                {req.profileImage ? (
                                                                    <img
                                                                        src={req.profileImage}
                                                                        style={{
                                                                            width: 50,
                                                                            height: 50,
                                                                            borderRadius: 16,
                                                                            objectFit: "cover",
                                                                            border: `2px solid ${t.border}`,
                                                                        }}
                                                                        alt={req.name}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        style={{
                                                                            width: 50,
                                                                            height: 50,
                                                                            borderRadius: 16,
                                                                            background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
                                                                            color: "white",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            fontWeight: 700,
                                                                            fontSize: 18,
                                                                            boxShadow:
                                                                                "0 4px 10px rgba(21,96,232,0.15)",
                                                                            flexShrink: 0,
                                                                        }}
                                                                    >
                                                                        {getInitials(req.name)}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p
                                                                        style={{
                                                                            margin: 0,
                                                                            fontWeight: 700,
                                                                            color: t.text,
                                                                            fontSize: 15,
                                                                        }}
                                                                    >
                                                                        Dr. {req.name}
                                                                    </p>
                                                                    <p
                                                                        style={{
                                                                            margin: 0,
                                                                            color: t.sub,
                                                                            fontSize: 13,
                                                                        }}
                                                                    >
                                                                        {req.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Contact */}
                                                        <td
                                                            style={{
                                                                padding: "20px 24px",
                                                                fontSize: 14,
                                                                color: t.text,
                                                                fontWeight: 600,
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {req.phone}
                                                        </td>

                                                        {/* Speciality */}
                                                        <td style={{ padding: "20px 24px" }}>
                                                            <span
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: 6,
                                                                    background: t.blueLight,
                                                                    color: t.blue,
                                                                    borderRadius: 100,
                                                                    padding: "5px 12px",
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                <Stethoscope size={11} />
                                                                {req.speciality}
                                                            </span>
                                                        </td>

                                                        {/* Experience */}
                                                        <td
                                                            style={{
                                                                padding: "20px 24px",
                                                                fontSize: 14,
                                                                color: t.sub,
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {req.experience}
                                                        </td>

                                                        {/* Fees */}
                                                        <td
                                                            style={{
                                                                padding: "20px 24px",
                                                                fontSize: 14,
                                                                fontWeight: 700,
                                                                color: t.text,
                                                            }}
                                                        >
                                                            ₹{req.fees.toLocaleString()}
                                                        </td>

                                                        {/* Status */}
                                                        <td style={{ padding: "20px 24px" }}>
                                                            <span
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: 5,
                                                                    padding: "6px 14px",
                                                                    borderRadius: 100,
                                                                    fontSize: 11,
                                                                    fontWeight: 800,
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.5px",
                                                                    background: statusCfg.bg,
                                                                    color: statusCfg.color,
                                                                    border: `1px solid ${statusCfg.border}`,
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {statusCfg.icon}
                                                                {statusCfg.label}
                                                            </span>
                                                        </td>

                                                        {/* Actions */}
                                                        <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    gap: 8,
                                                                }}
                                                            >
                                                                {/* View */}
                                                                <button
                                                                    onClick={() =>
                                                                        navigate(
                                                                            FRONTEND_ROUTES.ADMIN_DOCTOR_REQUEST_DETAILS(req.id)
                                                                        )
                                                                    }
                                                                    title="View Details"
                                                                    style={{
                                                                        width: 38,
                                                                        height: 38,
                                                                        borderRadius: 12,
                                                                        border: "none",
                                                                        background: t.blueLight,
                                                                        color: t.blue,
                                                                        cursor: "pointer",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        transition: "all 0.2s",
                                                                    }}
                                                                    onMouseEnter={(e) =>
                                                                        (e.currentTarget.style.transform = "scale(1.08)")
                                                                    }
                                                                    onMouseLeave={(e) =>
                                                                        (e.currentTarget.style.transform = "scale(1)")
                                                                    }
                                                                >
                                                                    <Eye size={18} />
                                                                </button>

                                                                {/* Accept — only if pending */}
                                                                {req.status === "pending" && (
                                                                    <button
                                                                        onClick={() => handleAccept(req.id)}
                                                                        title="Accept"
                                                                        style={{
                                                                            width: 38,
                                                                            height: 38,
                                                                            borderRadius: 12,
                                                                            border: "none",
                                                                            background: "rgba(0,191,165,0.10)",
                                                                            color: "#0f6e56",
                                                                            cursor: "pointer",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            transition: "all 0.2s",
                                                                        }}
                                                                        onMouseEnter={(e) =>
                                                                        (e.currentTarget.style.transform =
                                                                            "scale(1.08)")
                                                                        }
                                                                        onMouseLeave={(e) =>
                                                                            (e.currentTarget.style.transform = "scale(1)")
                                                                        }
                                                                    >
                                                                        <CheckCircle2 size={18} />
                                                                    </button>
                                                                )}

                                                                {/* Reject — only if pending */}
                                                                {req.status === "pending" && (
                                                                    <button
                                                                        onClick={() => handleReject(req.id)}
                                                                        title="Reject"
                                                                        style={{
                                                                            width: 38,
                                                                            height: 38,
                                                                            borderRadius: 12,
                                                                            border: "none",
                                                                            background: "rgba(244,63,94,0.08)",
                                                                            color: "#f43f5e",
                                                                            cursor: "pointer",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            transition: "all 0.2s",
                                                                        }}
                                                                        onMouseEnter={(e) =>
                                                                        (e.currentTarget.style.transform =
                                                                            "scale(1.08)")
                                                                        }
                                                                        onMouseLeave={(e) =>
                                                                            (e.currentTarget.style.transform = "scale(1)")
                                                                        }
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div
                                    style={{
                                        padding: "32px",
                                        borderTop: `1.5px solid ${t.blueXLight}`,
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            border: `1.5px solid ${t.border}`,
                                            background: "white",
                                            color: t.sub,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: page === 1 ? "not-allowed" : "pointer",
                                            opacity: page === 1 ? 0.4 : 1,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {pagesToShow.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                fontSize: 15,
                                                fontWeight: 700,
                                                border: p === page ? "none" : `1.5px solid ${t.border}`,
                                                background:
                                                    p === page
                                                        ? `linear-gradient(135deg, ${t.blue}, ${t.blue2})`
                                                        : "white",
                                                color: p === page ? "white" : t.text,
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                boxShadow:
                                                    p === page
                                                        ? "0 4px 12px rgba(21,96,232,0.3)"
                                                        : "none",
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            border: `1.5px solid ${t.border}`,
                                            background: "white",
                                            color: t.sub,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: page === totalPages ? "not-allowed" : "pointer",
                                            opacity: page === totalPages ? 0.4 : 1,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .lg\\:pl-64 { padding-left: 256px !important; }
                .table-row-hover:hover { background-color: rgba(21, 96, 232, 0.02) !important; }
                @media (max-width: 1024px) {
                    .lg\\:pl-64 { padding-left: 0 !important; }
                    .hidden.lg\\:block { display: none !important; }
                }
                body { margin: 0; padding: 0; }
            `}</style>
        </div>
    );
};

export default DoctorRequestsListPage;