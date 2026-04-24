import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetAllBooks } from "../../apicalls/books";
import { GetDashboardStats } from "../../apicalls/issues";
import { ToggleBookmark, GetBookmarks } from "../../apicalls/bookmarks";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role !== "student";

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

  const loadStats = async () => {
    try {
      const res = await GetDashboardStats();
      if (res.success) setStats(res.data);
    } catch (e) { /* silent */ }
  };

  const loadBookmarks = async () => {
    try {
      const res = await GetBookmarks();
      if (res.success) {
        const ids = new Set(res.data.map((b) => b.book?._id));
        setBookmarkedIds(ids);
      }
    } catch (e) { /* silent */ }
  };

  const handleBookmark = async (e, bookId) => {
    e.stopPropagation();
    const res = await ToggleBookmark(bookId);
    if (res.success) {
      const next = new Set(bookmarkedIds);
      if (res.bookmarked) next.add(bookId);
      else next.delete(bookId);
      setBookmarkedIds(next);
      message.success(res.message);
    }
  };

  useEffect(() => {
    getBooks();
    if (isAdmin) loadStats();
    loadBookmarks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const q = search.toLowerCase();
    return (
      book.title?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      book.category?.toLowerCase().includes(q)
    );
  });

  const statCards = stats
    ? [
        { label: "Total Books", value: stats.totalBooks, icon: "ri-book-line", color: "var(--primary-dark)" },
        { label: "Students", value: stats.totalStudents, icon: "ri-user-line", color: "#7c3aed" },
        { label: "Active Issues", value: stats.activeIssues, icon: "ri-file-list-3-line", color: "var(--warning)" },
        { label: "Overdue", value: stats.overdueIssues, icon: "ri-alarm-warning-line", color: "var(--danger)" },
        { label: "Total Fines", value: `₹${stats.totalFineAmount}`, icon: "ri-money-dollar-circle-line", color: "#d97706" },
      ]
    : [];

  return (
    <div>
      {/* Admin Stats Dashboard */}
      {isAdmin && stats && (
        <div className="fade-in" style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          {statCards.map((s) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 160px",
                background: "var(--bg-card)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "18px 20px",
                minWidth: 150,
              }}
            >
              <i className={s.icon} style={{ fontSize: 22, color: s.color }}></i>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 6 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="books-page-header">
        <div>
          <h1 className="books-page-title">Library Collection</h1>
          <p className="books-page-count">
            {search
              ? `${filteredBooks.length} result${filteredBooks.length !== 1 ? "s" : ""} for "${search}"`
              : `${books.length} book${books.length !== 1 ? "s" : ""} in the collection`}
          </p>
        </div>

        <div className="search-bar-wrapper">
          <i className="ri-search-line search-bar-icon"></i>
          <input
            type="text"
            className="search-bar"
            placeholder="Search by title, author, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="ri-book-search-line"></i>
          </div>
          <p>{search ? `No results for "${search}"` : "No books in the library yet."}</p>
          {search && (
            <span>Try a different search term</span>
          )}
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch("")} style={{ marginTop: 4 }}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="books-grid fade-in">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="book-card"
              onClick={() => navigate(`/book/${book._id}`)}
            >
              <div className="book-cover-wrap">
                <img
                  src={book.image}
                  alt={book.title}
                  className="book-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop";
                  }}
                />
                <span
                  className={`book-avail-badge ${book.availableCopies > 0 ? "badge-available" : "badge-unavailable"}`}
                >
                  {book.availableCopies > 0 ? "Available" : "Checked Out"}
                </span>

                {/* Bookmark button */}
                <button
                  className="bookmark-btn"
                  onClick={(e) => handleBookmark(e, book._id)}
                  title={bookmarkedIds.has(book._id) ? "Remove bookmark" : "Bookmark this book"}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: "50%",
                    width: 34,
                    height: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 18,
                    color: bookmarkedIds.has(book._id) ? "#d97706" : "#aaa",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                    zIndex: 2,
                  }}
                >
                  <i className={bookmarkedIds.has(book._id) ? "ri-bookmark-fill" : "ri-bookmark-line"}></i>
                </button>
              </div>
              <div className="book-card-body">
                {book.category && (
                  <p className="book-card-category">{book.category}</p>
                )}
                <h3 className="book-card-title">{book.title}</h3>
                {book.author && (
                  <p className="book-card-author">
                    <i className="ri-quill-pen-line"></i>
                    {book.author}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
