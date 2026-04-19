import React, { useEffect } from "react";
import { Form, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { RegisterUser } from "../../apicalls/users";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await RegisterUser(values);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        navigate("/login");
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
        <div className="auth-ill-icon">🎓</div>
        <h1 className="auth-ill-title">Join Your Campus Library Today</h1>
        <p className="auth-ill-subtitle">
          Create your account and get instant access to thousands of books,
          track your borrowings, and never miss a due date.
        </p>
        <div className="auth-ill-badges">
          <span className="auth-ill-badge">📚 10,000+ Books</span>
          <span className="auth-ill-badge">⚡ Instant Access</span>
          <span className="auth-ill-badge">📅 Due Date Alerts</span>
          <span className="auth-ill-badge">🆓 Free to Join</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-logo-text">EduLib</div>
          <hr className="auth-divider" />

          <h2 className="auth-page-title">Create your account 📝</h2>
          <p className="auth-page-subtitle">Fill in your details to get started</p>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              label={<span className="form-label">Full Name</span>}
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <input type="text" placeholder="e.g. Sumanth Vallabhaneni" className="form-input" />
            </Form.Item>

            <Form.Item
              label={<span className="form-label">Email Address</span>}
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
            >
              <input type="email" placeholder="you@example.com" className="form-input" />
            </Form.Item>

            <Form.Item
              label={<span className="form-label">Phone Number</span>}
              name="phone"
              rules={[{ required: true, message: "Please enter your phone number" }]}
            >
              <input type="number" placeholder="9876543210" className="form-input" />
            </Form.Item>

            <Form.Item
              label={<span className="form-label">Password</span>}
              name="password"
              rules={[{ required: true, message: "Please enter a password" }]}
            >
              <input type="password" placeholder="Choose a strong password" className="form-input" />
            </Form.Item>

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              <button type="submit" className="btn btn-primary w-100" style={{ padding: "12px 20px", fontSize: 15 }}>
                <i className="ri-user-add-line"></i>
                Create Account
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "var(--primary-text)", fontWeight: 600 }}>
                  Sign in
                </Link>
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Register;
