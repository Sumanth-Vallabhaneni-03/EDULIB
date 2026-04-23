import { message, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import moment from "moment";
import { GetAllUsers } from "../../../apicalls/users";
import IssuedBooks from "./IssuedBooks";

function Users({ role }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showIssuedBooks, setShowIssuedBooks] = useState(false);
  const [users, setUsers] = React.useState([]);
  const dispatch = useDispatch();

  const getUsers = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllUsers(role);
      dispatch(HideLoading());
      if (response.success) {
        setUsers(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(name)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{name}</div>
            <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{record._id}</div>
          </div>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", render: (e) => <span style={{ color: "var(--text-muted)" }}>{e}</span> },
    { title: "Phone", dataIndex: "phone" },
    {
      title: "Joined",
      dataIndex: "createdAt",
      render: (d) => moment(d).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <button
          className="btn btn-outlined btn-sm"
          onClick={() => {
            setSelectedUser(record);
            setShowIssuedBooks(true);
          }}
        >
          <i className="ri-book-read-line"></i>
          View Books
        </button>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <Table dataSource={users} columns={columns} rowKey="_id" />

      {showIssuedBooks && (
        <IssuedBooks
          showIssuedBooks={showIssuedBooks}
          setShowIssuedBooks={setShowIssuedBooks}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
}

export default Users;
