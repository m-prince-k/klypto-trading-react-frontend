import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FiEye, FiEyeOff } from "react-icons/fi";
import apiService from "../../services/apiServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "./protected";
import SEO from "../../components/SEO";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/candleStick", { replace: true });
    }
  }, [navigate]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Returns the first error found as { field, message }, or null if all valid
  const validateOneByOne = () => {
    if (!form.email)
      return { field: "email", message: "Email is required" };
    if (!/\S+@\S+\.\S+/.test(form.email))
      return { field: "email", message: "Invalid email format" };

    if (!form.password)
      return { field: "password", message: "Password is required" };
    if (form.password.length < 6)
      return { field: "password", message: "Minimum 6 characters required" };

    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      const payload = { email: form.email, password: form.password };
      const response = await apiService.post("/api/login", payload);
      console.log(response);

      const data = response?.user;
      // Merge user object with root-level token so getAuthHeaders() can read session.token
      const sessionData = {
        ...(data || {}),
        token: response?.token || response?.accessToken || data?.token || data?.accessToken || '',
      };

      if (form.remember) {
        localStorage.setItem("session", JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem("session", JSON.stringify(sessionData));
      }

      toast.success("Login successful!");
      navigate("/candleStick");
    } catch (error) {
      toast.error(error?.message);
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

      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "var(--bg-main, #f8f9fa)" }}>
        <div
          className="card border shadow-sm"
          style={{ 
            width: 400, 
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

            <h5 className="text-center fw-semibold mb-1" style={{ color: "var(--text-main, #131722)" }}>Welcome back</h5>
            <p className="text-center small mb-4" style={{ color: "var(--text-muted, #64748b)" }}>
              Sign in to your account to continue
            </p>

            <Form noValidate onSubmit={handleSubmit} className="text-left align-items-start">

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
                    placeholder="••••••••"
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

              {/* Remember + Forgot */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  name="remember"
                  label={
                    <span className="small" style={{ color: "var(--text-muted, #64748b)" }}>Remember me</span>
                  }
                  checked={form.remember}
                  onChange={handleChange}
                />
                <a
                  href="/forgot-password"
                  className="small text-decoration-none"
                  style={{ color: "var(--accent-color, #185FA5)" }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-100 fw-medium"
                style={{ background: "var(--accent-color, #185FA5)", border: "none" }}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              {/* Divider */}
              <div className="d-flex align-items-center gap-2 my-3">
                <hr className="flex-grow-1 m-0" style={{ borderColor: "var(--border-color, #cbd5e1)" }} />
                <span className="small" style={{ color: "var(--text-muted, #64748b)" }}>or</span>
                <hr className="flex-grow-1 m-0" style={{ borderColor: "var(--border-color, #cbd5e1)" }} />
              </div>

              {/* Sign up link */}
              <p className="text-center small mb-0" style={{ color: "var(--text-muted, #64748b)" }}>
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="fw-medium text-decoration-none"
                  style={{ color: "var(--accent-color, #185FA5)" }}
                >
                  Create one
                </a>
              </p>

            </Form>
          </div>
        </div>
      </div>
    </>
  );
}