import { message, Modal, Table } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { DeleteIssue, GetIssues, ReturnBook } from "../../../apicalls/issues";
import moment from "moment";
import IssueForm from "./IssueForm";

// Must match FINE_PER_DAY in IssueForm.js
const FINE_PER_DAY = 5;

function Issues({ open = false, setOpen, selectedBook, reloadBooks }) {
  const [issues, setIssues] = React.useState([]);
  const [selectedIssue, setSelectedIssue] = React.useState(null);
  const [showIssueForm, setShowIssueForm] = React.useState(false);
  const dispatch = useDispatch();

  const getIssues = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetIssues({ book: selectedBook._id });
      dispatch(HideLoading());
      if (response.success) {
        setIssues(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getIssues();
  }, []);

  const onReturnHandler = async (issue) => {
    const today = moment().startOf("day");
    const dueDate = moment(issue.returnDate).startOf("day");
    const daysOverdue = today.diff(dueDate, "days");
    const fine = daysOverdue > 0 ? daysOverdue * FINE_PER_DAY : 0;

    // Show confirmation with fine info
    const confirmMsg =
      fine > 0
        ? `This book is ${daysOverdue} day(s) overdue. A fine of ₹${fine} will be recorded. Confirm return?`
        : "Confirm return of this book? No fine applies.";

    if (!window.confirm(confirmMsg)) return;

    try {
      const payload = {
        ...issue,
        book: issue.book._id,
        fine,
        returnedDate: new Date(),
      };
      dispatch(ShowLoading());
      const response = await ReturnBook(payload);
      dispatch(HideLoading());
      if (response.success) {
        message.success(fine > 0 ? `Book returned. Fine: ₹${fine}` : "Book returned successfully");
        getIssues();
        reloadBooks();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const deleteIssueHandler = async (issue) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteIssue({ ...issue, book: issue.book._id });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getIssues();
        reloadBooks();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "_id",
      render: (_id, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
            {record.user?.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>
            {_id}
          </div>
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
        const overdue = moment().isAfter(moment(d));
        return (
          <span style={{ color: overdue ? "var(--danger)" : "var(--text-muted)" }}>
            {moment(d).format("DD MMM YYYY")}
            {overdue && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "var(--danger)" }}>OVERDUE</span>}
          </span>
        );
      },
    },
    {
      title: "Fine (₹)",
      dataIndex: "fine",
      render: (f) => (
        <span style={{ color: f > 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
          {f > 0 ? `₹${f}` : "—"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "returnedDate",
      render: (d) =>
        d ? (
          <span
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--success-light)",
              color: "var(--success)",
              fontWeight: 700,
            }}
          >
            Returned {moment(d).format("DD MMM")}
          </span>
        ) : (
          <span
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--warning-light)",
              color: "var(--warning)",
              fontWeight: 700,
            }}
          >
            Pending
          </span>
        ),
    },
    {
      title: "Actions",
      render: (_, record) =>
        !record.returnedDate && (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedIssue(record);
                setShowIssueForm(true);
              }}
            >
              Renew
            </button>
            <button
              className="btn btn-outlined btn-sm"
              onClick={() => onReturnHandler(record)}
            >
              Return
            </button>
            <button
              className="icon-btn icon-btn-danger"
              onClick={() => deleteIssueHandler(record)}
              title="Delete Issue"
            >
              <i className="ri-delete-bin-5-line"></i>
            </button>
          </div>
        ),
    },
  ];

  return (
    <Modal
      title={`📋 Issues — ${selectedBook?.title}`}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={1100}
      centered
    >
      <Table columns={columns} dataSource={issues} rowKey="_id" scroll={{ x: true }} />

      {showIssueForm && (
        <IssueForm
          selectedBook={selectedBook}
          selectedIssue={selectedIssue}
          open={showIssueForm}
          setOpen={setShowIssueForm}
          setSelectedBook={() => {}}
          getData={() => {
            getIssues();
            reloadBooks();
          }}
          type="edit"
        />
      )}
    </Modal>
  );
}

export default Issues;
