import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import doctorService from "../../services/DoctorService";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div style={{ display: "flex", gap: "2px" }}>
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={i < Math.floor(rating) ? "#F59E0B" : i < rating ? "url(#half)" : "#E5E7EB"}>
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <polygon points="7,1 8.8,5.4 13.6,5.9 10.1,9 11.2,13.7 7,11.1 2.8,13.7 3.9,9 0.4,5.9 5.2,5.4" />
      </svg>
    ))}
  </div>
);

const BadgeTag = ({ label }: { label: string }) => (
  <span style={{
    background: "#EFF6FF",
    color: "#3B82F6",
    fontSize: "11px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid #BFDBFE",
  }}>{label}</span>
);

const RelatedDoctorCard = ({
  name, specialty, location, distance, fee, rating, available, img
}: {
  name: string; specialty: string; location: string; distance: string;
  fee: number; rating: number; available: boolean; img: string;
}) => (
  <div style={{
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    minWidth: 0,
  }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
    }}
  >
    <div style={{ position: "relative" }}>
      <img src={img} alt={name} style={{ width: "100%", height: "160px", objectFit: "cover", objectPosition: "top" }} />
      <div style={{
        position: "absolute", top: "10px", left: "10px",
        background: "#1D4ED8", color: "#fff", fontSize: "11px",
        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
        padding: "2px 8px", borderRadius: "999px",
      }}>★ {rating}</div>
      <div style={{
        position: "absolute", top: "10px", right: "10px",
        background: available ? "#D1FAE5" : "#FEE2E2",
        color: available ? "#065F46" : "#991B1B",
        fontSize: "10px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        padding: "2px 8px", borderRadius: "999px",
      }}>{available ? "● Available" : "● Unavailable"}</div>
    </div>
    <div style={{ padding: "14px" }}>
      <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "'DM Sans', sans-serif", marginBottom: "4px" }}>{specialty}</div>
      <div style={{ fontSize: "14px", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>{name}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#6B7280", fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>
        <svg width="12" height="12" fill="#9CA3AF" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
        {location} · {distance}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }}>Consultation Fees</div>
          <div style={{ fontSize: "15px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#111827" }}>₹{fee}</div>
        </div>
        <button style={{
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          color: "#fff", border: "none", borderRadius: "8px",
          padding: "8px 14px", fontSize: "12px",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          cursor: "pointer",
        }}>Book Now</button>
      </div>
    </div>
  </div>
);

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getDoctorDetailsById(id);
        if (res?.success && res?.data) {
          setDoctor(res.data);
        } else {
          setError("Failed to load doctor details");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const relatedDoctors = [
    { name: "Dr. Travis Barton", specialty: "Psychologist", location: "Newark, LA", distance: "60 Min", fee: 480, rating: 4.8, available: true, img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop&crop=top" },
    { name: "Dr. Daisy Malcolm", specialty: "Endocrinologist", location: "Lexington, KY", distance: "80 Min", fee: 520, rating: 3.2, available: true, img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=300&fit=crop&crop=top" },
    { name: "Dr. Ann Bell", specialty: "Phlebologist", location: "Minneapolis, MN", distance: "30 Min", fee: 630, rating: 4.2, available: false, img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&crop=top" },
    { name: "Dr. Tyrone Patrick", specialty: "Cardiologist", location: "Clark Fork, ID", distance: "30 Min", fee: 360, rating: 4.4, available: false, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop&crop=top" },
  ];

  const tabs = ["Overview", "Experience", "Reviews", "Availability"];

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
        <Navbar activePage="Doctors" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #2563EB33', borderTop: '4px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
        <Navbar activePage="Doctors" />
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#6B7280' }}>
          <h2 style={{ fontSize: 24, color: '#111827', marginBottom: 12 }}>Doctor Not Found</h2>
          <p>{error || "We couldn't find the doctor you are looking for."}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const locationStr = [doctor.city, doctor.state, doctor.country].filter(Boolean).join(', ') || "Virtual / Online";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* Navbar */}
      <Navbar activePage="Doctors" />

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)",
        padding: "32px 40px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>
            🏠 Home &gt; <span style={{ color: "#fff", fontWeight: 600 }}>Doctors</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "32px", margin: "0 0 8px 0", fontWeight: 800 }}>Doctors</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0 }}>Book appointments with 500+ verified specialists across the country</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "28px 20px" }}>

        {/* Doctor Card */}
        <div style={{
          background: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "24px", marginBottom: "20px",
        }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={doctor.profileImage || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face"}
                alt={doctor.name}
                style={{ width: "90px", height: "90px", borderRadius: "16px", objectFit: "cover", border: "3px solid #EFF6FF" }}
              />
              <div style={{
                position: "absolute", bottom: "-4px", right: "-4px",
                background: "#10B981", borderRadius: "50%", width: "18px", height: "18px",
                border: "2px solid #fff",
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: "0 0 4px 0", color: "#111827" }}>Dr. {doctor.name}</h2>
              <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>
                {doctor.qualifications?.join(', ') || "MBBS, MD"}
              </div>
              <div style={{ fontSize: "12px", color: "#2563EB", fontWeight: 600, marginBottom: "8px" }}>
                {doctor.specialty || "Specialist"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <StarRating rating={4.5} />
                <span style={{ fontSize: "12px", color: "#6B7280" }}>(35)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
                <svg width="12" height="12" fill="#9CA3AF" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                {locationStr}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {doctor.languages?.map((lang: string) => (
                  <BadgeTag key={lang} label={lang} />
                ))}
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280" }}>
                <svg width="14" height="14" fill="#F59E0B" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                35 Feedback
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280" }}>
                <svg width="12" height="12" fill="#9CA3AF" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                {locationStr}
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>₹{doctor.VideoFees || 500}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ background: "#EFF6FF", border: "none", borderRadius: "8px", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" fill="#2563EB" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                </button>
                <button style={{ background: "#EFF6FF", border: "none", borderRadius: "8px", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" fill="#2563EB" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                </button>
                <button 
                  onClick={() => navigate(`/doctors/${id}/book`)}
                  style={{
                    background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                    color: "#fff", border: "none", borderRadius: "10px",
                    padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}
                >Book Appointment</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Overview */}
        <div style={{
          background: "#fff", borderRadius: "20px", border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: "28px", overflow: "hidden",
        }}>
          {/* Tab Bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", padding: "0 24px" }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{
                background: "none", border: "none", padding: "16px 20px", cursor: "pointer",
                fontSize: "13px", fontWeight: activeTab === tab.toLowerCase() ? 700 : 500,
                color: activeTab === tab.toLowerCase() ? "#2563EB" : "#6B7280",
                borderBottom: activeTab === tab.toLowerCase() ? "2px solid #2563EB" : "2px solid transparent",
                marginBottom: "-1px", transition: "all 0.15s",
              }}>{tab}</button>
            ))}
          </div>

          <div style={{ padding: "28px 28px 20px" }}>
            {/* About Me */}
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#111827", marginBottom: "12px", marginTop: 0 }}>About Me</h3>
              <div style={{ width: "40px", height: "3px", background: "linear-gradient(90deg, #2563EB, #7C3AED)", borderRadius: "2px", marginBottom: "16px" }} />
              <p style={{ fontSize: "13px", lineHeight: "1.8", color: "#4B5563", margin: 0 }}>
                {doctor.about || "No biography provided by the doctor."}
              </p>
            </div>

            {/* Review */}
            <div style={{
              background: "#F8FAFC", borderRadius: "14px", padding: "18px 20px",
              border: "1px solid #E5E7EB",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "13px",
                  }}>A</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Adrian</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>19 Mar 2024</div>
                  </div>
                </div>
                <StarRating rating={4} />
              </div>
              <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#374151", margin: 0 }}>
                Dr. {doctor.name} has been my family's trusted doctor for years. Their genuine care and thorough approach to our health concerns makes every visit reassuring. The ability to listen and explain complex health issues in an understandable way is exemplary. We are grateful to have such a dedicated physician by our side.
              </p>
            </div>
          </div>
        </div>

        {/* Related Doctors */}
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#111827", marginBottom: "18px" }}>Related Doctors</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}>
            {relatedDoctors.map(doc => (
              <RelatedDoctorCard key={doc.name} {...doc} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}