import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FiEye, FiEyeOff } from "react-icons/fi";
import apiService from "../../services/apiServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "./protected";
import SEO from "../../components/SEO";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/candleStick", { replace: true });
    }
  }, [navigate]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneUI, setPhoneUI] = useState("");

  // Returns the first error found as { field, message }, or null if all valid
  const validateOneByOne = () => {
    if (!form.firstName.trim())
      return { field: "firstName", message: "First name is required" };

    if (!form.lastName.trim())
      return { field: "lastName", message: "Last name is required" };

    if (!form.email)
      return { field: "email", message: "Email is required" };
    if (!/\S+@\S+\.\S+/.test(form.email))
      return { field: "email", message: "Invalid email format" };

    if (!form.password)
      return { field: "password", message: "Password is required" };
    if (form.password.length < 6)
      return { field: "password", message: "Minimum 6 characters required" };

    if (!form.mobile)
      return { field: "mobile", message: "Mobile is required" };
    if (!/^\d{10,15}$/.test(form.mobile))
      return { field: "mobile", message: "Invalid mobile number" };

    if (!form.country.trim())
      return { field: "country", message: "Country is required" };

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstError = validateOneByOne();
    if (firstError) {
      setErrors({ [firstError.field]: firstError.message });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await apiService.post("/api/register", { ...form });
      const token = response.data?.token;
      if (token) localStorage.setItem("token", token);
      toast.success("Signup successful!");
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

  return (
    <>
      <SEO
        title="Best Crypto Trading Platform"
        description="Trade crypto instantly with low fees"
        keywords="crypto, trading, bitcoin, ethereum"
        url="https://yourdomain.com/"
        image="https://yourdomain.com/banner.jpg"
      />

      <div className="min-vh-100 d-flex align-items-center justify-content-center py-4" style={{ backgroundColor: "var(--bg-main, #f8f9fa)" }}>
        <div
          className="card border shadow-sm"
          style={{ 
            width: 420, 
            borderRadius: 16,
            backgroundColor: "var(--bg-card, #ffffff)",
            borderColor: "var(--border-color, #e2e8f0)",
            color: "var(--text-main, #1a1a1a)"
          }}
        >
          <div className="card-body p-4">

            {/* Logo */}
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: 40,
                height: 40,
                background: "var(--accent-color, #185FA5)",
                borderRadius: 10,
              }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            <h5 className="text-center fw-semibold mb-1" style={{ color: "var(--text-main, #131722)" }}>Create your account</h5>
            <p className="text-center small mb-4" style={{ color: "var(--text-muted, #64748b)" }}>
              Start trading crypto in minutes
            </p>

            <Form noValidate onSubmit={handleSubmit} className="text-start">

              {/* First Name + Last Name */}
              <div className="d-flex gap-2 mb-3">
                <Form.Group style={{ flex: 1 }}>
                  <Form.Label className="small fw-medium" style={{ color: "var(--text-muted, #64748b)" }}>
                    First Name
                  </Form.Label>
                  <Form.Control
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    isInvalid={!!errors.firstName}
                    style={{
                      backgroundColor: "var(--bg-main, #f8f9fa)",
                      color: "var(--text-main, #131722)",
                      borderColor: "var(--border-color, #cbd5e1)"
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group style={{ flex: 1 }}>
                  <Form.Label className="small fw-medium" style={{ color: "var(--text-muted, #64748b)" }}>
                    Last Name
                  </Form.Label>
                  <Form.Control
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    isInvalid={!!errors.lastName}
                    style={{
                      backgroundColor: "var(--bg-main, #f8f9fa)",
                      color: "var(--text-main, #131722)",
                      borderColor: "var(--border-color, #cbd5e1)"
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-medium" style={{ color: "var(--text-muted, #64748b)" }}>
                  Email address
                </Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  style={{
                    backgroundColor: "var(--bg-main, #f8f9fa)",
                    color: "var(--text-main, #131722)",
                    borderColor: "var(--border-color, #cbd5e1)"
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-medium" style={{ color: "var(--text-muted, #64748b)" }}>
                  Password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    style={{ 
                      paddingRight: 40,
                      backgroundColor: "var(--bg-main, #f8f9fa)",
                      color: "var(--text-main, #131722)",
                      borderColor: "var(--border-color, #cbd5e1)"
                    }}
                  />
                  <span
                    onClick={() => setShowPassword((s) => !s)}
                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                    style={{ cursor: "pointer", fontSize: 16, zIndex: 5, color: "var(--text-muted, #64748b)" }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              {/* Mobile + Country */}
              <div className="d-flex gap-2 mb-3">
                <div style={{ flex: 1 }}>
                  <Form.Label className="small fw-medium" style={{ color: "var(--text-muted, #64748b)" }}>
                    Mobile
                  </Form.Label>

                  <PhoneInput
                    country={"in"}
                    enableSearch={true}
                    value={phoneUI}
                    onChange={(value) => {
                      setPhoneUI(value);
                      setForm((prev) => ({
                        ...prev,
                        mobile: value,
                      }));
                    }}
                    inputStyle={{
                      width: "100%",
                      height: "38px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color, #ced4da)",
                      backgroundColor: "var(--bg-main, #f8f9fa)",
                      color: "var(--text-main, #131722)"
                    }}
                    buttonStyle={{
                      backgroundColor: "var(--bg-card, #ffffff)",
                      borderColor: "var(--border-color, #ced4da)"
                    }}
                    dropdownStyle={{
                      backgroundColor: "var(--bg-card, #ffffff)",
                      color: "var(--text-main, #131722)"
                    }}
                  />

                  {errors.mobile && (
                    <div className="text-danger small">{errors.mobile}</div>
                  )}
                </div>

                <Form.Group style={{ flex: 1 }}>
                  <Form.Label className="small fw-medium" style={{ color: "var(--text-muted, #64748b)" }}>
                    Country
                  </Form.Label>
                  <Form.Control
                    name="country"
                    type="text"
                    value={form.country}
                    onChange={handleChange}
                    isInvalid={!!errors.country}
                    style={{
                      backgroundColor: "var(--bg-main, #f8f9fa)",
                      color: "var(--text-main, #131722)",
                      borderColor: "var(--border-color, #cbd5e1)"
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.country}
                  </Form.Control.Feedback>
                </Form.Group>

              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-100 fw-medium"
                style={{ background: "var(--accent-color, #185FA5)", border: "none" }}
                disabled={loading}
              >
                {loading ? "Signing up…" : "Sign Up"}
              </Button>

              {/* Divider */}
              <div className="d-flex align-items-center gap-2 my-3">
                <hr className="flex-grow-1 m-0" style={{ borderColor: "var(--border-color, #cbd5e1)" }} />
                <span className="small" style={{ color: "var(--text-muted, #64748b)" }}>or</span>
                <hr className="flex-grow-1 m-0" style={{ borderColor: "var(--border-color, #cbd5e1)" }} />
              </div>

              {/* Sign in link */}
              <p className="text-center small mb-0" style={{ color: "var(--text-muted, #64748b)" }}>
                Already have an account?{" "}
                <a
                  href="/login"
                  className="fw-medium text-decoration-none"
                  style={{ color: "var(--accent-color, #185FA5)" }}
                >
                  Sign in
                </a>
              </p>

            </Form>
          </div>
        </div>
      </div>
    </>
  );
}