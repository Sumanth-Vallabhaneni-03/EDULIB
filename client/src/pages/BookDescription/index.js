import React, { useEffect, useState } from "react";
import { message } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetBookById } from "../../apicalls/books";
import { ToggleBookmark, IsBookmarked } from "../../apicalls/bookmarks";
import { AddRequest } from "../../apicalls/requests";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function BookDescription() {
  const [bookData, setBookData] = useState(null);
  const [isMarked, setIsMarked] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const { user } = useSelector((state) => state.users);
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

  const checkBookmark = async () => {
    try {
      const res = await IsBookmarked(id);
      if (res.success) setIsMarked(res.bookmarked);
    } catch (e) { /* silent */ }
  };

  const handleBookmark = async () => {
    const res = await ToggleBookmark(id);
    if (res.success) {
      setIsMarked(res.bookmarked);
      message.success(res.message);
    }
  };

  const handleRequest = async () => {
    const note = window.prompt("Optional note (e.g. 'Need for exam prep'):", "");
    if (note === null) return; // cancelled
    const res = await AddRequest(id, note);
    if (res.success) {
      setRequestSent(true);
      message.success(res.message);
    } else {
      message.error(res.message);
    }
  };

  useEffect(() => {
    getBook();
    checkBookmark();
  }, []);

  if (!bookData) return null;

  const isAvailable = bookData.availableCopies > 0;
  const isStudent = user?.role === "student";

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
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                fontSize: 13,
                fontWeight: 700,
                background: isAvailable ? "var(--success-light)" : "var(--danger-light)",
                color: isAvailable ? "var(--success)" : "var(--danger)",
                border: `1.5px solid ${isAvailable ? "rgba(5,150,105,0.3)" : "rgba(220,38,38,0.3)"}`,
              }}
            >
              <i className={isAvailable ? "ri-book-open-line" : "ri-book-2-line"}></i>
              {isAvailable ? "Available to Borrow" : "Currently Unavailable"}
            </span>

            {/* Action buttons for students */}
            {isStudent && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="btn btn-outlined btn-sm"
                  onClick={handleBookmark}
                  style={{
                    color: isMarked ? "#d97706" : "var(--text-muted)",
                    borderColor: isMarked ? "#d97706" : undefined,
                  }}
                >
                  <i className={isMarked ? "ri-bookmark-fill" : "ri-bookmark-line"}></i>
                  {isMarked ? "Bookmarked" : "Bookmark"}
                </button>

                {!isAvailable && !requestSent && (
                  <button className="btn btn-primary btn-sm" onClick={handleRequest}>
                    <i className="ri-notification-line"></i>
                    Request This Book
                  </button>
                )}
                {requestSent && (
                  <span style={{
                    fontSize: 12, color: "var(--success)", fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <i className="ri-check-line"></i> Request submitted
                  </span>
                )}
              </div>
            )}
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
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  background: "var(--primary-light)",
                  color: "var(--primary-dark)",
                  border: "1.5px solid rgba(13,148,136,0.25)",
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
