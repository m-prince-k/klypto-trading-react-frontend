import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Search, Plus } from "lucide-react";
import AlertTable from "./AlertTable";
import apiService from "../../../services/apiServices";
import { formatSmartDate } from "../../../util/scannerFunctions";
import { AlertDeleteModal } from "../../scanner/ScannerModals";
import { Link } from "react-router-dom";

// 🔹 helper
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null");
  } catch {
    return null;
  }
};

const StatCard = ({ label, value, colorClass }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-body py-3">
      <div className="text-muted small mb-1">{label}</div>
      <div className={`fw-bold fs-5 text-${colorClass}`}>{value}</div>
    </div>
  </div>
);

export default function AlertSection() {
  const [query, setQuery] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const user = getUser();
  console.log("user", user);
  const userId = user?.id;
  const token = user?.token;

  const handleConfirmDelete = () => {
    if (!selectedAlert) return;
    setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id));
    setShowDeleteModal(false);
    setSelectedAlert(null);
  };

  useEffect(() => {
    if (!userId) return;

    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await apiService.post("/api/fetchAuthAlert", {
          user_id: userId,
        });

        const data = await res.data;

        console.log("data", data);
        setAlerts(Array.isArray(data) ? data : (data.alerts ?? []));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userId, token]);

  // 🔹 not logged in
  if (!userId) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Please log in to view your saved alerts.
        </Alert>
      </Container>
    );
  }

  // 🔹 no alerts configured
  if (!loading && !error && alerts.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="mb-3 text-muted" style={{ fontSize: 48 }}>
          🔔
        </div>
        <h5 className="fw-semibold mb-2">No alerts configured</h5>
        <p
          className="text-muted small mb-4"
          style={{ maxWidth: 320, margin: "0 auto 1rem" }}
        >
          Set up price alerts on your scanners to get notified when conditions
          are triggered.
        </p>
        <Link
          to="/scannerBuilder"
          className="btn btn-primary w-fit mx-auto btn-sm d-flex align-items-center text-white text-decoration-none"
        >
          <Plus size={14} className="me-1" />
          Create an Alert First
        </Link>
      </Container>
    );
  }

  // 🔹 filtering
  const lq = query.toLowerCase();
  const filtered = alerts.filter(
    (a) =>
      a.alert_name?.toLowerCase().includes(lq) ||
      a.description?.toLowerCase().includes(lq) ||
      a.rule?.toLowerCase().includes(lq),
  );

  const activeAlerts = alerts.filter((a) => a.active).length;

  const lastCreated = alerts.length
    ? formatSmartDate(
        alerts.reduce((latest, alert) =>
          new Date(alert.createdAt) > new Date(latest.createdAt)
            ? alert
            : latest,
        ).createdAt,
      )
    : "—";

  return (
    <Container fluid className="py-4 px-4">
      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <StatCard
            label="Total alerts"
            value={alerts.length}
            colorClass="primary"
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            label="Active alerts"
            value={activeAlerts}
            colorClass="warning"
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            label="Last created"
            value={lastCreated}
            colorClass="success"
          />
        </Col>
      </Row>

      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
        <InputGroup style={{ maxWidth: "320px" }}>
          <InputGroup.Text className="bg-white border-end-0">
            <Search size={15} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search alerts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-start-0 ps-0"
          />
        </InputGroup>

        <Link
          to="/scannerBuilder"
          className="btn btn-primary btn-sm d-flex align-items-center text-white text-decoration-none"
          // style={{ background: "#185FA5", border: "none" }}
        >
          <Plus size={14} className="me-1" />
          New alert
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger">Failed to load alerts: {error}</Alert>
      )}

      {!loading && !error && (
        <AlertTable
          alerts={filtered}
          onEdit={(a) => console.log("edit", a)}
          onDelete={(alert) => {
            setSelectedAlert(alert);
            setShowDeleteModal(true);
          }}
          onToggle={(a) => console.log("toggle", a)}
        />
      )}

      <AlertDeleteModal
        isOpen={showDeleteModal}
        message={`Are you sure you want to delete "${selectedAlert?.alert_name}"?`}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAlert(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </Container>
  );
}
