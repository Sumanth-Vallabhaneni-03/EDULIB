import React, { useEffect } from "react";
import { message, Modal, Table } from "antd";
import { GetIssues } from "../../../apicalls/issues";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { useDispatch } from "react-redux";
import moment from "moment";

function IssuedBooks({ showIssuedBooks, setShowIssuedBooks, selectedUser }) {
  const [issuedBooks, setIssuedBooks] = React.useState([]);
  const dispatch = useDispatch();

  const getIssues = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetIssues({ user: selectedUser._id });
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
        const overdue = moment().isAfter(moment(d));
        return (
          <span style={{ color: overdue ? "var(--danger)" : "var(--text-muted)" }}>
            {moment(d).format("DD MMM YYYY")}
            {overdue && (
              <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "var(--danger)" }}>
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
          {f > 0 ? `₹${f}` : "—"}
        </span>
      ),
    },
    {
      title: "Return Status",
      dataIndex: "returnedDate",
      render: (d) =>
        d ? (
          <span
            style={{
              fontSize: 11,
              padding: "2px 10px",
              borderRadius: 50,
              background: "rgba(16,185,129,0.15)",
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
              padding: "2px 10px",
              borderRadius: 50,
              background: "rgba(245,158,11,0.15)",
              color: "var(--accent)",
              fontWeight: 700,
            }}
          >
            Pending Return
          </span>
        ),
    },
  ];

  return (
    <Modal
      title={`📚 ${selectedUser?.name}'s Issued Books`}
      open={showIssuedBooks}
      onCancel={() => setShowIssuedBooks(false)}
      footer={null}
      width={900}
      centered
    >
      <Table columns={columns} dataSource={issuedBooks} rowKey="_id" />
    </Modal>
  );
}

export default IssuedBooks;
