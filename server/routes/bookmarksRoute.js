const router = require("express").Router();
const Bookmark = require("../models/bookmarksModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Toggle bookmark (add if missing, remove if exists)
router.post("/toggle-bookmark", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userIdFromToken;
    const { bookId } = req.body;

    const existing = await Bookmark.findOne({ user: userId, book: bookId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.send({ success: true, bookmarked: false, message: "Bookmark removed" });
    }

    await Bookmark.create({ user: userId, book: bookId });
    return res.send({ success: true, bookmarked: true, message: "Book bookmarked" });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// Get all bookmarks for logged-in user
router.get("/get-bookmarks", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userIdFromToken;
    const bookmarks = await Bookmark.find({ user: userId }).populate("book");
    return res.send({ success: true, data: bookmarks });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// Get bookmark status for a specific book
router.get("/is-bookmarked/:bookId", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userIdFromToken;
    const existing = await Bookmark.findOne({ user: userId, book: req.params.bookId });
    return res.send({ success: true, bookmarked: !!existing });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

module.exports = router;
