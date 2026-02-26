import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import { toast } from "react-toastify";
import { isAuthenticated } from "./protected";

const EyeIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const Signup = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    country: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

    useEffect(() => {
      if (isAuthenticated()) {
        navigate("/candleStick", { replace: true }); // redirect if already logged in
      }
    }, [navigate]);

  const validate = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "First name is required";
    if (!form.lastName.trim()) err.lastName = "Last name is required";
    if (!form.email) {
      err.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err.email = "Invalid email";
    }
    if (!form.password) {
      err.password = "Password is required";
    } else if (form.password.length < 6) {
      err.password = "Min. 6 characters";
    }
    if (!form.mobile) {
      err.mobile = "Mobile is required";
    } else if (!/^\d{10,15}$/.test(form.mobile)) {
      err.mobile = "Invalid mobile number";
    }
    if (!form.country) err.country = "Country is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...form,
      };
      console.log(payload, "payoaddddddd");
      const response = await apiService.post("/api/signUp", payload);

      // console.log(response, "resssssssssss");

      await toast.success("Signup successful!");
      navigate("/candleStick");
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Signup failed";
      console.error("SignUp error:", error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const field = {
    backgroundColor: "#f5f5f5",
    border: "1px solid #e8e8e8",
    borderRadius: "6px",
    padding: "0.65rem 0.9rem",
    fontSize: "0.93rem",
    color: "#2d2d2d",
    boxShadow: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#2b2d2f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={9} md={7} lg={5}>
            <Card
              className="border-0"
              style={{
                borderRadius: "10px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              }}
            >
              <Card.Body style={{ padding: "2rem 1.8rem" }}>
                <h4
                  className="fw-bold text-center mb-4"
                  style={{ color: "#1a1a1a", fontSize: "1.35rem" }}
                >
                  Sign Up
                </h4>

                <Form onSubmit={handleSubmit} noValidate>
                  <Row className="g-2 mb-2">
                    <Col xs={6}>
                      <Form.Control
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                        isInvalid={!!errors.firstName}
                        style={field}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.76rem" }}
                      >
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                        isInvalid={!!errors.lastName}
                        style={field}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.76rem" }}
                      >
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  <Form.Group className="mb-2">
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      style={field}
                    />
                    <Form.Control.Feedback
                      type="invalid"
                      style={{ fontSize: "0.76rem" }}
                    >
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <InputGroup>
                      <Form.Control
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        style={{
                          ...field,
                          borderRight: "none",
                          borderRadius: "6px 0 0 6px",
                        }}
                      />
                      <InputGroup.Text
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: "#f5f5f5",
                          border: "1px solid #e8e8e8",
                          borderLeft: "none",
                          borderRadius: "0 6px 6px 0",
                          cursor: "pointer",
                        }}
                      >
                        <EyeIcon open={showPassword} />
                      </InputGroup.Text>
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.76rem" }}
                      >
                        {errors.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Row className="g-2 mb-3">
                    <Col xs={6}>
                      <Form.Control
                        name="mobile"
                        placeholder="Mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        isInvalid={!!errors.mobile}
                        style={field}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.76rem" }}
                      >
                        {errors.mobile}
                      </Form.Control.Feedback>
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        name="country"
                        placeholder="Country"
                        value={form.country}
                        onChange={handleChange}
                        isInvalid={!!errors.country}
                        style={field}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ fontSize: "0.76rem" }}
                      >
                        {errors.country}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-100 fw-semibold border-0"
                    style={{
                      backgroundColor: "#1c1c1c",
                      borderRadius: "6px",
                      padding: "0.68rem",
                      fontSize: "0.95rem",
                      color: "#fff",
                      letterSpacing: "0.2px",
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;
