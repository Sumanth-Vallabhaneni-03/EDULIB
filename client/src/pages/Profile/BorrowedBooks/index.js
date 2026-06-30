import React, { useEffect } from "react";
import { message, Table } from "antd";
import { GetIssues, SubmitReturn } from "../../../apicalls/issues";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

const FINE_PER_DAY = 1;

function IssuedBooks() {
  const { user } = useSelector((state) => state.users);
  const [issuedBooks, setIssuedBooks] = React.useState([]);
  const dispatch = useDispatch();

  const getIssues = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetIssues({ user: user._id });
      dispatch(HideLoading());
      if (response.success) {
        setIssuedBooks(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getIssues();
  }, []);

  const handleReturnSubmit = async (issue) => {
    try {
      dispatch(ShowLoading());
      const response = await SubmitReturn({ issueId: issue._id });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getIssues();
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
      title: "Book",
      dataIndex: "book",
      render: (book) => (
        <span style={{ fontWeight: 500, color: "var(--text)" }}>{book?.title}</span>
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
        const isOverdue = !moment().isBefore(moment(d));
        return (
          <span style={{ color: isOverdue ? "var(--danger)" : "var(--text-muted)" }}>
            {moment(d).format("DD MMM YYYY")}
            {isOverdue && (
              <span style={{ marginLeft: 6, fontSize: 11, color: "var(--danger)", fontWeight: 700 }}>
                OVERDUE
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: "Fine (₹)",
      dataIndex: "fine",
      render: (f, record) => {
        if (record.returnedDate) {
          if (record.fineWaived) return <span style={{ color: "var(--primary-dark)" }}>Waived</span>;
          if (record.finePaid) return <span style={{ color: "var(--success)" }}>Paid (₹{record.fine})</span>;
          return (
            <span style={{ color: record.fine > 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
              {record.fine > 0 ? `₹${record.fine}` : "None"}
            </span>
          );
        }

        const today = moment().startOf("day");
        const dueDate = moment(record.returnDate).startOf("day");
        const daysOverdue = today.diff(dueDate, "days");
        const accruedFine = daysOverdue > 0 ? daysOverdue * FINE_PER_DAY : 0;
        if (accruedFine > 0) {
          return (
            <span style={{ color: "var(--danger)", fontWeight: 700 }}>
              ₹{accruedFine} <span style={{ fontSize: 10, fontWeight: 400, color: "var(--text-muted)" }}>(accruing)</span>
            </span>
          );
        }
        return <span style={{ color: "var(--success)" }}>None</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "returnedDate",
      render: (d, record) => {
        if (d) {
          return <span style={{ color: "var(--success)" }}>Returned {moment(d).format("DD MMM YYYY")}</span>;
        }
        if (record.status === "return_pending") {
          return (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 50,
                background: "var(--primary-light)",
                color: "var(--primary-dark)",
                fontWeight: 600,
              }}
            >
              Pending Acceptance
            </span>
          );
        }
        return (
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.15)",
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            Pending Return
          </span>
        );
      },
    },
    {
      title: "Actions",
      render: (_, record) => {
        if (record.returnedDate) return null;
        if (record.status === "return_pending") {
          return (
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.7 }}>
              Awaiting Approval
            </button>
          );
        }
        return (
          <button className="btn btn-outlined btn-sm" onClick={() => handleReturnSubmit(record)}>
            Submit Return
          </button>
        );
      },
    },
  ];

  return (
    <div className="fade-in">
      <Table columns={columns} dataSource={issuedBooks} rowKey="_id" />
    </div>
  );
}

export default IssuedBooks;
