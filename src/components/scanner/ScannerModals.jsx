import React from "react";
import { Modal, Button } from "react-bootstrap";

const AlertModal = ({ isOpen, message, onClose }) => (
  <Modal
    show={isOpen}
    onHide={onClose}
    centered
    size="md" // ✅ bigger modal
  >
    <Modal.Body className="p-4 text-center">
      <div style={iconStyle}>⚠️</div>

      <p style={textStyle}>{message}</p>
    </Modal.Body>

    <Modal.Footer className="border-0 justify-content-center pb-4">
      <Button style={buttonStyle} onClick={onClose}>
        OK
      </Button>
    </Modal.Footer>
  </Modal>
);

export default AlertModal;

export const AlertDeleteModal = ({ isOpen, message, onClose, onConfirm }) => (
  <Modal show={isOpen} onHide={onClose} centered size="md">
    <Modal.Body className="p-4 text-center">
      <div style={iconStyle}>⚠️</div>
      <p style={textStyle}>{message}</p>
    </Modal.Body>

    <Modal.Footer className="border-0 justify-content-center pb-4">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button style={buttonStyle} onClick={onConfirm}>
        Delete
      </Button>
    </Modal.Footer>
  </Modal>
);

export const ShareModal = ({ isOpen, link, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Body className="p-0">
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f0f0ee",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#eef4fc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#185FA5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <h5
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  margin: 0,
                  color: "#1a1a1a",
                }}
              >
                Share scan link
              </h5>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#777",
                margin: 0,
                paddingLeft: 40,
              }}
            >
              Anyone with this link can open and run the same scan directly.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#aaa",
              padding: 4,
              lineHeight: 1,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div
            style={{
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "#999",
            }}
          >
            Scan URL
          </div>

          {/* Link box */}
          <div
            style={{
              background: "#0f172a",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 13,
                color: "#38bdf8",
                wordBreak: "break-all",
                lineHeight: 1.6,
                flex: 1,
              }}
            >
              {link || "—"}
            </span>
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#aaa",
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            This link includes your full scan configuration and can be shared
            with anyone.
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer
        style={{
          borderTop: "1px solid #f0f0ee",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
        }}
      >
        <Button
          variant="light"
          onClick={onClose}
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            border: "1px solid #e0e0da",
            background: "#fff",
            color: "#555",
            borderRadius: 7,
            padding: "7px 18px",
          }}
        >
          Close
        </Button>
        <Button
          onClick={handleCopy}
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            background: copied ? "#16a34a" : "#185FA5",
            border: "none",
            borderRadius: 7,
            padding: "7px 20px",
            color: "#fff",
            transition: "background 0.15s",
          }}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
// ================= STYLES =================

const iconStyle = {
  fontSize: "40px",
  marginBottom: "10px",
};

const textStyle = {
  fontSize: "16px",
  fontWeight: 500,
  color: "#333",
  margin: 0,
};

const buttonStyle = {
  padding: "8px 30px",
  borderRadius: "8px",
  backgroundColor: "#4a7fa5",
  border: "none",
  fontWeight: 500,
};
