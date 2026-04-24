import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Search } from "lucide-react";
import ScanTable from "./ScanTable";
import apiService from "../../../services/apiServices";

// 🔹 helper
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null");
  } catch {
    return null;
  }
};

const StatCard = ({ label, value, colorClass }) => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="py-3">
      <div className="text-muted small mb-1">{label}</div>
      <div className={`fw-bold fs-5 text-${colorClass}`}>{value}</div>
    </Card.Body>
  </Card>
);

export default function ScansSection() {
  const [query, setQuery] = useState("");
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ get user OUTSIDE
  const user = getUser();
  //   console.log(user, "userrrr")
  const userId = user?.id;
  const token = user?.token;

  useEffect(() => {
    if (!userId) return;

    const fetchScans = async () => {
      try {
        setLoading(true);

        const res = await apiService.post("/api/fetchAuthSaveScans", {
          user_id: userId,
        });

        const data = await res.data; // ✅ FIXED
        console.log(res, "dataaaaaaaaaaa");

        setScans(Array.isArray(data) ? data : (data.scans ?? []));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [userId, token]);

  // 🔹 not logged in
  if (!userId) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Please log in to view your saved scans.</Alert>
      </Container>
    );
  }

  // 🔹 filtering
  const lq = query.toLowerCase();
  const filtered = scans.filter(
    (s) =>
      s.name?.toLowerCase().includes(lq) ||
      s.description?.toLowerCase().includes(lq) ||
      s.clause?.toLowerCase().includes(lq),
  );

  const lastCreated = scans.length ? (scans.at(-1)?.created ?? "—") : "—";

  return (
    <Container fluid className="py-4 px-4">
      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <StatCard
            label="Total scans"
            value={scans.length}
            colorClass="primary"
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard label="Active alerts" value={0} colorClass="warning" />
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
            placeholder="Search scanners…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-start-0 ps-0"
          />
        </InputGroup>

        <Button variant="outline-secondary" size="sm">
          Manage tags
        </Button>
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger">Failed to load scans: {error}</Alert>
      )}

      {!loading && !error && (
        <ScanTable
          scans={filtered}
          onShare={(s) => console.log("share", s)}
          onEdit={(s) => console.log("edit", s)}
          onDelete={(s) => console.log("delete", s)}
        />
      )}
    </Container>
  );
}
