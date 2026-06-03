import { FiWifiOff } from "react-icons/fi";
import { Button, Card } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext";

const ChartErrorState = ({ onRetry }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="position-absolute inset-0 d-flex align-items-center justify-content-center"
      style={{ inset: 0, zIndex: 50 }}
    >
      {/* Backdrop */}
      <div
        className="position-absolute w-100 h-100"
        style={{ 
            background: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)", 
            backdropFilter: "blur(2px)" 
        }}
      />

      {/* Card */}
      <Card
        className="position-relative text-center border"
        style={{
          minWidth: 300,
          padding: "2rem 2.5rem",
          borderRadius: "1rem",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          background: "var(--bg-card, #ffffff)",
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Icon */}
        <div
          className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
          style={{ width: 48, height: 48, background: "var(--bg-main, #f8f9fa)" }}
        >
          <FiWifiOff size={18} style={{ color: "var(--text-muted, #6c757d)" }} />
        </div>

        <Card.Body className="p-0 d-flex flex-column align-items-center gap-2">
          <h6 className="fw-semibold mb-0" style={{ fontSize: 14, color: "var(--text-main, #212529)" }}>
            Unable to load chart data
          </h6>

          <p className="mb-0" style={{ fontSize: 12, maxWidth: 200, lineHeight: 1.6, color: "var(--text-muted, #6c757d)" }}>
            Please check your connection or try again
          </p>

          <Button
            variant={isDark ? "light" : "dark"}
            onClick={onRetry}
            className="mt-2 px-4 rounded-pill border-0"
            style={{ backgroundColor: "var(--accent-color, #212529)", color: "#fff" }}
            size="sm"
          >
            Retry
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ChartErrorState;