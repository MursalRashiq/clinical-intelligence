import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/userSlice";

// ─── Reusable shared components ───────────────────────────────────────────────
import Navbar        from "../components/Navbar";
import Footer        from "../components/Footer";
import DoctorCard    from "../components/Patient/DoctorCardHome";
import SpecialtyCard from "../components/Patient/SpecialtyCard";
import BookModal     from "../components/Patient/BookModal";
import HeartbeatIcon from "../components/HeartbeatIcon";

// ─── Shared data & theme ─────────────────────────────────────────────────────
import { doctors, specialties } from "../types/data";
import { theme as t }           from "../theme";
import { FRONTEND_ROUTES }      from "../utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

const Hero = ({ onBook: _onBook }: { onBook: (name: string) => void }) => {
  const [imgError, setImgError] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  return (
// ... (rest of Hero)
    <div
      style={{
        padding: "80px clamp(20px, 5vw, 80px) 0",
        background: "linear-gradient(160deg, #f4f7fe 0%, #eaf0fd 60%, #e0edfb 100%)",
        display: "flex",
        alignItems: "flex-end",
        gap: 60,
        minHeight: 600,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(21,96,232,.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ── Text ── */}
      <div
        style={{
          flex: 1,
          paddingBottom: 80,
          position: "relative",
          zIndex: 1,
          animation: "fadeInUp .6s ease both",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: t.blueLight,
            border: "1px solid rgba(21,96,232,.15)",
            borderRadius: 100,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: t.blue,
            marginBottom: 22,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: t.teal,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          Online Medical Center
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "clamp(36px, 4.5vw, 56px)",
            fontWeight: 700,
            color: t.text,
            lineHeight: 1.12,
            marginBottom: 18,
            margin: "0 0 18px",
          }}
        >
          Find the Best
          <br />
          <em style={{ fontStyle: "italic", color: t.blue }}>Doctors</em> Near You
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: 16,
            color: t.sub,
            lineHeight: 1.7,
            maxWidth: 440,
            marginBottom: 34,
          }}
        >
          Book appointments with verified specialists, manage prescriptions, and
          take control of your health — all in one place.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to={FRONTEND_ROUTES.HOME}
            style={{
              padding: "14px 30px",
              border: "none",
              borderRadius: 12,
              background: `linear-gradient(135deg, ${t.blue}, ${t.blue2})`,
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 6px 22px rgba(21,96,232,.28)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Find a Doctor
          </Link>

          {!currentUser && (
            <Link
              to={FRONTEND_ROUTES.REGISTER}
              style={{
                padding: "14px 28px",
                border: `1.5px solid ${t.border}`,
                borderRadius: 12,
                background: "white",
                color: t.text,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Register Free
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 28, marginTop: 40 }}>
          {(
            [
              { num: "500+", label: "Doctors"      },
              { num: "12K+", label: "Patients"     },
              { num: "98%",  label: "Satisfaction" },
              { num: "24/7", label: "Support"      },
            ] as const
          ).map(({ num, label }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: t.text,
                }}
              >
                {num}
              </div>
              <div style={{ fontSize: 12, color: t.sub, fontWeight: 500, marginTop: 1 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Doctor image ── */}
      <div
        style={{
          flexShrink: 0,
          width: 380,
          position: "relative",
          zIndex: 1,
          animation: "fadeInUp .7s ease both .1s",
        }}
      >
        {/* Floating badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: -20,
            zIndex: 2,
            background: "white",
            borderRadius: 14,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 28px rgba(21,96,232,.14)",
            animation: "floatY 4s ease-in-out infinite",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.blueLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeartbeatIcon size={17} color={t.blue} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: 17,
                fontWeight: 700,
                color: t.text,
              }}
            >
              Next Slot
            </div>
            <div style={{ fontSize: 11, color: t.sub }}>Today 2:00 PM</div>
          </div>
        </div>

        {/* Photo */}
        {!imgError ? (
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=85&fit=crop&crop=faces,top"
            alt="Doctor"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition: "top center",
              borderRadius: "24px 24px 0 0",
              boxShadow: "-12px -12px 40px rgba(21,96,232,.1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 420,
              background: "linear-gradient(160deg, #c8d9f8, #a0bef5)",
              borderRadius: "24px 24px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
            }}
          >
            👨‍⚕️
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Specialties Section
// ─────────────────────────────────────────────────────────────────────────────

const SpecialtiesSection = () => (
  <div style={{ padding: "72px clamp(20px, 5vw, 80px)" }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.2px",
        color: t.blue,
        marginBottom: 10,
      }}
    >
      Browse by
    </div>

    <div
      style={{
        fontFamily: "Fraunces, serif",
        fontSize: "clamp(26px, 3vw, 36px)",
        fontWeight: 700,
        color: t.text,
        marginBottom: 8,
        lineHeight: 1.2,
      }}
    >
      Our <em style={{ fontStyle: "italic", color: t.blue }}>Specialities</em>
    </div>

    <div
      style={{ fontSize: 15, color: t.sub, marginBottom: 40, maxWidth: 480, lineHeight: 1.6 }}
    >
      Find the right specialist for your health needs quickly and easily.
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
      {specialties.map((spec) => (
        <SpecialtyCard key={spec.name} spec={spec} />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Doctors Section
// ─────────────────────────────────────────────────────────────────────────────

const DoctorsSection = ({ onBook }: { onBook: (name: string) => void }) => (
  <div id="doctors" style={{ padding: "0 clamp(20px, 5vw, 80px) 72px", background: "white" }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.2px",
        color: t.blue,
        marginBottom: 10,
      }}
    >
      Top Rated
    </div>

    <div
      style={{
        fontFamily: "Fraunces, serif",
        fontSize: "clamp(26px, 3vw, 36px)",
        fontWeight: 700,
        color: t.text,
        marginBottom: 8,
        lineHeight: 1.2,
      }}
    >
      Meet Our <em style={{ fontStyle: "italic", color: t.blue }}>Doctors</em>
    </div>

    <div style={{ fontSize: 15, color: t.sub, marginBottom: 36, lineHeight: 1.6 }}>
      Trusted specialists ready to help you feel better, faster.
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
      {doctors.map((doc) => (
        <DoctorCard key={doc.id} doctor={doc} onBook={onBook} />
      ))}
    </div>

    <div style={{ textAlign: "center", marginTop: 36 }}>
      <Link
        to={FRONTEND_ROUTES.HOME}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "14px 28px",
          border: `1.5px solid ${t.border}`,
          borderRadius: 12,
          background: "white",
          color: t.text,
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        View All Doctors →
      </Link>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CTA Banner
// ─────────────────────────────────────────────────────────────────────────────

const CtaBanner = () => {
  const currentUser = useSelector(selectCurrentUser);
  return (
    <div
      style={{
        margin: "0 clamp(20px, 5vw, 80px) 72px",
        background: "linear-gradient(135deg, #071b54 0%, #1560e8 50%, #1a9ed4 100%)",
        borderRadius: 24,
        padding: "56px clamp(24px, 6vw, 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "clamp(22px, 2.5vw, 32px)",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.25,
            marginBottom: 10,
          }}
        >
          Your Health is Our
          <br />
          <em style={{ fontStyle: "italic", color: "rgba(255,255,255,.6)" }}>Top Priority</em>
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>
          Join thousands of patients who trust Clinical Intelligence for their healthcare needs.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexShrink: 0, position: "relative", zIndex: 1 }}>
        {!currentUser && (
          <Link
            to={FRONTEND_ROUTES.REGISTER}
            style={{
              padding: "13px 26px",
              border: "none",
              borderRadius: 11,
              background: "white",
              color: t.blue,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Get Started Free
          </Link>
        )}
        <Link
          to={FRONTEND_ROUTES.HOME}
          style={{
            padding: "13px 26px",
            border: "1.5px solid rgba(255,255,255,.35)",
            borderRadius: 11,
            background: "transparent",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Browse Doctors
        </Link>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HomePage — root export
// ─────────────────────────────────────────────────────────────────────────────

const HomePage = () => {
  const [bookingDoctor, setBookingDoctor] = useState<string | null>(null);

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: t.text,
        background: "white",
        overflowX: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Shared reusable components ── */}
      <Navbar activePage="Home" />

      {/* ── Page-specific sections ── */}
      <Hero           onBook={setBookingDoctor} />
      <SpecialtiesSection />
      <DoctorsSection onBook={setBookingDoctor} />
      <CtaBanner />

      {/* ── Shared reusable component ── */}
      <Footer />

      {/* Booking modal — mounts only when a doctor card is clicked */}
      {bookingDoctor && (
        <BookModal
          doctorName={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
