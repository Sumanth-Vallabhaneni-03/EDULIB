import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loadersSlice";
import { GetPendingUsers, UpdateUserStatus } from "../../../apicalls/users";

function PendingApprovals() {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  const load = async () => {
    try {
      dispatch(ShowLoading());
      const res = await GetPendingUsers();
      dispatch(HideLoading());
      if (res.success) setUsers(res.data);
      else message.error(res.message);
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (userId, status) => {
    const res = await UpdateUserStatus(userId, status);
    if (res.success) { message.success(res.message); load(); }
    else message.error(res.message);
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Roll Number", "Registered On"];
    const rows = users.map(u => [
      u.name, u.email, u.phone, u.rollNumber || "—",
      moment(u.createdAt).format("DD MMM YYYY"),
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pending_approvals.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "User",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.email}</div>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone" },
    {
      title: "Roll No.",
      dataIndex: "rollNumber",
      render: v => v
        ? <span style={{ background: "var(--primary-light)", color: "var(--primary-dark)", padding: "2px 10px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 700 }}>{v}</span>
        : <span style={{ color: "var(--text-subtle)" }}>—</span>,
    },
    {
      title: "Registered",
      dataIndex: "createdAt",
      render: d => moment(d).format("DD MMM YYYY, h:mm a"),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleStatus(r._id, "active")}
          >
            <i className="ri-check-line"></i> Approve
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--danger)" }}
            onClick={() => handleStatus(r._id, "inactive")}
          >
            <i className="ri-close-line"></i> Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          {users.length > 0 && (
            <span style={{
              background: "var(--warning-light)", color: "var(--warning)",
              padding: "4px 12px", borderRadius: "var(--radius-pill)",
              fontSize: 12, fontWeight: 700,
            }}>
              {users.length} pending approval{users.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={users.length === 0}>
          <i className="ri-download-line"></i> Export CSV
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="ri-user-follow-line"></i></div>
          <p>No pending approvals 🎉</p>
          <span>All accounts are reviewed</span>
        </div>
      ) : (
        <Table columns={columns} dataSource={users} rowKey="_id" size="small" />
      )}
    </div>
  );
}

export default PendingApprovals;
