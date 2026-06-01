import { FiWifiOff } from "react-icons/fi";
import { Button, Card } from "react-bootstrap";

const ChartErrorState = ({ onRetry }) => {
  return (
    <div
      className="position-absolute inset-0 d-flex align-items-center justify-content-center"
      style={{ inset: 0, zIndex: 50 }}
    >
      {/* Backdrop */}
      <div
        className="position-absolute w-100 h-100"
        style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(2px)" }}
      />

      {/* Card */}
      <Card
        className="position-relative text-center border"
        style={{
          minWidth: 300,
          padding: "2rem 2.5rem",
          borderRadius: "1rem",
          borderColor: "rgba(0,0,0,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Icon */}
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-light mx-auto mb-3"
          style={{ width: 48, height: 48 }}
        >
          <FiWifiOff size={18} className="text-secondary" />
        </div>

        <Card.Body className="p-0 d-flex flex-column align-items-center gap-2">
          <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: 14 }}>
            Unable to load chart data
          </h6>

          <p className="text-secondary mb-0" style={{ fontSize: 12, maxWidth: 200, lineHeight: 1.6 }}>
            Please check your connection or try again
          </p>

          <Button
            variant="dark"
            onClick={onRetry}
            className="mt-2 px-4 rounded-pill"
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