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
