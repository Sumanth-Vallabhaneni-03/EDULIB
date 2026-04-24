const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "books",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "pending", // pending | fulfilled | rejected
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("requests", requestSchema);
