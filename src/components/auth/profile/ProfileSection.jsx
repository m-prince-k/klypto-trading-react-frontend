import React, { useEffect, useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import apiService from "../../../services/apiServices";

export default function ProfileSection() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiService.get("api/viewProfile");
      if (res?.data) {
        const data = res.data;
        setForm({
          fullName: data.firstName || "",
          phone: data.mobile || "",
          email: data.email || "",
          location: data.location || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    console.log("Selected file:", file);

    // 👉 later you can send to API here
  };

  const handleChange = (e) => {
    setSaved(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setForm({ fullName: "", phone: "", email: "", location: "" });
    setSaved(false);
  };

  return (
    <div className=" d-flex align-items-center py-4 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            {saved && (
              <Alert
                variant="success"
                className="text-start py-2 mb-3 border-0 rounded-3"
              >
                Profile saved successfully!
              </Alert>
            )}

            <Card className="border rounded-4 shadow-sm p-2">
              <Card.Body>
                {/* Avatar row */}
                <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
                  <div style={{ position: "relative", cursor: "pointer" }}>
                    <Image
                      src={imagePreview || "https://i.pravatar.cc/150?img=12"}
                      alt="Profile"
                      roundedCircle
                      width={68}
                      height={68}
                      className="border border-2 border-primary-subtle object-fit-cover flex-shrink-0"
                    />

                    {/* ➕ Icon */}
                    <div
                      onClick={handleImageClick}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        background: "#0d6efd",
                        borderRadius: "50%",
                        width: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        border: "2px solid white",
                        fontSize: 10,
                      }}
                    >
                      <FaPlus />
                    </div>

                    {/* Hidden Input */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                  <div className="text-start">
                    <h6 className="mb-0 fw-semibold text-dark">
                      {form.fullName || "Your Name"}
                    </h6>
                    <p
                      className="text-muted mb-0 mt-1"
                      style={{ fontSize: 13 }}
                    >
                      {form.email || "your@email.com"}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                      Active member
                    </p>
                  </div>
                </div>

                {/* Form */}
                <Form>
                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label
                          className="text-uppercase fw-semibold text-secondary mb-1 text-start d-block"
                          style={{ fontSize: 11, letterSpacing: "0.06em" }}
                        >
                          Full name
                        </Form.Label>
                        <Form.Control
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          className="bg-light border rounded-3"
                          style={{ fontSize: 14 }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label
                          className="text-uppercase fw-semibold text-secondary mb-1 text-start d-block"
                          style={{ fontSize: 11, letterSpacing: "0.06em" }}
                        >
                          Phone number
                        </Form.Label>
                        <Form.Control
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="bg-light border rounded-3"
                          style={{ fontSize: 14 }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label
                          className="text-uppercase fw-semibold text-secondary mb-1 text-start d-block"
                          style={{ fontSize: 11, letterSpacing: "0.06em" }}
                        >
                          Email address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="bg-light border rounded-3"
                          style={{ fontSize: 14 }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label
                          className="text-uppercase fw-semibold text-secondary mb-1 text-start d-block"
                          style={{ fontSize: 11, letterSpacing: "0.06em" }}
                        >
                          Location
                        </Form.Label>
                        <Form.Control
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          className="bg-light border rounded-3"
                          style={{ fontSize: 14 }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-4">
                    <Button
                      variant="primary"
                      className="px-4 rounded-3 fw-medium"
                      style={{ fontSize: 13.5 }}
                      onClick={handleSave}
                    >
                      Save changes
                    </Button>
                    <Button
                      variant="outline-secondary"
                      className="px-4 rounded-3 fw-normal"
                      style={{ fontSize: 13.5 }}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
