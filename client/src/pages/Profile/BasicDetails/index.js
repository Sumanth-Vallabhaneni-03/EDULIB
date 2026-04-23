import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";

function BasicDetails() {
  const { user } = useSelector((state) => state.users);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fade-in">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-card-header">
          <div className="profile-avatar-lg">{getInitials(user.name)}</div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-role-badge">{user.role}</div>
          </div>
        </div>

        {/* Details */}
        <div className="profile-card-body">
          <div className="profile-detail-row">
            <span className="profile-detail-label">
              <i className="ri-mail-line"></i> Email
            </span>
            <span className="profile-detail-value">{user.email}</span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-detail-label">
              <i className="ri-phone-line"></i> Phone
            </span>
            <span className="profile-detail-value">{user.phone}</span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-detail-label">
              <i className="ri-shield-line"></i> Role
            </span>
            <span
              className="profile-detail-value"
              style={{ textTransform: "capitalize" }}
            >
              {user.role}
            </span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-detail-label">
              <i className="ri-calendar-check-line"></i> Member Since
            </span>
            <span className="profile-detail-value">
              {moment(user.createdAt).format("MMM Do YYYY")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicDetails;
