import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetAllBooks } from "../../apicalls/books";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const filteredBooks = books.filter((book) => {
    const q = search.toLowerCase();
    return (
      book.title?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      book.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
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
