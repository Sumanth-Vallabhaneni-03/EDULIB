import React, { useEffect } from "react";
import { message, Table } from "antd";
import { GetIssues } from "../../../apicalls/issues";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

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
      render: (f) => (
        <span style={{ color: f > 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
          {f > 0 ? `₹${f}` : "None"}
        </span>
      ),
    },
    {
      title: "Returned On",
      dataIndex: "returnedDate",
      render: (d) =>
        d ? (
          <span style={{ color: "var(--success)" }}>{moment(d).format("DD MMM YYYY")}</span>
        ) : (
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
        ),
    },
  ];

  return (
    <div className="fade-in">
      <Table columns={columns} dataSource={issuedBooks} rowKey="_id" />
    </div>
  );
}

export default IssuedBooks;
