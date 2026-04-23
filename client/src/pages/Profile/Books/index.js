import { message, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DeleteBook, GetAllBooks } from "../../../apicalls/books";
import Button from "../../../components/Button";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import BookForm from "./BookForm";
import moment from "moment";
import Issues from "./Issues";
import IssueForm from "./IssueForm";

function Books() {
  const [formType, setFormType] = useState("add");
  const [selectedBook, setSelectedBook] = useState(null);
  const [openBookForm, setOpenBookForm] = useState(false);
  const [openIssues, setOpenIssues] = useState(false);
  const [openIssuesForm, setOpenIssuesForm] = useState(false);
  const [books, setBooks] = useState([]);
  const dispatch = useDispatch();

  const getBooks = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllBooks();
      dispatch(HideLoading());
      if (response.success) {
        setBooks(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getBooks();
  }, []);

  const deleteBook = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteBook(id);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getBooks();
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
      title: "Cover",
      dataIndex: "image",
      render: (image) => (
        <img
          src={image}
          alt="book"
          style={{
            width: 44,
            height: 56,
            objectFit: "cover",
            borderRadius: 6,
            border: "1px solid var(--border)",
          }}
          onError={(e) => { e.target.src = "https://via.placeholder.com/44x56/141728/6366f1?text=📚"; }}
        />
      ),
    },
    { title: "Title", dataIndex: "title" },
    { title: "Category", dataIndex: "category", render: (c) => c ? <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 50, background: "var(--primary-glow)", color: "var(--primary-hover)" }}>{c}</span> : "—" },
    { title: "Author", dataIndex: "author" },
    { title: "Publisher", dataIndex: "publisher" },
    { title: "Total", dataIndex: "totalCopies" },
    {
      title: "Available",
      dataIndex: "availableCopies",
      render: (n) => (
        <span style={{ fontWeight: 700, color: n > 0 ? "var(--success)" : "var(--danger)" }}>{n}</span>
      ),
    },
    {
      title: "Added On",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            className="icon-btn icon-btn-danger"
            title="Delete"
            onClick={() => deleteBook(record._id)}
          >
            <i className="ri-delete-bin-5-line"></i>
          </button>
          <button
            className="icon-btn icon-btn-primary"
            title="Edit"
            onClick={() => {
              setFormType("edit");
              setSelectedBook(record);
              setOpenBookForm(true);
            }}
          >
            <i className="ri-pencil-line"></i>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setOpenIssues(true);
              setSelectedBook(record);
            }}
          >
            Issues
          </button>
          <button
            className="btn btn-outlined btn-sm"
            onClick={() => {
              setOpenIssuesForm(true);
              setSelectedBook(record);
            }}
          >
            Issue Book
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button
          title="Add Book"
          icon="ri-add-line"
          onClick={() => {
            setFormType("add");
            setSelectedBook(null);
            setOpenBookForm(true);
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="_id"
        scroll={{ x: true }}
      />

      {openBookForm && (
        <BookForm
          open={openBookForm}
          setOpen={setOpenBookForm}
          reloadBooks={getBooks}
          formType={formType}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
        />
      )}

      {openIssues && (
        <Issues
          open={openIssues}
          setOpen={setOpenIssues}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          reloadBooks={getBooks}
        />
      )}

      {openIssuesForm && (
        <IssueForm
          open={openIssuesForm}
          setOpen={setOpenIssuesForm}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          getData={getBooks}
          type="add"
        />
      )}
    </div>
  );
}

export default Books;
