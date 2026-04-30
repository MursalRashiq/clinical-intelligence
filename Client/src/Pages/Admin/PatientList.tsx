import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/Admin/Sidebar";
import TopNav from "../../components/Admin/TopNav";
import { adminService } from "../../services/AdminService";
import { FRONTEND_ROUTES } from "../../utils/constants";
import { ChevronLeft, ChevronRight, Eye, Search, Check, ChevronDown, UserX, UserCheck, Filter, Download } from "lucide-react";
import { theme as t } from "../../theme";

interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
    gender: string;
    dob: string | null;
    createdAt: string;
    isActive: boolean;
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

// --- Premium UI Components (Internal) ---
const Button = ({ children, className, onClick, disabled, variant = "default", size = "md", style }: ButtonProps) => {
    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        fontWeight: "600",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        border: "none",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        gap: "8px",
        outline: "none"
    };
    
    const variants: Record<string, React.CSSProperties> = {
        default: { background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`, color: "white", boxShadow: "0 4px 12px rgba(21,96,232,0.2)" },
        ghost: { background: "transparent", color: t.sub },
        outline: { background: "white", color: t.text, border: `1.5px solid ${t.border}` },
        secondary: { background: t.blueLight, color: t.blue }
    };
    
    const sizes: Record<string, React.CSSProperties> = {
        sm: { padding: "6px 12px", fontSize: "12px" },
        md: { padding: "10px 20px", fontSize: "14px" },
        lg: { padding: "14px 28px", fontSize: "15px" }
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

const limit = 8;

const PatientsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
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
        return name.split(" ").filter(Boolean).map(s => s[0]).join("").slice(0, 2).toUpperCase();
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchPatients = useCallback(async (currentPage: number) => {
        setLoading(true);
        try {
            const filters: { search?: string; isActive?: string } = {};
            if (debouncedSearch) filters.search = debouncedSearch;
            if (statusFilter !== "all") filters.isActive = statusFilter;

            const res = await adminService.getAllPatients(currentPage, limit, filters);
            if (res?.success && res.data) {
                setPatients(res.data.patients || []);
                setTotalPages(res.data.totalPages || 1);
            } else {
                toast.error(res?.message || "Failed to fetch patients");
                setPatients([]);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Error connecting to server";
            toast.error(message);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchPatients(page);
    }, [page, fetchPatients]);

    const handleToggleStatus = async (patientId: string, currentStatus: boolean) => {
        try {
            let res;
            if (currentStatus) {
                res = await adminService.blockPatient(patientId);
            } else {
                res = await adminService.unblockPatient(patientId);
            }

            if (res?.success) {
                toast.success(res.message || `Patient ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
                setPatients(prev => prev.map(p => 
                    p.id === patientId ? { ...p, isActive: !currentStatus } : p
                ));
            } else {
                toast.error(res?.message || `Failed to ${currentStatus ? 'block' : 'unblock'} patient`);
            }
        } catch {
            toast.error("An error occurred while updating patient status");
        }
    };

    const pagesToShow = useMemo(() => {
        const pages: number[] = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, (page + 2) || 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [page, totalPages]);

    const cardStyle = {
        background: "white",
        borderRadius: 24,
        boxShadow: "0 10px 40px rgba(21,96,232,0.04)",
        border: `1.5px solid ${t.border}`,
        overflow: "hidden" as const
    };

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: t.text
        }}>
            <link
                href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            {/* Sidebar */}
            <div style={{ width: 256, position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50 }} className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 60 }} className="lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            style={{ position: "absolute", inset: 0, background: "rgba(15, 28, 46, 0.4)", backdropFilter: "blur(4px)" }}
                        />
                        <motion.div
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ type: "spring", damping: 30, stiffness: 450 }}
                            style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 256, background: "white", boxShadow: "24px 0 48px rgba(0,0,0,0.1)" }}
                        >
                            <Sidebar onMobileClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 256, minWidth: 0 }} className="lg:pl-64">
                <TopNav onMenuClick={() => setSidebarOpen(true)} />

                <main style={{ flex: 1, padding: "40px clamp(20px, 5vw, 60px)" }}>
                    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                        {/* Page Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, gap: 20, flexWrap: "wrap" }}>
                            <div>
                                <div style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(21, 96, 232, 0.08)",
                                    borderRadius: 100,
                                    padding: "6px 16px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: t.blue,
                                    marginBottom: 16
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.teal, display: "inline-block" }} />
                                    Clinical Intelligence Portal
                                </div>
                                <h1 style={{ fontFamily: "Fraunces, serif", fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                                    Patient <em style={{ fontStyle: "italic", color: t.blue, fontWeight: 500 }}>Management</em>
                                </h1>
                            </div>
                            
                            <Button variant="secondary" style={{ height: 48, padding: "0 24px" }}>
                                <Download size={18} />
                                Export Directory
                            </Button>
                        </div>

                        {/* Search & Filters */}
                        <div style={{
                            ...cardStyle,
                            display: "flex",
                            flexDirection: "row" as const,
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                            padding: "20px 24px",
                            flexWrap: "wrap" as const,
                            gap: 16,
                            background: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(10px)"
                        }}>
                            <div style={{ position: "relative", minWidth: "clamp(280px, 40%, 500px)" }} className="flex-1">
                                <Search size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: t.sub, opacity: 0.6 }} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or mobile..."
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
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ position: "relative" }}>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        style={{ height: 48, minWidth: 160, justifyContent: "space-between" }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Filter size={18} style={{ color: t.blue }} />
                                            {statusFilter === "all" ? "All Patients" : statusFilter === "true" ? "Active" : "Blocked"}
                                        </div>
                                        <ChevronDown size={16} />
                                    </Button>

                                    <AnimatePresence>
                                        {showFilterDropdown && (
                                            <>
                                                <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowFilterDropdown(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    style={{
                                                        position: "absolute",
                                                        top: "100%",
                                                        right: 0,
                                                        marginTop: 10,
                                                        background: "white",
                                                        borderRadius: 16,
                                                        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                                                        border: `1px solid ${t.border}`,
                                                        zIndex: 11,
                                                        width: 180,
                                                        padding: 8,
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    {[
                                                        { label: "All Patients", value: "all" },
                                                        { label: "Active Only", value: "true" },
                                                        { label: "Blocked Only", value: "false" }
                                                    ].map(item => (
                                                        <div
                                                            key={item.value}
                                                            onClick={() => { setStatusFilter(item.value); setPage(1); setShowFilterDropdown(false); }}
                                                            style={{
                                                                padding: "10px 14px",
                                                                fontSize: 14,
                                                                cursor: "pointer",
                                                                borderRadius: 10,
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                background: statusFilter === item.value ? t.blueLight : "transparent",
                                                                color: statusFilter === item.value ? t.blue : t.text,
                                                                fontWeight: statusFilter === item.value ? 700 : 500,
                                                                transition: "all 0.2s"
                                                            }}
                                                        >
                                                            {item.label}
                                                            {statusFilter === item.value && <Check size={16} />}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div style={cardStyle}>
                            {loading ? (
                                <div style={{ padding: 100, textAlign: "center" }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        border: `3px solid ${t.blueLight}`,
                                        borderTop: `3px solid ${t.blue}`,
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite",
                                        margin: "0 auto 24px"
                                    }} />
                                    <p style={{ color: t.sub, fontWeight: 600, fontSize: 16 }}>Syncing clinical records...</p>
                                </div>
                            ) : patients.length === 0 ? (
                                <div style={{ padding: 100, textAlign: "center" }}>
                                    <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.5 }}>📂</div>
                                    <h3 style={{ color: t.text, fontSize: 20, marginBottom: 10, fontWeight: 700 }}>No Clinical Records Found</h3>
                                    <p style={{ color: t.sub, fontSize: 16 }}>Refine your filters or search criteria.</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                        <thead style={{ background: t.blueXLight }}>
                                            <tr>
                                                <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: t.sub, letterSpacing: "1.5px" }}>Patient Profile</th>
                                                <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: t.sub, letterSpacing: "1.5px" }}>Contact Info</th>
                                                <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: t.sub, letterSpacing: "1.5px" }}>Gender</th>
                                                <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: t.sub, letterSpacing: "1.5px" }}>Clinical Status</th>
                                                <th style={{ padding: "20px 24px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: t.sub, letterSpacing: "1.5px", textAlign: "center" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patients.map((patient) => (
                                                <tr key={patient.id} style={{ borderBottom: `1.5px solid ${t.blueXLight}`, transition: "background 0.2s" }} className="table-row-hover">
                                                    <td style={{ padding: "20px 24px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                                            {patient.profileImage ? (
                                                                <img src={patient.profileImage} style={{ width: 50, height: 50, borderRadius: 16, objectFit: "cover", border: `2px solid ${t.border}` }} alt={patient.name} />
                                                            ) : (
                                                                <div style={{ width: 50, height: 50, borderRadius: 16, background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, boxShadow: "0 4px 10px rgba(21,96,232,0.15)" }}>
                                                                    {getInitials(patient.name)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p style={{ margin: 0, fontWeight: 700, color: t.text, fontSize: 15 }}>{patient.name}</p>
                                                                <p style={{ margin: 0, color: t.sub, fontSize: 13 }}>{patient.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "20px 24px", fontSize: 14, color: t.text, fontWeight: 600 }}>
                                                        {patient.phone}
                                                    </td>
                                                    <td style={{ padding: "20px 24px", fontSize: 14, color: t.sub, fontWeight: 500, textTransform: "capitalize" }}>
                                                        {patient.gender}
                                                    </td>
                                                    <td style={{ padding: "20px 24px" }}>
                                                        <span style={{
                                                            padding: "6px 14px",
                                                            borderRadius: 100,
                                                            fontSize: 11,
                                                            fontWeight: 800,
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.5px",
                                                            background: patient.isActive ? "rgba(0, 191, 165, 0.12)" : "rgba(244, 63, 94, 0.12)",
                                                            color: patient.isActive ? t.teal : "#f43f5e",
                                                            border: `1px solid ${patient.isActive ? "rgba(0, 191, 165, 0.2)" : "rgba(244, 63, 94, 0.2)"}`
                                                        }}>
                                                            {patient.isActive ? "Active" : "Blocked"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "20px 24px", textAlign: "center" }}>
                                                        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                                                            <button
                                                                onClick={() => navigate(FRONTEND_ROUTES.ADMIN_PATIENT_DETAILS(patient.id))}
                                                                style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: t.blueLight, color: t.blue, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                                title="Patient Profile"
                                                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                                            >
                                                                <Eye size={20} />
                                                            </button>
                                                            {patient.isActive ? (
                                                                <button
                                                                    onClick={() => handleToggleStatus(patient.id, patient.isActive)}
                                                                    style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "rgba(244, 63, 94, 0.08)", color: "#f43f5e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                                    title="Block Patient"
                                                                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                                                >
                                                                    <UserX size={20} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleToggleStatus(patient.id, patient.isActive)}
                                                                    style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "rgba(0, 191, 165, 0.08)", color: t.teal, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                                                    title="Unblock Patient"
                                                                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                                                >
                                                                    <UserCheck size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div style={{ padding: "32px", borderTop: `1.5px solid ${t.blueXLight}`, display: "flex", justifyContent: "center", gap: 10, alignItems: "center" }}>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${t.border}`, background: "white", color: t.sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, transition: "all 0.2s" }}
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
                                                background: p === page ? `linear-gradient(135deg, ${t.blue}, ${t.blue2})` : "white",
                                                color: p === page ? "white" : t.text,
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                boxShadow: p === page ? "0 4px 12px rgba(21,96,232,0.3)" : "none"
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${t.border}`, background: "white", color: t.sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, transition: "all 0.2s" }}
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

export default PatientsListPage;
