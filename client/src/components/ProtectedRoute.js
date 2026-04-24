import { message } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetLoggedInUserDetails } from "../apicalls/users";
import { HideLoading, ShowLoading } from "../redux/loadersSlice";
import { SetUser } from "../redux/usersSlice";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const validateUserToken = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetLoggedInUserDetails();
      dispatch(HideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        localStorage.removeItem("token");
        navigate("/login");
        message.error(response.message);
      }
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      validateUserToken();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Pending approval screen
  if (user && user.status === "pending") {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: 40, textAlign: "center", background: "var(--bg-page)",
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Account Pending Approval
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 400, lineHeight: 1.7 }}>
          Your account has been created successfully. An administrator will review and approve your access soon.
          Please check back later.
        </p>
        <button className="btn btn-outlined" onClick={handleLogout} style={{ marginTop: 24 }}>
          <i className="ri-logout-box-line"></i>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div>
      {user && (
        <div>
          {/* ── Navbar ── */}
          <nav className="navbar">
            {/* Logo */}
            <div className="navbar-logo" onClick={() => navigate("/")}>
              <div className="navbar-logo-icon">
                <i className="ri-book-open-line"></i>
              </div>
              EduLib
            </div>

            {/* Nav links */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ border: "none", background: "none", color: "var(--text-2)" }}
                onClick={() => navigate("/")}
              >
                <i className="ri-home-4-line"></i>
                Library
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ border: "none", background: "none", color: "var(--text-2)" }}
                onClick={() => navigate("/profile")}
              >
                <i className="ri-user-line"></i>
                My Profile
              </button>
            </div>

            {/* User area */}
            <div className="navbar-right">
              <div
                className="navbar-user"
                onClick={() => navigate("/profile")}
                title="Go to profile"
              >
                <div className="navbar-avatar">{getInitials(user.name)}</div>
                <span className="navbar-username">{user.name}</span>
              </div>

              <button className="navbar-logout" onClick={handleLogout} title="Sign out">
                <i className="ri-logout-box-r-line"></i>
              </button>
            </div>
          </nav>

          {/* ── Page Content ── */}
          <div className="main-content fade-in">{children}</div>
        </div>
      )}
    </div>
  );
}

export default ProtectedRoute;
