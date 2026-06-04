import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import doctorService from "../../services/DoctorService";
import { appointmentService } from "../../services/AppointmentService";
import authService from "../../services/AuthService";
import { paymentService } from "../../services/PaymentService";
import { FRONTEND_ROUTES } from "../../utils/constants";

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Ensures the Razorpay checkout.js script is loaded, then resolves. */
function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Razorpay !== "undefined") {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      // Script tag present but not yet executed — wait for it
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Razorpay SDK failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.head.appendChild(script);
  });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const convertTo12Hour = (time24: string): string => {
  if (!time24) return "";
  const [hourStr, minStr] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
};

const classifySlot = (time24: string): "MORNING" | "AFTERNOON" | "EVENING" => {
  if (!time24) return "MORNING";
  const hour = parseInt(time24.split(":")[0], 10);
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
};

const StarRating = ({ rating }: { rating: number }) => (
  <span style={{ display: "inline-flex", gap: "1px" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width="11" height="11" viewBox="0 0 14 14" fill={i <= Math.floor(rating) ? "#F59E0B" : "#E5E7EB"}>
        <polygon points="7,1 8.8,5.4 13.6,5.9 10.1,9 11.2,13.7 7,11.1 2.8,13.7 3.9,9 0.4,5.9 5.2,5.4" />
      </svg>
    ))}
  </span>
);

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const today = new Date();

  // Doctor details state
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar states
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  // Slot states
  const [slotsList, setSlotsList] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotObj, setSelectedSlotObj] = useState<any>(null);

  // Form states
  const [consultationType, setConsultationType] = useState<"video" | "chat">("video");
  const [reason, setReason] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState("");

  // Fetch doctor profile details on mount
  useEffect(() => {
    if (!id) return;
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getDoctorDetailsById(id);
        if (res?.success && res?.data) {
          setDoctor(res.data);
        } else {
          setError("Failed to fetch doctor profile information.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctor details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  

  // Fetch slots whenever selectedDate or month changes
  useEffect(() => {
    if (!id) return;
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;
        const res = await doctorService.getAvailableSlots(id, dateStr);
        if (res?.success && Array.isArray(res?.data)) {
          setSlotsList(res.data);
          // Check if previously selected slot is still in the new list and is available
          const stillAvailable = res.data.find(
            (s: any) => s.startTime === selectedSlotObj?.startTime && s.isAvailable
          );
          if (!stillAvailable) {
            setSelectedSlotObj(null);
          }
        } else {
          setSlotsList([]);
          setSelectedSlotObj(null);
        }
      } catch (err) {
        console.error("Failed to load slots:", err);
        setSlotsList([]);
        setSelectedSlotObj(null);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [id, viewYear, viewMonth, selectedDate]);

  // Calendar logic
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    let newMonth = viewMonth;
    let newYear = viewYear;
    if (viewMonth === 0) {
      newMonth = 11;
      newYear = viewYear - 1;
    } else {
      newMonth = viewMonth - 1;
    }
    const daysInNewMonth = getDaysInMonth(newYear, newMonth);
    if (selectedDate > daysInNewMonth) {
      setSelectedDate(daysInNewMonth);
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const nextMonth = () => {
    let newMonth = viewMonth;
    let newYear = viewYear;
    if (viewMonth === 11) {
      newMonth = 0;
      newYear = viewYear + 1;
    } else {
      newMonth = viewMonth + 1;
    }
    const daysInNewMonth = getDaysInMonth(newYear, newMonth);
    if (selectedDate > daysInNewMonth) {
      setSelectedDate(daysInNewMonth);
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const isPastDate = (year: number, month: number, day: number) => {
    const checkDate = new Date(year, month, day, 23, 59, 59, 999);
    return checkDate < today;
  };

  // Classify fetched slots
  const morningSlots = slotsList.filter(s => classifySlot(s.startTime) === "MORNING");
  const afternoonSlots = slotsList.filter(s => classifySlot(s.startTime) === "AFTERNOON");
  const eveningSlots = slotsList.filter(s => classifySlot(s.startTime) === "EVENING");

  // Calculations
  const baseFee = consultationType === "video" ? (doctor?.VideoFees || 500) : (doctor?.ChatFees || 300);
  const platformFee = 29;
  const gstFee = Math.round(baseFee * 0.18);
  const totalAmount = baseFee + platformFee + gstFee;

  // Selected date formatting
  const formattedSelectedDate = new Date(viewYear, viewMonth, selectedDate);
  const shortDate = formattedSelectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const renderSlotButton = (slot: any) => {
    const isBooked = !slot.isAvailable;
    const isSel = selectedSlotObj?.startTime === slot.startTime;
    const slotTime12 = convertTo12Hour(slot.startTime);
    return (
      <button
        key={slot.slotId || slot.startTime}
        onClick={() => !isBooked && setSelectedSlotObj(slot)}
        disabled={isBooked}
        style={{
          border: isSel ? "2px solid #2563EB" : "1.5px solid #E2E8F0",
          background: isSel ? "#2563EB" : isBooked ? "#F8FAFC" : "#fff",
          color: isSel ? "#fff" : isBooked ? "#94A3B8" : "#374151",
          borderRadius: "10px",
          padding: "10px 0",
          fontSize: "12px",
          fontWeight: 600,
          cursor: isBooked ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          textDecoration: isBooked ? "line-through" : "none",
          opacity: isBooked ? 0.6 : 1,
        }}
      >
        {slotTime12}
      </button>
    );
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", border: "4px solid #EFF6FF", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: "14px", color: "#64748B", fontWeight: 500 }}>Loading scheduling engine...</div>
          </div>
          <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 0" }}>
          <div style={{ background: "#fff", padding: "40px", borderRadius: "20px", border: "1px solid #E2E8F0", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ width: "56px", height: "56px", background: "#FEF2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 style={{ fontSize: "18px", color: "#0F172A", fontWeight: 700, marginBottom: "8px" }}>Loading Error</h3>
            <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "24px" }}>{error || "Doctor profile details could not be found."}</p>
            <button onClick={() => navigate(FRONTEND_ROUTES.DOCTORS)} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 24px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Back to Doctors</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const doctorName = `Dr. ${doctor.userId?.name || doctor.name || "Specialist"}`;
  const specialty = doctor.specialty || "General Specialist";
  const experience = doctor.experienceYears !== undefined ? `${doctor.experienceYears} Years Experience` : "Highly Experienced";
  const doctorImage = doctor.userId?.profileImage || doctor.profileImage || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face";
  const rating = doctor.ratingAvg || doctor.rating || 4.8;
  const reviewCount = doctor.reviewCount || 32;
  const city = doctor.userId?.address?.city || doctor.city || "Mumbai";
  const state = doctor.userId?.address?.state || doctor.state || "Maharashtra";

  const startPaymentFlow = async (appointmentId: string) => {
    setBookingInProgress(true);
    setPaymentFailed(false);
    try {
      const order = await paymentService.createRazorpayOrder({
        appointmentId,
        amount: totalAmount,
      });

      const options = {
        key: order.keyId || import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Clinical Intelligence",
        description: "Consultation Fee",
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            const verify = await paymentService.verifyRazorpayPayment({
              appointmentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify?.appointmentId || verify?.paymentId) {
              setConfirmed(true);
              setCreatedAppointmentId(null);
              toast.success("Payment successful! Appointment confirmed.");
              setTimeout(() => {
                navigate(FRONTEND_ROUTES.PATIENT_PROFILE, { state: { activeTab: "My Appointments" } });
              }, 2200);
            } else {
              setPaymentErrorMsg("Payment verification failed. Please try again or contact support.");
              setPaymentFailed(true);
              setCreatedAppointmentId(appointmentId);
            }
          } catch (verifyErr: any) {
            setPaymentErrorMsg(verifyErr?.response?.data?.message || "Payment verification error occurred.");
            setPaymentFailed(true);
            setCreatedAppointmentId(appointmentId);
          } finally {
            setBookingInProgress(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentErrorMsg("Payment process was cancelled by the user.");
            setPaymentFailed(true);
            setCreatedAppointmentId(appointmentId);
            setBookingInProgress(false);
          },
        },
        theme: { color: "#2563EB" },
      };

      await loadRazorpay();
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Razorpay Payment Failed:", response.error);
        setPaymentErrorMsg(response.error?.description || "Payment failed. Please check your balance or details.");
        setPaymentFailed(true);
        setCreatedAppointmentId(appointmentId);
        setBookingInProgress(false);
      });
      rzp.open();
    } catch (e: any) {
      console.error(e);
      setPaymentErrorMsg(e?.response?.data?.message || e?.message || "Something went wrong during payment initiation.");
      setPaymentFailed(true);
      setCreatedAppointmentId(appointmentId);
      setBookingInProgress(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Main Container */}
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "30px 20px 60px", display: "flex", gap: "24px", flexDirection: "row" }}>

        {/* Left Column: Calendar, Consultation Type & Slots */}
        <div style={{ flex: 1.6, display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Header Banner */}
          <div style={{ background: "linear-gradient(135deg, #1E3A8A, #2563EB)", borderRadius: "18px", padding: "24px 28px", color: "#fff", boxShadow: "0 4px 20px rgba(37,99,235,0.15)" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", background: "rgba(255,255,255,0.15)", padding: "4px 8px", borderRadius: "6px" }}>SECURE BOOKING ENGINE</span>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginTop: "12px", marginBottom: "6px" }}>Schedule Your Consultation</h2>
            <p style={{ fontSize: "13px", color: "#E0F2FE", opacity: 0.9 }}>Choose your preferred date, time slot, and communication channel below.</p>
          </div>

          {/* Calendar Box */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={prevMonth}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "#CBD5E1"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                >
                  <svg width="14" height="14" fill="none" stroke="#475569" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={nextMonth}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "#CBD5E1"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                >
                  <svg width="14" height="14" fill="none" stroke="#475569" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {/* Weekday initials */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", textAlign: "center", marginBottom: "8px" }}>
              {DAYS.map(d => (
                <span key={d} style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8" }}>{d}</span>
              ))}
            </div>

            {/* Calendar Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === selectedDate;
                const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
                const disabled = isPastDate(viewYear, viewMonth, day);

                return (
                  <button
                    key={day}
                    onClick={() => !disabled && setSelectedDate(day)}
                    disabled={disabled}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      border: "none",
                      background: isSelected ? "#2563EB" : "transparent",
                      color: isSelected ? "#fff" : isToday ? "#2563EB" : !disabled ? "#0F172A" : "#CBD5E1",
                      fontSize: "13px",
                      fontWeight: isSelected || isToday ? 700 : 500,
                      cursor: !disabled ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      transition: "background 0.15s",
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    {day}
                    {!disabled && !isSelected && (
                      <span style={{ position: "absolute", bottom: "3px", width: "4px", height: "4px", borderRadius: "50%", background: "#2563EB", opacity: 0.4 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consultation Type Selector */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" fill="#2563EB" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>Consultation Type</div>
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>Choose how you'd like to consult with the doctor</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setConsultationType("video")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: consultationType === "video" ? "2px solid #2563EB" : "1.5px solid #E2E8F0",
                  background: consultationType === "video" ? "#EFF6FF" : "#fff",
                  color: consultationType === "video" ? "#2563EB" : "#374151",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1-1.447l-2 1z" /></svg>
                Video Consultation (₹{doctor?.VideoFees || 500})
              </button>
              <button
                onClick={() => setConsultationType("chat")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: consultationType === "chat" ? "2px solid #2563EB" : "1.5px solid #E2E8F0",
                  background: consultationType === "chat" ? "#EFF6FF" : "#fff",
                  color: consultationType === "chat" ? "#2563EB" : "#374151",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" /></svg>
                Chat Consultation (₹{doctor?.ChatFees || 300})
              </button>
            </div>
          </div>

          {/* Time Slots Selector */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" fill="#2563EB" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.8-2.8a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>Select Consultation Time Slot</span>
            </div>

            {loadingSlots ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#64748B", fontSize: "13px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "24px", height: "24px", border: "3px solid #EFF6FF", borderTop: "3px solid #2563EB", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span>Checking available slots...</span>
              </div>
            ) : slotsList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#64748B", fontSize: "13px" }}>
                No slots found for this date. The doctor is either fully booked or has no slots scheduled for today. Please try another date!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {morningSlots.length > 0 && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", marginBottom: "8px" }}>MORNING</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {morningSlots.map(slot => renderSlotButton(slot))}
                    </div>
                  </div>
                )}
                {afternoonSlots.length > 0 && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", marginBottom: "8px" }}>AFTERNOON</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {afternoonSlots.map(slot => renderSlotButton(slot))}
                    </div>
                  </div>
                )}
                {eveningSlots.length > 0 && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "1px", marginBottom: "8px" }}>EVENING</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {eveningSlots.map(slot => renderSlotButton(slot))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reason for Consultation */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" fill="#2563EB" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>Reason for Appointment</div>
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>Briefly describe your symptoms or reason for booking</div>
              </div>
            </div>
            <textarea
              placeholder="e.g. Regular health checkup, severe toothache, persistent fever, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "12px",
                borderRadius: "10px",
                border: "1.5px solid #E2E8F0",
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563EB"}
              onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
            />
          </div>
        </div>

        {/* Right Column: Summaries & Checkout */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Doctor Card */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "18px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
              <img
                src={doctorImage}
                alt={doctorName}
                style={{ width: "52px", height: "52px", borderRadius: "12px", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face";
                }}
              />
              <div>
                <div style={{ fontSize: "15px", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#0F172A" }}>{doctorName}</div>
                <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: 600, marginBottom: "4px" }}>{specialty}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <StarRating rating={rating} />
                  <span style={{ fontSize: "10px", color: "#94A3B8" }}>{rating.toFixed(1)} ({reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", background: "#EFF6FF", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" fill="#2563EB" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                </div>
                <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{experience}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", background: "#EFF6FF", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" fill="#2563EB" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                </div>
                <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{city}, {state}</span>
              </div>
            </div>
          </div>

          {/* Appointment Summary */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
              <svg width="15" height="15" fill="#2563EB" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>Appointment Summary</span>
            </div>
            {[
              { label: "Date", value: shortDate, highlight: false },
              { label: "Time", value: selectedSlotObj ? convertTo12Hour(selectedSlotObj.startTime) : "Not Selected", highlight: true },
              { label: "Type", value: consultationType === "video" ? "Video Consultation" : "Chat Consultation", highlight: false },
              { label: "Duration", value: `${doctor?.defaultSlotDuration || 30} mins`, highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>{label}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: highlight ? "#2563EB" : "#374151" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Fee Summary */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
              <svg width="15" height="15" fill="#2563EB" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>Fee Summary</span>
            </div>
            {[
              { label: "Consultation Fee", value: `₹${baseFee}`, color: "#374151" },
              { label: "Platform Fee", value: `₹${platformFee}`, color: "#374151" },
              { label: "GST (18%)", value: `₹${gstFee}`, color: "#374151" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>{label}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color }}>{value}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px dashed #E2E8F0", paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>Total Amount</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#2563EB" }}>₹{totalAmount}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "8px" }}>
              <svg width="12" height="12" fill="#10B981" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span style={{ fontSize: "10px", color: "#10B981" }}>Pay securely after booking confirmation</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={async () => {
              if (!selectedSlotObj) return;
              setBookingInProgress(true);
              try {
                if (!authService.isAuthenticated()) {
                  toast.error("Authentication required. Please login as a patient to book appointments.");
                  navigate(FRONTEND_ROUTES.LOGIN);
                  setBookingInProgress(false);
                  return;
                }

                const doctorId = doctor?.doctorProfileId || doctor?.id || doctor?._id;
                if (!doctorId) {
                  toast.error("Doctor information missing. Cannot book appointment.");
                  setBookingInProgress(false);
                  return;
                }

                const appointmentDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;
                const appointmentPayload: any = {
                  doctorId,
                  appointmentDate,
                  appointmentTime: selectedSlotObj.startTime,
                  appointmentType: consultationType,
                  reason: reason.trim() || "General Consultation",
                };
                if (selectedSlotObj.slotId) {
                  appointmentPayload.slotId = selectedSlotObj.slotId;
                }

                const apptRes = await appointmentService.createAppointment(appointmentPayload);
                if (!apptRes?.success) {
                  toast.error(apptRes?.message || "Failed to create appointment. Please try again.");
                  setBookingInProgress(false);
                  return;
                }

                const realAppointmentId = apptRes?.data?._id || apptRes?.data?.id;
                if (!realAppointmentId) {
                  toast.error("Could not retrieve appointment ID after booking.");
                  setBookingInProgress(false);
                  return;
                }

                await startPaymentFlow(realAppointmentId);
              } catch (e: any) {
                console.error(e);
                toast.error(e?.response?.data?.message || e?.message || "Something went wrong. Please try again.");
                setBookingInProgress(false);
              }
            }}
            disabled={bookingInProgress || confirmed}
            style={{
              background: confirmed ? "#10B981" : "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: bookingInProgress || confirmed ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.3s",
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              opacity: bookingInProgress ? 0.8 : 1,
            }}
          >
            {bookingInProgress ? (
              <>
                <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Reserving Slot...
              </>
            ) : confirmed ? (
              <>
                <svg width="16" height="16" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Appointment Confirmed!
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                Confirm Appointment
              </>
            )}
          </button>
          <button
            onClick={() => navigate(`/doctors/${id || ""}`)}
            style={{ background: "none", border: "none", fontSize: "12px", color: "#64748B", cursor: "pointer", textAlign: "center", textDecoration: "underline" }}
          >
            ← Back to Doctor Profile
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <svg width="12" height="12" fill="#94A3B8" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <span style={{ fontSize: "10px", color: "#94A3B8" }}>256-bit SSL encrypted & secure</span>
          </div>
        </div>
      </div>

      {paymentFailed && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "24px",
            width: "90%",
            maxWidth: "460px",
            padding: "36px 30px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #F1F5F9",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div style={{
              width: "72px",
              height: "72px",
              background: "#FEF2F2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              color: "#EF4444"
            }}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 style={{
              fontSize: "20px",
              color: "#0F172A",
              fontWeight: 800,
              marginBottom: "12px"
            }}>
              Payment Declined or Cancelled
            </h3>

            <p style={{
              fontSize: "14px",
              color: "#64748B",
              lineHeight: "1.6",
              marginBottom: "28px"
            }}>
              {paymentErrorMsg || "The transaction was unsuccessful. Please check your payment credentials, card details, or UPI handle and try again."}
            </p>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "100%"
            }}>
              <button
                onClick={() => {
                  if (createdAppointmentId) {
                    startPaymentFlow(createdAppointmentId);
                  }
                }}
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                  transition: "all 0.2s"
                }}
              >
                Try Payment Again
              </button>

              <button
                onClick={async () => {
                  if (createdAppointmentId) {
                    await paymentService.unlockSlot(createdAppointmentId);
                  }
                  setPaymentFailed(false);
                  setCreatedAppointmentId(null);
                }}
                style={{
                  background: "#F8FAFC",
                  color: "#475569",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Cancel & Change Slot
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}