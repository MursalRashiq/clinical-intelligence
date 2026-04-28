/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/Admin/Sidebar";
import TopNav from "../../components/Admin/TopNav";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Pie, PieChart, Label } from "recharts";
import { TrendingUp, Download, Users, Activity, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { theme as t } from "../../theme";

// --- Mock Data ---
const MOCK_STATS = {
    totalStats: {
        totalRevenue: 125430,
        totalAppointments: 1452,
        activeDoctors: 48,
        totalPatients: 3210
    },
    revenueGraph: [
        { date: "Jan", amount: 4000, appointments: 40 },
        { date: "Feb", amount: 3000, appointments: 30 },
        { date: "Mar", amount: 5000, appointments: 50 },
        { date: "Apr", amount: 2780, appointments: 27 },
        { date: "May", amount: 1890, appointments: 18 },
        { date: "Jun", amount: 2390, appointments: 23 },
        { date: "Jul", amount: 3490, appointments: 34 },
    ],
    statusDistribution: {
        completed: 850,
        confirmed: 420,
        pending: 120,
        cancelled: 62
    },
    topDoctors: [
        { name: "Sarah Johnson", specialty: "Cardiologist", appointments: 124, revenue: 25000, profileImage: "" },
        { name: "Michael Chen", specialty: "Dermatologist", appointments: 98, revenue: 18500, profileImage: "" },
        { name: "Emily Brown", specialty: "Pediatrician", appointments: 85, revenue: 12000, profileImage: "" },
        { name: "David Wilson", specialty: "Neurologist", appointments: 72, revenue: 15400, profileImage: "" },
    ]
};

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats] = useState<any>(MOCK_STATS);

    // Prevent back button from navigating to login page
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const chartData = useMemo(() => {
        if (!stats?.revenueGraph) return [];
        return stats.revenueGraph.map((item: any) => ({
            date: item.date,
            revenue: item.amount || 0,
            appointments: item.appointments || 0,
        }));
    }, [stats]);

    const totals = useMemo(() => {
        if (!chartData.length) return { revenue: 0, appointments: 0 };
        return {
            revenue: chartData.reduce((acc: number, curr: any) => acc + curr.revenue, 0),
            appointments: chartData.reduce((acc: number, curr: any) => acc + curr.appointments, 0),
        };
    }, [chartData]);

    const statusData = useMemo(() => [
        { name: "Completed", value: stats.statusDistribution.completed, fill: t.teal },
        { name: "Confirmed", value: stats.statusDistribution.confirmed, fill: t.blue },
        { name: "Pending", value: stats.statusDistribution.pending, fill: "#F59E0B" },
        { name: "Cancelled", value: stats.statusDistribution.cancelled, fill: "#F43F5E" },
    ], [stats]);

    const totalAppointments = stats.statusDistribution.completed + stats.statusDistribution.confirmed + stats.statusDistribution.pending + stats.statusDistribution.cancelled;
    const completedPercentage = Math.round((stats.statusDistribution.completed / totalAppointments) * 100);

    const statCards = [
        { label: "Total Revenue", value: `₹${stats.totalStats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" style={{ color: t.teal }} />, bg: t.blueLight },
        { label: "Total Patients", value: stats.totalStats.totalPatients.toLocaleString(), icon: <Users className="w-6 h-6" style={{ color: t.blue }} />, bg: t.blueLight },
        { label: "Appointments", value: stats.totalStats.totalAppointments.toLocaleString(), icon: <Calendar className="w-6 h-6" style={{ color: t.blue2 }} />, bg: t.blueLight },
        { label: "Active Doctors", value: stats.totalStats.activeDoctors.toLocaleString(), icon: <Activity className="w-6 h-6" style={{ color: t.brandLight }} />, bg: t.blueLight },
    ];

    const handleDownloadReport = () => {
        toast.info("Generating static PDF report...");
        setTimeout(() => toast.success("Report downloaded successfully"), 2000);
    };

    const cardStyle = {
        background: "white",
        borderRadius: 20,
        boxShadow: "0 4px 20px rgba(21,96,232,0.05)",
        border: `1.5px solid ${t.border}`,
        padding: 24,
        overflow: "hidden" as const
    };

    const headerStyle = {
        fontFamily: "Fraunces, serif",
        color: t.text,
        fontWeight: 700,
        marginBottom: 8
    };

    return (
        <div style={{ 
            display: "flex", 
            minHeight: "100vh", 
            background: "linear-gradient(160deg, #f4f7fe 0%, #eaf0fd 60%, #e0edfb 100%)",
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <link
                href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <div style={{ width: 256, position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50 }} className="hidden lg:block">
                <Sidebar />
            </div>

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

            <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 256 }} className="lg:pl-64">
                <TopNav onMenuClick={() => setSidebarOpen(true)} />
                
                <main style={{ flex: 1, padding: "32px clamp(16px, 4vw, 48px)" }}>
                    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                        
                        {/* Hero-like Header */}
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: 7, 
                                background: t.blueLight, 
                                border: `1px solid ${t.border}`, 
                                borderRadius: 100, 
                                padding: "6px 14px", 
                                fontSize: 12, 
                                fontWeight: 700, 
                                color: t.blue, 
                                marginBottom: 12 
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.teal }} />
                                Admin Portal
                            </div>
                            <h1 style={{ ...headerStyle, fontSize: 32 }}>Platform <em style={{ fontStyle: "italic", color: t.blue }}>Analytics</em></h1>
                            <p style={{ color: t.sub, fontSize: 15 }}>Monitor your clinical operations and performance in real-time.</p>
                        </div>

                        {/* Top Action Bar */}
                        <div style={{ 
                            ...cardStyle, 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            marginBottom: 32,
                            padding: "16px 24px"
                        }}>
                            <div>
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>Global Statistics</h3>
                                <p style={{ fontSize: 11, color: t.sub }}>Daily performance overview</p>
                            </div>
                            <button
                                onClick={handleDownloadReport}
                                style={{
                                    padding: "10px 20px",
                                    background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
                                    color: "white",
                                    border: "none",
                                    borderRadius: 12,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(21,96,232,0.2)"
                                }}
                            >
                                <Download size={16} />
                                Download Report
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
                            gap: 24, 
                            marginBottom: 32 
                        }}>
                            {statCards.map((card, idx) => (
                                <div key={idx} style={cardStyle}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ 
                                            width: 48, 
                                            height: 48, 
                                            borderRadius: 14, 
                                            background: card.bg, 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "center" 
                                        }}>
                                            {card.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: t.sub }}>{card.label}</div>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: t.text, fontFamily: "Fraunces, serif" }}>{card.value}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32, marginBottom: 32 }}>
                            {/* Main Chart */}
                            <div style={{ ...cardStyle, flex: 2 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h3 style={{ ...headerStyle, fontSize: 18, marginBottom: 0 }}>Revenue Overview</h3>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase" }}>Total Revenue</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>₹{totals.revenue.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div style={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="date" stroke={t.sub} fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke={t.sub} fontSize={12} tickLine={false} axisLine={false} />
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                                                cursor={{ fill: 'rgba(21,96,232,0.05)' }} 
                                            />
                                            <Bar dataKey="revenue" fill={t.blue} radius={[6, 6, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Status Distribution */}
                            <div style={{ ...cardStyle }}>
                                <h3 style={{ ...headerStyle, fontSize: 18 }}>Appointment Status</h3>
                                <div style={{ height: 260 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <RechartsTooltip />
                                            <Pie
                                                data={statusData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={60}
                                                outerRadius={85}
                                                stroke="none"
                                            >
                                                <Label
                                                    content={({ viewBox }: any) => {
                                                        const { cx, cy } = viewBox;
                                                        return (
                                                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan x={cx} y={cy} style={{ fontSize: 28, fontWeight: 700, fill: t.text }}>{totalAppointments}</tspan>
                                                                <tspan x={cx} y={cy + 20} style={{ fontSize: 12, fill: t.sub }}>Total</tspan>
                                                            </text>
                                                        )
                                                    }}
                                                />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                                    {statusData.map(s => (
                                        <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.fill }} />
                                            <span style={{ fontSize: 12, color: t.sub, fontWeight: 500 }}>{s.name}: </span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 24, padding: "12px", background: t.blueLight, borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                    <TrendingUp size={16} style={{ color: t.teal }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{completedPercentage}% Completion Rate</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Doctors List */}
                        <div style={cardStyle}>
                            <h3 style={{ ...headerStyle, fontSize: 18, marginBottom: 24 }}>Top Performing Specialists</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {stats.topDoctors.map((doc: any, idx: number) => (
                                    <div key={idx} style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "space-between",
                                        padding: "16px",
                                        borderRadius: 16,
                                        background: t.blueXLight,
                                        border: `1px solid ${t.border}`
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            <div style={{ 
                                                width: 32, 
                                                height: 32, 
                                                borderRadius: "50%", 
                                                background: "white", 
                                                display: "flex", 
                                                alignItems: "center", 
                                                justifyContent: "center",
                                                fontSize: 12,
                                                fontWeight: 800,
                                                color: t.blue
                                            }}>#{idx + 1}</div>
                                            <div style={{ 
                                                width: 48, 
                                                height: 48, 
                                                borderRadius: 14, 
                                                background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
                                                color: "white",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                                fontWeight: 700
                                            }}>
                                                {doc.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Dr. {doc.name}</div>
                                                <div style={{ fontSize: 13, color: t.sub }}>{doc.specialty}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 32, textAlign: "right" }}>
                                            <div>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase" }}>Appointments</div>
                                                <div style={{ fontSize: 16, fontWeight: 700, color: t.blue }}>{doc.appointments}</div>
                                            </div>
                                            <div className="hidden sm:block">
                                                <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase" }}>Revenue</div>
                                                <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>₹{doc.revenue.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                .lg\\:pl-64 { padding-left: 256px !important; }
                @media (max-width: 1024px) {
                    .lg\\:pl-64 { padding-left: 0 !important; }
                    .hidden.lg\\:block { display: none !important; }
                }
                @media (max-width: 640px) {
                    .hidden.sm\\:block { display: none !important; }
                }
                body { margin: 0; }
                * { box-sizing: border-box; }
            `}</style>
        </div>
    );
};

export default Dashboard;
