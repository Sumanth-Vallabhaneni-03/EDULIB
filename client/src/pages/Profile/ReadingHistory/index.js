import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loadersSlice";
import { GetIssues } from "../../../apicalls/issues";
import { useSelector } from "react-redux";

function ReadingHistory() {
  const [issues, setIssues] = useState([]);
  const { user } = useSelector(state => state.users);
  const dispatch = useDispatch();

  const load = async () => {
    try {
      dispatch(ShowLoading());
      const res = await GetIssues({ user: user._id });
      dispatch(HideLoading());
      if (res.success) setIssues(res.data);
      else message.error(res.message);
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const exportCSV = () => {
    const headers = ["Book Title", "Author", "Issue Date", "Due Date", "Return Date", "Fine (₹)", "Status"];
    const rows = issues.map(i => [
      i.book?.title, i.book?.author,
      moment(i.issueDate).format("DD MMM YYYY"),
      moment(i.returnDate).format("DD MMM YYYY"),
      i.returnedDate ? moment(i.returnedDate).format("DD MMM YYYY") : "—",
      i.fine || 0,
      i.returnedDate ? "Returned" : "Active",
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "my_reading_history.csv"; a.click();
    URL.revokeObjectURL(url);
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
    {
      title: "Issued On",
      dataIndex: "issueDate",
      render: d => moment(d).format("DD MMM YYYY"),
    },
    {
      title: "Due Date",
      dataIndex: "returnDate",
      render: d => moment(d).format("DD MMM YYYY"),
    },
    {
      title: "Returned On",
      dataIndex: "returnedDate",
      render: d => d
        ? <span style={{ color: "var(--success)" }}>{moment(d).format("DD MMM YYYY")}</span>
        : <span style={{ color: "var(--warning)", fontWeight: 600 }}>Still with you</span>,
    },
    {
      title: "Fine (₹)",
      dataIndex: "fine",
      render: (f, r) => {
        if (!f || f === 0) return <span style={{ color: "var(--success)" }}>None</span>;
        if (r.fineWaived) return <span className="tag tag-teal">₹{f} — Waived</span>;
        if (r.finePaid)   return <span className="tag tag-green">₹{f} — Paid</span>;
        return <span style={{ color: "var(--danger)", fontWeight: 700 }}>₹{f} — Pending</span>;
      },
    },
    {
      title: "Status",
      render: (_, r) => r.returnedDate
        ? <span style={{ background: "var(--success-light)", color: "var(--success)", padding: "3px 10px", borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 700 }}>Returned</span>
        : <span style={{ background: "var(--primary-light)", color: "var(--primary-dark)", padding: "3px 10px", borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 700 }}>Active</span>,
    },
  ];

  const returned = issues.filter(i => i.returnedDate).length;
  const active   = issues.filter(i => !i.returnedDate).length;

  return (
    <div className="fade-in">
      {/* Quick Stats */}
      {issues.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Borrowed", value: issues.length, icon: "ri-book-line", color: "var(--primary-dark)" },
            { label: "Currently Active", value: active, icon: "ri-file-list-3-line", color: "var(--warning)" },
            { label: "Returned", value: returned, icon: "ri-check-double-line", color: "var(--success)" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "14px 18px" }}>
              <i className={s.icon} style={{ fontSize: 20, color: s.color }}></i>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>
          <i className="ri-download-line"></i> Export CSV
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="ri-history-line"></i></div>
          <p>No borrowing history yet</p>
          <span>Books you borrow will appear here</span>
        </div>
      ) : (
        <Table columns={columns} dataSource={issues} rowKey="_id" size="small" />
      )}
    </div>
  );
}

export default ReadingHistory;
