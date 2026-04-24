const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "books",
      required: true,
    },
  },
  { timestamps: true }
);

// One bookmark per user-book pair
bookmarkSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model("bookmarks", bookmarkSchema);
