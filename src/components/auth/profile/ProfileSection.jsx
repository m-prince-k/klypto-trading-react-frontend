import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Image,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const inlineStyles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f2",
    display: "flex",
    alignItems: "center",
    paddingTop: "0px",
    paddingBottom: "40px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  card: {
    border: "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: "14px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
  },
  avatarWrap: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    paddingBottom: "20px",
    marginBottom: "20px",
    borderBottom: "0.5px solid rgba(0,0,0,0.1)",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #E6F1FB",
    flexShrink: 0,
  },
  name: {
    fontSize: "18px",
    fontWeight: 500,
    margin: 0,
    color: "#1a1a1a",
  },
  email: {
    fontSize: "13px",
    color: "#777",
    marginTop: "3px",
    marginBottom: "6px",
  },
  badge: {
    fontSize: "11px",
    background: "#E1F5EE",
    color: "#1D9E75",
    borderRadius: "20px",
    padding: "3px 10px",
    fontWeight: 500,
    display: "inline-block",
  },
  label: {
    fontSize: "11.5px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "5px",
    fontWeight: 500,
  },
  input: {
    border: "0.5px solid rgba(0,0,0,0.2)",
    borderRadius: "8px",
    padding: "9px 13px",
    fontSize: "14px",
    color: "#1a1a1a",
    backgroundColor: "#f8f8f6",
    fontFamily: "inherit",
  },
  btnPrimary: {
    backgroundColor: "#185FA5",
    border: "none",
    borderRadius: "8px",
    padding: "8px 20px",
    fontSize: "13.5px",
    fontWeight: 500,
    fontFamily: "inherit",
  },
  btnGhost: {
    border: "0.5px solid rgba(0,0,0,0.22)",
    backgroundColor: "#fff",
    color: "#555",
    borderRadius: "8px",
    padding: "8px 20px",
    fontSize: "13.5px",
    fontWeight: 400,
    fontFamily: "inherit",
  },
};

export default function ProfileSection() {
  const [form, setForm] = useState({
    fullName: "Harry Styles",
    phone: "+91 9876543210",
    email: "harry@email.com",
    location: "Mumbai, India",
    occupation: "Software Engineer",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSaved(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setForm({
      fullName: "Harry Styles",
      phone: "+91 9876543210",
      email: "harry@email.com",
      location: "Mumbai, India",
      occupation: "Software Engineer",
    });
    setSaved(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .profile-input:focus {
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.12) !important;
          border-color: #185FA5 !important;
          background-color: #fff !important;
        }
        .btn-save:hover { background-color: #0C447C !important; }
        .btn-cancel:hover { background-color: #f0f0ee !important; border-color: #999 !important; color: #333 !important; }
        .save-banner {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={inlineStyles.wrapper}>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>

              {/* Save confirmation banner */}
              {saved && (
                <div
                  className="save-banner mb-3 px-4 py-2 text-center"
                  style={{
                    background: "#E1F5EE",
                    color: "#1D9E75",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    border: "0.5px solid #9FE1CB",
                  }}
                >
                  Profile saved successfully
                </div>
              )}

              <Card style={inlineStyles.card} className="p-4">

                {/* Avatar row */}
                <div style={inlineStyles.avatarWrap}>
                  <Image
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Profile"
                    style={inlineStyles.avatar}
                  />
                  <div>
                    <p style={inlineStyles.name}>{form.fullName}</p>
                    <p style={inlineStyles.email}>{form.email}</p>
                    <span style={inlineStyles.badge}>Active member</span>
                  </div>
                </div>

                {/* Form */}
                <Form>
                  <Row className="g-3">

                    {/* Full Name */}
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label style={inlineStyles.label}>Full name</Form.Label>
                        <Form.Control
                          className="profile-input"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          style={inlineStyles.input}
                        />
                      </Form.Group>
                    </Col>

                    {/* Phone */}
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label style={inlineStyles.label}>Phone number</Form.Label>
                        <Form.Control
                          className="profile-input"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          style={inlineStyles.input}
                        />
                      </Form.Group>
                    </Col>

                    {/* Email — full width */}
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label style={inlineStyles.label}>Email address</Form.Label>
                        <Form.Control
                          className="profile-input"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          style={inlineStyles.input}
                        />
                      </Form.Group>
                    </Col>

                    {/* Location */}
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label style={inlineStyles.label}>Location</Form.Label>
                        <Form.Control
                          className="profile-input"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          style={inlineStyles.input}
                        />
                      </Form.Group>
                    </Col>

                    {/* Occupation */}
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label style={inlineStyles.label}>Occupation</Form.Label>
                        <Form.Control
                          className="profile-input"
                          name="occupation"
                          value={form.occupation}
                          onChange={handleChange}
                          style={inlineStyles.input}
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  {/* Actions */}
                  <div className="d-flex gap-2 mt-4">
                    <Button
                      className="btn-save"
                      style={inlineStyles.btnPrimary}
                      onClick={handleSave}
                    >
                      Save changes
                    </Button>
                    <Button
                      variant="light"
                      className="btn-cancel"
                      style={inlineStyles.btnGhost}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>

                </Form>
              </Card>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}