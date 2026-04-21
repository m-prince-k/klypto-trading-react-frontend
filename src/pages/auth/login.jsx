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

      <Container
        fluid
        className="vh-100 d-flex justify-content-center align-items-center bg-dark"
      >
        <Card style={{ width: 380 }} className="shadow-lg border-0">
          <Card.Body className="p-4">
            <h4 className="text-center mb-4">Login</h4>

            <Form onSubmit={handleSubmit} noValidate>
              <Form.Group className="mb-3">
                <Form.Control
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 position-relative">
                <Form.Control
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />

                <span
                  onClick={() => setShowPassword((s) => !s)}
                  className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                  style={{ cursor: "pointer", fontSize: 18 }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>

                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Remember Me"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100"
                variant="dark"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
