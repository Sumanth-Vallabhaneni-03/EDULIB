import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loadersSlice";
import { GetRequests, UpdateRequestStatus, DeleteRequest } from "../../../apicalls/requests";

function BookRequests() {
  const [requests, setRequests] = useState([]);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const isAdmin = user?.role !== "student";

  const load = async () => {
    try {
      dispatch(ShowLoading());
      const res = await GetRequests();
      dispatch(HideLoading());
      if (res.success) setRequests(res.data);
      else message.error(res.message);
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpdateStatus = async (requestId, status) => {
    const res = await UpdateRequestStatus(requestId, status);
    if (res.success) { message.success(res.message); load(); }
    else message.error(res.message);
  };

  const handleDelete = async (requestId) => {
    const res = await DeleteRequest(requestId);
    if (res.success) { message.success(res.message); load(); }
    else message.error(res.message);
  };

  const statusStyle = {
    pending:   { background: "var(--warning-light)", color: "var(--warning)" },
    fulfilled: { background: "var(--success-light)", color: "var(--success)" },
    rejected:  { background: "var(--danger-light)",  color: "var(--danger)" },
  };

  const columns = [
    {
      title: "Book",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.book?.title}</div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.book?.author}</div>
        </div>
      ),
    },
    ...(isAdmin ? [{
      title: "Requested By",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.user?.rollNumber || r.user?.email}</div>
        </div>
      ),
    }] : []),
    {
      title: "Note",
      dataIndex: "note",
      render: n => n || <span style={{ color: "var(--text-subtle)" }}>—</span>,
    },
    {
      title: "Requested On",
      dataIndex: "createdAt",
      render: d => moment(d).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: s => (
        <span style={{ ...statusStyle[s], padding: "3px 10px", borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
          {s}
        </span>
      ),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <div style={{ display: "flex", gap: 6 }}>
          {isAdmin && r.status === "pending" && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(r._id, "fulfilled")}>
                <i className="ri-check-line"></i> Fulfill
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleUpdateStatus(r._id, "rejected")}>
                Reject
              </button>
            </>
          )}
          {!isAdmin && r.status === "pending" && (
            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(r._id)}>
              <i className="ri-delete-bin-5-line"></i> Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="ri-book-marked-line"></i></div>
          <p>{isAdmin ? "No book requests yet" : "You haven't requested any books yet"}</p>
          {!isAdmin && <span>Visit a book page to request it</span>}
        </div>
      ) : (
        <Table columns={columns} dataSource={requests} rowKey="_id" size="small" />
      )}
    </div>
  );
}

export default BookRequests;
