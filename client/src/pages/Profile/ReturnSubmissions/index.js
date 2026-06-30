import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loadersSlice";
import { GetIssues, ReturnBook } from "../../../apicalls/issues";

const FINE_PER_DAY = 1;

function ReturnSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const dispatch = useDispatch();

  const load = async () => {
    try {
      dispatch(ShowLoading());
      const res = await GetIssues({ status: "return_pending" });
      dispatch(HideLoading());
      if (res.success) {
        setSubmissions(res.data);
      } else {
        message.error(res.message);
      }
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAcceptReturn = async (record) => {
    const today = moment().startOf("day");
    const dueDate = moment(record.returnDate).startOf("day");
    const daysOverdue = today.diff(dueDate, "days");
    const fine = daysOverdue > 0 ? daysOverdue * FINE_PER_DAY : 0;

    const confirmMsg =
      fine > 0
        ? `Accept return for this book? Overdue by ${daysOverdue} day(s). A fine of ₹${fine} will be applied.`
        : "Accept return for this book? No fine applies.";

    if (!window.confirm(confirmMsg)) return;

    try {
      dispatch(ShowLoading());
      const response = await ReturnBook({
        _id: record._id,
        book: record.book?._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        load();
      } else {
        message.error(response.message);
      }
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  const exportCSV = () => {
    const headers = ["Student Name", "Roll No", "Book Title", "Issue Date", "Due Date", "Days Overdue", "Accrued Fine (₹)"];
    const rows = submissions.map((i) => {
      const days = moment().startOf("day").diff(moment(i.returnDate).startOf("day"), "days");
      const fine = days > 0 ? days * FINE_PER_DAY : 0;
      return [
        i.user?.name,
        i.user?.rollNumber || "—",
        i.book?.title,
        moment(i.issueDate).format("DD MMM YYYY"),
        moment(i.returnDate).format("DD MMM YYYY"),
        Math.max(0, days),
        fine,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pending_returns.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "Student",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.user?.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
            {r.user?.rollNumber ? `Roll: ${r.user.rollNumber}` : r.user?.email}
          </div>
        </div>
      ),
    },
    {
      title: "Book",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text)" }}>{r.book?.title}</div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.book?.author}</div>
        </div>
      ),
    },
    {
      title: "Issued On",
      dataIndex: "issueDate",
      render: (d) => moment(d).format("DD MMM YYYY"),
    },
    {
      title: "Due Date",
      dataIndex: "returnDate",
      render: (d) => {
        const isOverdue = moment().isAfter(moment(d));
        return (
          <span style={{ color: isOverdue ? "var(--danger)" : "var(--text-muted)", fontWeight: 500 }}>
            {moment(d).format("DD MMM YYYY")}
          </span>
        );
      },
    },
    {
      title: "Accrued Fine (₹)",
      render: (_, r) => {
        const days = moment().startOf("day").diff(moment(r.returnDate).startOf("day"), "days");
        const fine = days > 0 ? days * FINE_PER_DAY : 0;
        if (fine > 0) {
          return <span style={{ color: "var(--danger)", fontWeight: 700 }}>₹{fine}</span>;
        }
        return <span style={{ color: "var(--success)" }}>None</span>;
      },
    },
    {
      title: "Actions",
      render: (_, r) => (
        <button className="btn btn-primary btn-sm" onClick={() => handleAcceptReturn(r)}>
          <i className="ri-checkbox-circle-line"></i> Accept Return
        </button>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          {submissions.length > 0 && (
            <span style={{
              background: "var(--primary-light)", color: "var(--primary-dark)",
              padding: "4px 12px", borderRadius: "var(--radius-pill)",
              fontSize: 12, fontWeight: 700,
            }}>
              {submissions.length} return request{submissions.length !== 1 ? "s" : ""} pending
            </span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={submissions.length === 0}>
          <i className="ri-download-line"></i> Export CSV
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="ri-book-open-line"></i></div>
          <p>No pending return requests 🎉</p>
          <span>All returns are up to date</span>
        </div>
      ) : (
        <Table columns={columns} dataSource={submissions} rowKey="_id" size="small" scroll={{ x: true }} />
      )}
    </div>
  );
}

export default ReturnSubmissions;
