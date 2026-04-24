import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loadersSlice";
import { GetBookmarks, ToggleBookmark } from "../../../apicalls/bookmarks";

function BookmarksList() {
  const [bookmarks, setBookmarks] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const load = async () => {
    try {
      dispatch(ShowLoading());
      const res = await GetBookmarks();
      dispatch(HideLoading());
      if (res.success) setBookmarks(res.data);
      else message.error(res.message);
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (e, bookId) => {
    e.stopPropagation();
    const res = await ToggleBookmark(bookId);
    if (res.success) {
      message.success("Bookmark removed");
      load();
    }
  };

  return (
    <div className="fade-in">
      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><i className="ri-bookmark-line"></i></div>
          <p>No bookmarked books yet</p>
          <span>Bookmark books from the library to see them here</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {bookmarks.map((bm) => {
            const book = bm.book;
            if (!book) return null;
            const isAvailable = book.availableCopies > 0;
            return (
              <div
                key={bm._id}
                className="book-card"
                onClick={() => navigate(`/book/${book._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="book-cover-wrap">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="book-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop";
                    }}
                  />
                  <span className={`book-avail-badge ${isAvailable ? "badge-available" : "badge-unavailable"}`}>
                    {isAvailable ? "Available" : "Checked Out"}
                  </span>
                  <button
                    onClick={(e) => handleRemove(e, book._id)}
                    title="Remove bookmark"
                    style={{
                      position: "absolute", top: 8, right: 8,
                      background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%",
                      width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 18, color: "#d97706",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2,
                    }}
                  >
                    <i className="ri-bookmark-fill"></i>
                  </button>
                </div>
                <div className="book-card-body">
                  {book.category && <p className="book-card-category">{book.category}</p>}
                  <h3 className="book-card-title">{book.title}</h3>
                  {book.author && (
                    <p className="book-card-author">
                      <i className="ri-quill-pen-line"></i> {book.author}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BookmarksList;
