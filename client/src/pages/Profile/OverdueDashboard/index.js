import React, { useEffect, useState } from "react";
import { Table, message, Tabs } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loadersSlice";
import { GetOverdueIssues, GetDueSoonIssues, MarkFinePaid, MarkFineWaived } from "../../../apicalls/issues";

const FINE_PER_DAY = 5;

function OverdueDashboard() {
  const [overdue, setOverdue] = useState([]);
  const [dueSoon, setDueSoon] = useState([]);
  const dispatch = useDispatch();

  const load = async () => {
    try {
      dispatch(ShowLoading());
      const [o, d] = await Promise.all([GetOverdueIssues(), GetDueSoonIssues()]);
      dispatch(HideLoading());
      if (o.success) setOverdue(o.data);
      if (d.success) setDueSoon(d.data);
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkPaid = async (issue) => {
    const res = await MarkFinePaid(issue._id);
    if (res.success) { message.success(res.message); load(); }
    else message.error(res.message);
  };

  const handleWaive = async (issue) => {
    const res = await MarkFineWaived(issue._id);
    if (res.success) { message.success(res.message); load(); }
    else message.error(res.message);
  };

  // Export CSV helper
  const exportCSV = (data, filename) => {
    const headers = ["Student", "Roll No", "Email", "Phone", "Book", "Due Date", "Days Overdue", "Fine (₹)"];
    const rows = data.map(i => {
      const days = moment().startOf("day").diff(moment(i.returnDate).startOf("day"), "days");
      return [
        i.user?.name, i.user?.rollNumber || "—", i.user?.email, i.user?.phone,
        i.book?.title, moment(i.returnDate).format("DD MMM YYYY"),
        Math.max(0, days), i.fine || 0
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const overdueColumns = [
    {
      title: "Student",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
            {r.user?.rollNumber || r.user?.email}
          </div>
        </div>
      ),
    },
    { title: "Book", render: (_, r) => <span style={{ fontWeight: 600 }}>{r.book?.title}</span> },
    {
      title: "Was Due",
      dataIndex: "returnDate",
      render: d => <span style={{ color: "var(--danger)", fontWeight: 600 }}>{moment(d).format("DD MMM YYYY")}</span>,
    },
    {
      title: "Days Overdue",
      render: (_, r) => {
        const days = moment().startOf("day").diff(moment(r.returnDate).startOf("day"), "days");
        return <span style={{ color: "var(--danger)", fontWeight: 700 }}>{days} days</span>;
      },
    },
    {
      title: "Fine (₹)",
      render: (_, r) => {
        const days = moment().startOf("day").diff(moment(r.returnDate).startOf("day"), "days");
        const fine = days > 0 ? days * FINE_PER_DAY : 0;
        if (r.fineWaived) return <span className="tag tag-teal">Waived</span>;
        if (r.finePaid) return <span className="tag tag-green">Paid ₹{r.fine}</span>;
        return <span style={{ color: "var(--danger)", fontWeight: 700 }}>₹{fine}</span>;
      },
    },
    {
      title: "Contact",
      render: (_, r) => (
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          <div>{r.user?.phone}</div>
          <div>{r.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      render: (_, r) => !r.returnedDate && r.fine > 0 && !r.finePaid && !r.fineWaived && (
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-outlined btn-sm" onClick={() => handleMarkPaid(r)}>
            <i className="ri-money-dollar-circle-line"></i> Paid
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleWaive(r)}>
            <i className="ri-shield-check-line"></i> Waive
          </button>
        </div>
      ),
    },
  ];

  const dueSoonColumns = [
    {
      title: "Student",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.user?.rollNumber || r.user?.email}</div>
        </div>
      ),
    },
    { title: "Book", render: (_, r) => <span style={{ fontWeight: 600 }}>{r.book?.title}</span> },
    {
      title: "Due Date",
      dataIndex: "returnDate",
      render: d => {
        const days = moment(d).startOf("day").diff(moment().startOf("day"), "days");
        const color = days <= 2 ? "var(--danger)" : "var(--warning)";
        return (
          <div>
            <div style={{ color, fontWeight: 700 }}>{moment(d).format("DD MMM YYYY")}</div>
            <div style={{ fontSize: 11, color }}>{days === 0 ? "Due today!" : `${days} day(s) left`}</div>
          </div>
        );
      },
    },
    {
      title: "Contact",
      render: (_, r) => (
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          <div>{r.user?.phone}</div>
          <div>{r.user?.email}</div>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: "overdue",
      label: (
        <span>
          <i className="ri-alarm-warning-line" style={{ marginRight: 6, color: "var(--danger)" }}></i>
          Overdue
          {overdue.length > 0 && (
            <span style={{ marginLeft: 6, background: "var(--danger)", color: "white", borderRadius: "var(--radius-pill)", padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
              {overdue.length}
            </span>
          )}
        </span>
      ),
      children: (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(overdue, "overdue_books.csv")}>
              <i className="ri-download-line"></i> Export CSV
            </button>
          </div>
          {overdue.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="ri-check-double-line"></i></div>
              <p>No overdue books! 🎉</p>
            </div>
          ) : (
            <Table columns={overdueColumns} dataSource={overdue} rowKey="_id" size="small" scroll={{ x: true }} />
          )}
        </div>
      ),
    },
    {
      key: "due-soon",
      label: (
        <span>
          <i className="ri-time-line" style={{ marginRight: 6, color: "var(--warning)" }}></i>
          Due in 7 Days
          {dueSoon.length > 0 && (
            <span style={{ marginLeft: 6, background: "var(--warning)", color: "white", borderRadius: "var(--radius-pill)", padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
              {dueSoon.length}
            </span>
          )}
        </span>
      ),
      children: (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(dueSoon, "due_soon_books.csv")}>
              <i className="ri-download-line"></i> Export CSV
            </button>
          </div>
          {dueSoon.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><i className="ri-calendar-check-line"></i></div>
              <p>No books due in the next 7 days</p>
            </div>
          ) : (
            <Table columns={dueSoonColumns} dataSource={dueSoon} rowKey="_id" size="small" scroll={{ x: true }} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <Tabs items={tabItems} />
    </div>
  );
}

export default OverdueDashboard;
