import { Link } from "react-router-dom";
import { theme } from "../theme";
import HeartbeatIcon from "./HeartbeatIcon";

const footerLinks = [
  { label: "Home",    href: "/"   },
  { label: "Doctors", href: "/doctors" },
  { label: "About",   href: "#"             },
  { label: "Privacy", href: "#"             },
  { label: "Contact", href: "#"             },
];

const paymentMethods = ["Visa", "Mastercard", "UPI", "PayPal"];

const Footer = () => (
  <footer
    style={{
      background: "white",
      color: theme.sub,
      padding: "40px 60px 28px",
      borderTop: `1px solid ${theme.border}`,
    }}
  >
    {/* Top row */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
        paddingBottom: 28,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      {/* Brand */}
      <Link
        to="/"
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${theme.blue}, ${theme.teal})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HeartbeatIcon size={16} />
        </div>
        <span
          style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: theme.brandDark, fontWeight: 700 }}
        >
          Clinical <span style={{ color: theme.brandLight }}>Intelligence</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: 20 }}>
        {footerLinks.map(({ label, href }) => (
          <Link
            key={label}
            to={href}
            style={{ fontSize: 13, color: theme.sub, textDecoration: "none" }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>

    {/* Bottom row */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
      }}
    >
      <span>© 2025 Clinical Intelligence — All Rights Reserved</span>
      <div style={{ display: "flex", gap: 6 }}>
        {paymentMethods.map((method) => (
          <div
            key={method}
            style={{
              background: "white",
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: theme.text,
            }}
          >
            {method}
          </div>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
