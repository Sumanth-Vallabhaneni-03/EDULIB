const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      default: null,
      // unique among non-null values only — handled via sparse index
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "student", // student, admin, librarian
    },
    status: {
      type: String,
      required: true,
      default: "pending", // active, inactive or pending
    },
  },
  { timestamps: true }
);

// Sparse unique index on rollNumber — allows multiple null values
// (non-students won't have a roll number) but enforces uniqueness
// among students who do have one.
userSchema.index({ rollNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("users", userSchema);
