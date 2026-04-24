import React from "react";
import { Tabs } from "antd";
import Books from "./Books";
import Users from "./Users";
import Reports from "./Reports";
import { useSelector } from "react-redux";
import BasicDetails from "./BasicDetails";
import BorrowedBooks from "./BorrowedBooks";
import OverdueDashboard from "./OverdueDashboard";
import BookRequests from "./Requests";
import ReadingHistory from "./ReadingHistory";
import PendingApprovals from "./PendingApprovals";
import BookmarksList from "./Bookmarks";

function Profile() {
  const { user } = useSelector((state) => state.users);
  const role = user.role;

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <i className="ri-user-line" style={{ marginRight: 6 }}></i>
          General
        </span>
      ),
      children: <BasicDetails />,
    },

    // ── Student-only tabs ──────────────────────────────
    role === "student" && {
      key: "2",
      label: (
        <span>
          <i className="ri-book-read-line" style={{ marginRight: 6 }}></i>
          Borrowed Books
        </span>
      ),
      children: <BorrowedBooks />,
    },
    role === "student" && {
      key: "2b",
      label: (
        <span>
          <i className="ri-history-line" style={{ marginRight: 6 }}></i>
          Reading History
        </span>
      ),
      children: <ReadingHistory />,
    },
    role === "student" && {
      key: "2c",
      label: (
        <span>
          <i className="ri-bookmark-line" style={{ marginRight: 6 }}></i>
          Bookmarks
        </span>
      ),
      children: <BookmarksList />,
    },
    role === "student" && {
      key: "2d",
      label: (
        <span>
          <i className="ri-book-marked-line" style={{ marginRight: 6 }}></i>
          My Requests
        </span>
      ),
      children: <BookRequests />,
    },

    // ── Admin / Librarian tabs ─────────────────────────
    role !== "student" && {
      key: "3",
      label: (
        <span>
          <i className="ri-book-2-line" style={{ marginRight: 6 }}></i>
          Books
        </span>
      ),
      children: <Books />,
    },
    role !== "student" && {
      key: "3b",
      label: (
        <span>
          <i className="ri-alarm-warning-line" style={{ marginRight: 6, color: "var(--danger)" }}></i>
          Overdue / Due Soon
        </span>
      ),
      children: <OverdueDashboard />,
    },
    role !== "student" && {
      key: "3c",
      label: (
        <span>
          <i className="ri-book-marked-line" style={{ marginRight: 6 }}></i>
          Book Requests
        </span>
      ),
      children: <BookRequests />,
    },
    role !== "student" && {
      key: "4",
      label: (
        <span>
          <i className="ri-graduation-cap-line" style={{ marginRight: 6 }}></i>
          Students
        </span>
      ),
      children: <Users role="student" />,
    },
    role !== "student" && {
      key: "4b",
      label: (
        <span>
          <i className="ri-user-follow-line" style={{ marginRight: 6, color: "var(--warning)" }}></i>
          Pending Approvals
        </span>
      ),
      children: <PendingApprovals />,
    },
    role === "admin" && {
      key: "5",
      label: (
        <span>
          <i className="ri-user-3-line" style={{ marginRight: 6 }}></i>
          Librarians
        </span>
      ),
      children: <Users role="librarian" />,
    },
    role === "admin" && {
      key: "6",
      label: (
        <span>
          <i className="ri-shield-user-line" style={{ marginRight: 6 }}></i>
          Admins
        </span>
      ),
      children: <Users role="admin" />,
    },
    role === "admin" && {
      key: "7",
      label: (
        <span>
          <i className="ri-bar-chart-line" style={{ marginRight: 6 }}></i>
          Reports
        </span>
      ),
      children: <Reports />,
    },
  ].filter(Boolean);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
          My Profile
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
          Manage your account and library activities
        </p>
      </div>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  );
}

export default Profile;
