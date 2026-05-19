import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { Plus, ScanSearch, Tags } from "lucide-react";
import ScanTable from "./ScanTable";
import { Spinner } from "../../tradingModals/Spinner";
import apiService from "../../../services/apiServices";
import { buildScanSlug, formatSmartDate } from "../../../util/scannerFunctions";
import { AlertDeleteModal, ShareModal } from "../../scanner/ScannerModals";
import { Link, useNavigate } from "react-router-dom";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("session") || "null");
  } catch {
    return null;
  }
};

export default function ScansSection() {
  const [query, setQuery] = useState("");
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const navigate = useNavigate();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const user = getUser();
  const userId = user?.id;
  const token = user?.token;

  const handleConfirmDelete = () => {
    if (!selectedScan) return;
    setScans((prev) => prev.filter((s) => s.id !== selectedScan.id));
    setShowDeleteModal(false);
    setSelectedScan(null);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchScans = async () => {
      try {
        setLoading(true);
        const res = await apiService.post("/api/fetchAuthSaveScans", {
          user_id: userId,
        });
        const data = await res.data;
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

  if (!userId) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Please log in to view your saved scans.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (!loading && !error && scans.length === 0) {
    return (
      <Container className="py-5 text-center" style={{ color: "var(--text-main, #1a1a1a)" }}>
        <div className="mb-3" style={{ fontSize: 48 }}>
          🔍
        </div>
        <h5 className="fw-semibold mb-2">No saved scans</h5>
        <p
          className="small mb-4"
          style={{ maxWidth: 320, margin: "0 auto 1rem", color: "var(--text-muted, #64748b)" }}
        >
          Build and save scanners to find stocks that match your conditions.
        </p>
        <Link
          to="/scannerBuilder"
          className="btn btn-primary btn-sm d-flex align-items-center text-white text-decoration-none w-fit mx-auto"
        >
          <Plus size={14} className="me-1" />
          Create a Scanner
        </Link>
      </Container>
    );
  }

  if (error && scans.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">No saved scans found.</Alert>
      </Container>
    );
  }

  const lq = query.toLowerCase();
  const filtered = scans.filter(
    (s) =>
      s.name?.toLowerCase().includes(lq) ||
      s.description?.toLowerCase().includes(lq) ||
      s.clause?.toLowerCase().includes(lq) ||
      s.label?.toLowerCase().includes(lq) ||
      (typeof s.condition === "string" &&
        s.condition.toLowerCase().includes(lq)),
  );

  const lastCreated = scans.length
    ? formatSmartDate(
        scans.reduce((latest, scan) =>
          new Date(scan.createdAt) > new Date(latest.createdAt) ? scan : latest,
        ).createdAt,
      )
    : "—";

  return (
    <Container fluid className="py-4 px-3 px-md-4" style={{ color: "var(--text-main, #131722)" }}>
      {/* Dashboard Header Card */}
      <Card
        className="border mb-4 shadow-sm"
        style={{
          borderRadius: 10,
          borderColor: "var(--border-color, #e0dfd8)",
          background: "var(--bg-card, #fff)",
          color: "var(--text-main, #131722)"
        }}
      >
        <Card.Body className="px-4 py-3">
          {/* Title + subtitle */}
          <div className="d-flex align-items-center gap-2 mb-1">
            <ScanSearch size={30} color="var(--accent-color, #185FA5)" />
            <h5 className="mb-0 fw-semibold" style={{ fontSize: 32, color: "var(--text-main, #131722)" }}>
              Scan Dashboard
            </h5>
          </div>
          <p className="mb-5 text-left" style={{ fontSize: 14, color: "var(--text-muted, #64748b)" }}>
            Review saved scans, manage tags, share strategies, and preview live
            results — all from one place.
          </p>

          {/* Stats + actions row */}
          <Row className="align-items-center gy-2">
            {/* Stat pills */}
            <Col xs={12} md={7}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div
                  style={{
                    background: "var(--bg-main, #f0f5ff)",
                    border: "1px solid var(--border-color, #d0dff5)",
                    borderRadius: 8,
                    padding: "8px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 2,
                      color: "var(--text-muted, #64748b)"
                    }}
                  >
                    Total Scans
                  </div>
                  <div
                    className="fw-semibold"
                    style={{ fontSize: 18, color: "var(--text-main, #131722)" }}
                  >
                    {scans.length}
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--bg-main, #f5f4f0)",
                    border: "1px solid var(--border-color, #e0dfd8)",
                    borderRadius: 8,
                    padding: "8px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 2,
                      color: "var(--text-muted, #64748b)"
                    }}
                  >
                    Last Created
                  </div>
                  <div
                    className="fw-semibold"
                    style={{ fontSize: 18, color: "var(--text-main, #131722)" }}
                  >
                    {lastCreated}
                  </div>
                </div>
              </div>
            </Col>

            {/* Search + buttons */}
            <Col xs={12} md={5}>
              <div className="d-flex align-items-center gap-2 justify-content-md-end flex-wrap">
                <div style={{ position: "relative", flex: 1, maxWidth: 220 }}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter by name…"
                    style={{
                      width: "100%",
                      height: 34,
                      padding: "0 10px 0 34px",
                      border: "1px solid var(--border-color, #d0cfc8)",
                      borderRadius: 6,
                      fontSize: 13,
                      background: "var(--bg-main, #f9f8f5)",
                      color: "var(--text-main, #1a1a1a)",
                      outline: "none",
                    }}
                  />
                  <svg
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      opacity: 0.4,
                      color: "var(--text-main, #131722)"
                    }}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <button
                  onClick={() => console.log("manage tags")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    height: 34,
                    padding: "0 13px",
                    background: "var(--bg-card, #fff)",
                    color: "var(--text-main, #444)",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    border: "1px solid var(--border-color, #d0cfc8)",
                    cursor: "pointer",
                  }}
                >
                  <Tags size={14} />
                  Manage Tags
                </button>
                <Link
                  to="/scannerBuilder"
                  className="text-decoration-none"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    height: 34,
                    padding: "0 14px",
                    background: "var(--accent-color, #185FA5)",
                    color: "var(--bg-card, #fff)",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    border: "none",
                  }}
                >
                  <Plus size={14} />
                  New Scanner
                </Link>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-3">
          Failed to load scans: {error}
        </Alert>
      )}

      {!error && (
        <ScanTable
          scans={filtered}
          onShare={(scan) => {
            const slug = buildScanSlug(scan.label, scan.id);

            const link = `${window.location.origin}/scannerBuilder/${slug}`;

            setShareLink(link);
            setShowShareModal(true);
          }}
          onEdit={(scan) => {
            const slug = buildScanSlug(scan.label, scan.id);
            navigate(`/scannerBuilder/${slug}`, { state: { editScan: scan } });
          }}
          onDelete={(scan) => {
            setSelectedScan(scan);
            setShowDeleteModal(true);
          }}
        />
      )}

      <AlertDeleteModal
        isOpen={showDeleteModal}
        message={`Are you sure you want to delete "${selectedScan?.label}"?`}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedScan(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <ShareModal
        isOpen={showShareModal}
        link={shareLink}
        onClose={() => setShowShareModal(false)}
      />
    </Container>
  );
}
