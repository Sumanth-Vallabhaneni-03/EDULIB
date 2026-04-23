import React, { useEffect } from "react";
import { message } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetBookById } from "../../apicalls/books";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function BookDescription() {
  const [bookData, setBookData] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const getBook = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetBookById(id);
      dispatch(HideLoading());
      if (response.success) {
        setBookData(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getBook();
  }, []);

  if (!bookData) return null;

  const isAvailable = bookData.availableCopies > 0;

  return (
    <div className="fade-in-up">
      {/* Back Button */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate("/")}
        style={{ marginBottom: 16 }}
      >
        <i className="ri-arrow-left-line"></i>
        Back to Library
      </button>

      <div className="book-desc-layout">
        {/* Cover Image */}
        <div>
          <img
            src={bookData.image}
            alt={bookData.title}
            className="book-desc-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/340x480/141728/6366f1?text=📚";
            }}
          />
          <div style={{ marginTop: 14 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 700,
                background: isAvailable
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(239,68,68,0.15)",
                color: isAvailable ? "var(--success)" : "var(--danger)",
                border: `1px solid ${isAvailable ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
              }}
            >
              <i className={isAvailable ? "ri-book-open-line" : "ri-book-2-line"}></i>
              {isAvailable ? "Available to Borrow" : "Currently Unavailable"}
            </span>
          </div>
        </div>

        {/* Book Details */}
        <div className="book-desc-info">
          <div>
            <h1 className="book-desc-title">{bookData.title}</h1>
            {bookData.category && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "3px 12px",
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  background: "var(--primary-glow)",
                  color: "var(--primary-hover)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                {bookData.category}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {bookData.book_id && (
              <div className="book-desc-row">
                <span className="book-desc-row-label">
                  <i className="ri-barcode-line"></i> Book ID
                </span>
                <span className="book-desc-row-value">{bookData.book_id}</span>
              </div>
            )}

            <div className="book-desc-row">
              <span className="book-desc-row-label">
                <i className="ri-quill-pen-line"></i> Author
              </span>
              <span className="book-desc-row-value">{bookData.author}</span>
            </div>

            <div className="book-desc-row">
              <span className="book-desc-row-label">
                <i className="ri-building-line"></i> Publisher
              </span>
              <span className="book-desc-row-value">{bookData.publisher}</span>
            </div>

            <div className="book-desc-row">
              <span className="book-desc-row-label">
                <i className="ri-calendar-line"></i> Published Date
              </span>
              <span className="book-desc-row-value">
                {moment(bookData.publishedDate).format("MMMM Do, YYYY")}
              </span>
            </div>

            <div className="book-desc-row">
              <span className="book-desc-row-label">
                <i className="ri-file-copy-line"></i> Total Copies
              </span>
              <span className="book-desc-row-value">{bookData.totalCopies}</span>
            </div>

            <div className="book-desc-row">
              <span className="book-desc-row-label">
                <i className="ri-check-double-line"></i> Available Copies
              </span>
              <span
                className="book-desc-row-value"
                style={{ color: isAvailable ? "var(--success)" : "var(--danger)", fontWeight: 700 }}
              >
                {bookData.availableCopies}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDescription;
