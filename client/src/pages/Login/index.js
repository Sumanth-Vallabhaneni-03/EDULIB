import React, { useEffect } from "react";
import { Form, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../apicalls/users";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      // Send as { identifier, password } — backend accepts email OR roll number
      const response = await LoginUser({
        identifier: values.identifier,
        password: values.password,
      });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        localStorage.setItem("token", response.data);
        window.location.href = "/";
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, []);

  return (
    <div className="auth-page">
      {/* Left — illustration */}
      <div className="auth-illustration">
        <div className="auth-ill-icon">📚</div>
        <h1 className="auth-ill-title">Your Smart Library, Simplified</h1>
        <p className="auth-ill-subtitle">
          Discover, borrow, and manage books with ease. Everything your library
          needs, in one elegant place.
        </p>
        <div className="auth-ill-badges">
          <span className="auth-ill-badge">📖 Borrow Books</span>
          <span className="auth-ill-badge">🔔 Due Reminders</span>
          <span className="auth-ill-badge">📊 Reports</span>
          <span className="auth-ill-badge">🔒 Secure</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-logo-text">EduLib</div>
          <hr className="auth-divider" />

          <h2 className="auth-page-title">Welcome back 👋</h2>
          <p className="auth-page-subtitle">
            Sign in with your email address or student roll number
          </p>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              label={<span className="form-label">Email or Roll Number</span>}
              name="identifier"
              rules={[{ required: true, message: "Please enter your email or roll number" }]}
            >
              <input
                type="text"
                placeholder="you@example.com  or  21CS001"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label={<span className="form-label">Password</span>}
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
              />
            </Form.Item>

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              <button
                type="submit"
                className="btn btn-primary w-100"
                style={{ padding: "12px 20px", fontSize: 15 }}
              >
                <i className="ri-login-box-line"></i>
                Sign In
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: "var(--primary-text)", fontWeight: 600 }}>
                  Create one here
                </Link>
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
