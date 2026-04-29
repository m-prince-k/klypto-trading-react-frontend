import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart2, ScanSearch, LayoutDashboard, User } from "lucide-react";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null");
  } catch {
    return null;
  }
};

export default function Navbar() {
  const location = useLocation();
  const user = getUser();

  const initials = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : "U";

  const navLinks = [
    { label: "Chart", to: "/candleStick", icon: <BarChart2 size={15} /> },
    {
      label: "Create Scan",
      to: "/scannerBuilder",
      icon: <ScanSearch size={15} />,
    },
    {
      label: "Dashboard",
      to: "/scan_dashboard",
      icon: <LayoutDashboard size={15} />,
    },
  ];

  const isActive = (to) => {
    const path = to.split("?")[0];
    return location.pathname === path;
  };

  return (
    <>
      <style>{`
        .klypto-nav {
          position: sticky;
          top: 0;
          z-index: 9;
          background: #fff;
          border-bottom: 1px solid #e8e7e0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .klypto-nav-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .klypto-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .klypto-logo-icon {
          width: 30px;
          height: 30px;
          background: #185FA5;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .klypto-logo-name {
          font-size: 17px;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: -0.3px;
        }
        .klypto-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .klypto-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 13px;
          border-radius: 6px;
          font-size: 13.5px;
          font-weight: 500;
          color: #555;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
          white-space: nowrap;
        }
        .klypto-link:hover {
          background: #f5f4f0;
          color: #1a1a1a;
        }
        .klypto-link.active {
          background: #eef4fc;
          color: #185FA5;
        }
        .klypto-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #185FA5;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: 2px solid #d0dff5;
          transition: border-color 0.12s;
          flex-shrink: 0;
        }
        .klypto-avatar:hover {
          border-color: #185FA5;
        }
        .klypto-avatar.active {
          border-color: #185FA5;
          box-shadow: 0 0 0 3px rgba(24,95,165,0.15);
        }
        @media (max-width: 600px) {
          .klypto-link span.link-label { display: none; }
          .klypto-link { padding: 7px 9px; }
          .klypto-logo-name { display: none; }
        }
      `}</style>

      <nav className="klypto-nav">
        <div className="klypto-nav-inner">
          {/* Logo */}
          <Link to="/" className="klypto-logo">
            <div className="klypto-logo-icon">
              <BarChart2 size={16} color="#fff" />
            </div>
            <span className="klypto-logo-name">Klypto</span>
          </Link>

          {/* Nav links */}
          <ul className="klypto-links">
            {navLinks.map(({ label, to, icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`klypto-link${isActive(to) ? " active" : ""}`}
                >
                  {icon}
                  <span className="link-label">{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Avatar */}
          <Link
            to="/profile"
            className={`klypto-avatar${location.pathname === "/profile" ? " active" : ""}`}
          >
            {initials}
          </Link>
        </div>
      </nav>
    </>
  );
}
