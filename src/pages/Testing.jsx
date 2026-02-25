import { useState } from "react";
import { FaGlassWhiskey } from "react-icons/fa";
import { Container, Button } from "react-bootstrap";

export default function Testing() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger Icon */}
      <FaGlassWhiskey
        size={22}
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(true)}
      />

      {/* Backdrop */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
          style={{ zIndex: 1040 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sliding Panel */}
      <div
        className="position-fixed top-0 end-0 bg-white shadow"
        style={{
          width: "320px",
          height: "100vh",
          zIndex: 1050,
          transition: "transform 0.5s ease",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom p-3 fw-semibold">
          <span>Waveform</span>

          <Button
            variant="light"
            size="sm"
            onClick={() => setOpen(false)}
          >
            ✕
          </Button>
        </div>

        {/* Body */}
        <Container className="p-3">
          <div className="text-muted">
            Your content here
          </div>
        </Container>
      </div>
    </>
  );
}
