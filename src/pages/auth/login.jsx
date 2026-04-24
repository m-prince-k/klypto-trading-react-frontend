import { useState, useEffect } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
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
      navigate("/candleStick", { replace: true }); // redirect if already logged in
    }
  }, [navigate]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters required";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      const validationErrors = validate();
      setErrors(validationErrors);

      if (Object.keys(validationErrors)?.length > 0) return;

      // setLoading(true);

      const payload = { email: form.email, password: form.password };

      const response = await apiService.post("/api/login", payload);
      console.log(response);

      const data = await response?.user;

      if (form?.remember) {
        localStorage.setItem("session", JSON.stringify(data));
      } else {
        sessionStorage.setItem("session", JSON.stringify(data));
      }

      await toast.success("Login successful!");
      navigate("/candleStick");
    } catch (error) {
      await toast.error(error?.message);
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

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-secondary">
        <div
          className="card border-0 shadow-sm"
          style={{ width: 400, borderRadius: 16 }}
        >
          <div className="card-body p-4">
            {/* Logo */}
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: 40,
                height: 40,
                background: "#185FA5",
                borderRadius: 10,
              }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            <h5 className="text-center fw-semibold mb-1">Welcome back</h5>
            <p className="text-center text-muted small mb-4">
              Sign in to your account to continue
            </p>

            <Form noValidate onSubmit={handleSubmit}>
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-medium text-secondary">
                  Email address
                </Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-medium text-secondary">
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
                    style={{ paddingRight: 40 }}
                  />
                  <span
                    onClick={() => setShowPassword((s) => !s)}
                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                    style={{ cursor: "pointer", fontSize: 16, zIndex: 5 }}
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
                    <span className="small text-secondary">Remember me</span>
                  }
                  checked={form.remember}
                  onChange={handleChange}
                />
                <a
                  href="/forgot-password"
                  className="small text-primary text-decoration-none"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-100 fw-medium"
                style={{ background: "#185FA5", border: "none" }}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              {/* Divider */}
              <div className="d-flex align-items-center gap-2 my-3">
                <hr className="flex-grow-1 m-0" />
                <span className="text-muted small">or</span>
                <hr className="flex-grow-1 m-0" />
              </div>

              {/* Sign up link */}
              <p className="text-center small text-muted mb-0">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-primary fw-medium text-decoration-none"
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
