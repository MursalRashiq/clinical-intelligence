import { useState, useEffect } from "react";

// ─── Floating particle ─────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

function useParticles(count: number): Particle[] {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      opacity: Math.random() * 0.18 + 0.04,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
      drift: (Math.random() - 0.5) * 60,
    }))
  );
  return particles;
}

// ─── Animated ECG line ─────────────────────────────────────────────────────────
function EcgLine() {
  return (
    <svg
      viewBox="0 0 400 60"
      fill="none"
      style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }}
    >
      <style>{`
        @keyframes ecg-draw {
          0%   { stroke-dashoffset: 900; }
          60%  { stroke-dashoffset: 0; }
          80%  { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.18; }
        }
        @keyframes ecg-loop {
          0%   { stroke-dashoffset: 900; opacity: 0.55; }
          70%  { stroke-dashoffset: 0;   opacity: 0.55; }
          85%  { stroke-dashoffset: 0;   opacity: 0.18; }
          100% { stroke-dashoffset: 900; opacity: 0.55; }
        }
      `}</style>
      {/* Flatline left */}
      <path
        d="M0 30 L60 30"
        stroke="#1560e8"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      {/* ECG spike */}
      <path
        d="M60 30 L80 30 L90 30 L100 10 L110 50 L120 20 L130 38 L145 30 L400 30"
        stroke="url(#ecgGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="900"
        style={{ animation: "ecg-loop 3.2s ease-in-out infinite" }}
      />
      <defs>
        <linearGradient id="ecgGrad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00bfa5" />
          <stop offset="50%" stopColor="#1560e8" />
          <stop offset="100%" stopColor="#00bfa5" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── The big 404 display ────────────────────────────────────────────────────────
function BigFourOhFour() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        userSelect: "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shadow / echo layers */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(110px, 22vw, 200px)",
          fontWeight: 700,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(21,96,232,0.08)",
          transform: hovered ? "translate(6px, 6px)" : "translate(4px, 4px)",
          transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1)",
          letterSpacing: "-4px",
          pointerEvents: "none",
        }}
      >
        404
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(110px, 22vw, 200px)",
          fontWeight: 700,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(0,191,165,0.1)",
          transform: hovered ? "translate(-5px, -5px)" : "translate(-3px, -3px)",
          transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1)",
          letterSpacing: "-4px",
          pointerEvents: "none",
        }}
      >
        404
      </div>
      {/* Main text */}
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(110px, 22vw, 200px)",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-4px",
          background: "linear-gradient(135deg, #1560e8 0%, #0d4bc4 40%, #00bfa5 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          position: "relative",
          transition: "filter 0.3s",
          filter: hovered ? "drop-shadow(0 8px 32px rgba(21,96,232,0.22))" : "drop-shadow(0 4px 16px rgba(21,96,232,0.12))",
        }}
      >
        404
      </div>
    </div>
  );
}

// ─── Main 404 Page ─────────────────────────────────────────────────────────────
export default function NotFound() {
  const particles = useParticles(18);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #1560e8; --blue2: #0d4bc4;
          --teal: #00bfa5;
          --blue-light: #e8f0fe; --blue-xlight: #f4f7fe;
          --text: #0f1c2e; --sub: #5a6a80; --border: #dde6f5;
          --bg: #f4f7fe;
        }
        html, body {
          height: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          background: var(--bg);
        }

        @keyframes float-up {
          0%   { transform: translateY(0px) translateX(0px); opacity: var(--op); }
          50%  { transform: translateY(-30px) translateX(var(--dx)); opacity: calc(var(--op) * 1.6); }
          100% { transform: translateY(0px) translateX(0px); opacity: var(--op); }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(21,96,232,0.14); }
          50%      { box-shadow: 0 0 0 16px rgba(21,96,232,0.04); }
        }

        .btn-home {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 30px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--blue), var(--blue2));
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 6px 22px rgba(21,96,232,.3);
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s;
        }
        .btn-home:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 32px rgba(21,96,232,.38);
        }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: white;
          color: var(--sub);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-back:hover {
          border-color: var(--blue);
          color: var(--blue);
          background: var(--blue-xlight);
          transform: translateY(-2px);
        }

        .nav-link:hover { color: var(--blue) !important; }

        @media (max-width: 520px) {
          nav { padding: 0 20px !important; }
          footer { padding: 12px 20px !important; }
          .cta-row { flex-direction: column !important; align-items: center !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
          background: "rgba(255,255,255,.95)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          height: 66, padding: "0 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,var(--blue),var(--teal))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(21,96,232,.25)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} width={18} height={18}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
            Clinical <span style={{ color: "var(--blue)" }}>Intelligence</span>
          </span>
        </a>

        <a
          href="/"
          className="nav-link"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 14, fontWeight: 600, color: "var(--sub)", textDecoration: "none",
            transition: "color .2s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go Home
        </a>
      </nav>

      {/* ── Background particles ── */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0,
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%", left: "5%",
            width: 480, height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(21,96,232,0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%", right: "5%",
            width: 420, height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,191,165,0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Floating dots */}
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.id % 3 === 0 ? "var(--teal)" : "var(--blue)",
              opacity: p.opacity,
              // @ts-ignore
              "--op": p.opacity,
              "--dx": `${p.drift}px`,
              animation: `float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Grid overlay */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1560e8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "90px 24px 80px",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        {/* Spinning ring decoration */}
        <div
          style={{
            position: "relative",
            marginBottom: 16,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "pop-in 0.6s cubic-bezier(.34,1.56,.64,1) both" : "none",
          }}
        >
          {/* Outer spinning ring */}
          <div
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 260, height: 260,
              marginTop: -130, marginLeft: -130,
              borderRadius: "50%",
              border: "1.5px dashed rgba(21,96,232,0.15)",
              animation: "spin-slow 18s linear infinite",
            }}
          />
          {/* Inner pulsing ring */}
          <div
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 200, height: 200,
              marginTop: -100, marginLeft: -100,
              borderRadius: "50%",
              border: "1px solid rgba(0,191,165,0.12)",
              animation: "spin-slow 12s linear infinite reverse",
            }}
          />

          <BigFourOhFour />
        </div>

        {/* ECG line — heartbeat metaphor for a health app */}
        <div
          style={{
            width: "100%", maxWidth: 340,
            marginBottom: 32,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fade-up 0.6s ease both 0.15s" : "none",
          }}
        >
          <EcgLine />
        </div>

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "var(--blue-light)",
            border: "1.5px solid rgba(21,96,232,0.15)",
            borderRadius: 100,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--blue)",
            marginBottom: 18,
            letterSpacing: "0.6px",
            textTransform: "uppercase" as const,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fade-up 0.6s ease both 0.2s" : "none",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={12} height={12}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Page Not Found
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(26px, 5vw, 36px)",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 12,
            lineHeight: 1.2,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fade-up 0.6s ease both 0.28s" : "none",
          }}
        >
          Looks like this page{" "}
          <span
            style={{
              color: "var(--blue)",
              fontStyle: "italic",
            }}
          >
            went offline
          </span>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: 15,
            color: "var(--sub)",
            lineHeight: 1.7,
            maxWidth: 420,
            marginBottom: 36,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fade-up 0.6s ease both 0.34s" : "none",
          }}
        >
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back to good health.
        </p>

        {/* CTA buttons */}
        <div
          className="cta-row"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap" as const,
            justifyContent: "center",
            marginBottom: 56,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fade-up 0.6s ease both 0.42s" : "none",
          }}
        >
          <a href="/" className="btn-home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </a>
          <button className="btn-back" onClick={() => window.history.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Quick links */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            animation: mounted ? "fade-up 0.6s ease both 0.52s" : "none",
          }}
        >
          <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 14, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.8px" }}>
            Quick Links
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, justifyContent: "center" }}>
            {[
              { label: "Sign In", href: "/login", icon: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" },
            ].map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "white",
                  border: "1.5px solid var(--border)",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--sub)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(21,96,232,.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--blue)";
                  e.currentTarget.style.color = "var(--blue)";
                  e.currentTarget.style.background = "var(--blue-xlight)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--sub)";
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
                  <path d={icon} />
                </svg>
                {label}
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "white", borderTop: "1px solid var(--border)",
          padding: "13px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 12, color: "var(--sub)",
          zIndex: 10,
        }}
      >
        <span>© 2025 Clinical Intelligence — All Rights Reserved</span>
        <span>
          <a href="/help" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Help</a>
          {" · "}
          <a href="/privacy" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
        </span>
      </footer>
    </>
  );
}