const router = require("express").Router();
const Issue = require("../models/issuesModel");
const Book = require("../models/booksModel");
const authMiddleware = require("../middlewares/authMiddleware");

// issue a book to student
router.post("/issue-new-book", authMiddleware, async (req, res) => {
  try {
    // inventory adjustment (available copies must be decremented by 1)
    await Book.findOneAndUpdate(
      { _id: req.body.book },
      { $inc: { availableCopies: -1 } }
    );

    // issue book to student (create new issue record)
    const newIssue = new Issue(req.body);
    await newIssue.save();
    return res.send({
      success: true,
      message: "Book issued successfully",
      data: newIssue,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
});

// get issues
router.post("/get-issues", authMiddleware, async (req, res) => {
  try {
    delete req.body.userIdFromToken;
    const issues = await Issue.find(req.body).populate("book").populate("user").sort({ issueDate: -1 });
    return res.send({
      success: true,
      message: "Issues fetched successfully",
      data: issues,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
});

// return a book
const FINE_PER_DAY = 5; // ₹ per day overdue — must match frontend constant

router.post("/return-book", authMiddleware, async (req, res) => {
  try {
    // Fetch the original issue to get the due date
    const issue = await Issue.findById(req.body._id);
    if (!issue) {
      return res.send({ success: false, message: "Issue record not found" });
    }

    // Recalculate fine independently on the server
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(issue.returnDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    const fine = daysOverdue > 0 ? daysOverdue * FINE_PER_DAY : 0;

    // Increment available copies
    await Book.findOneAndUpdate(
      { _id: req.body.book },
      { $inc: { availableCopies: 1 } }
    );

    // Update issue record with server-calculated fine
    await Issue.findOneAndUpdate(
      { _id: req.body._id },
      {
        returnedDate: new Date(),
        fine,
        status: "returned",
      }
    );

    return res.send({
      success: true,
      message: fine > 0
        ? `Book returned. Fine applied: ₹${fine} (${daysOverdue} day(s) overdue)`
        : "Book returned successfully. No fine.",
      data: { fine, daysOverdue },
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// delete an issue
router.post("/delete-issue", authMiddleware, async (req, res) => {
  try {
    // inventory adjustment (available copies must be incremented by 1)
    await Book.findOneAndUpdate(
      { _id: req.body.book },
      { $inc: { availableCopies: 1 } }
    );

    // delete issue
    await Issue.findOneAndDelete({ _id: req.body._id });
    res.send({ success: true, message: "Issue deleted successfully" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

// edit an issue
router.post("/edit-issue", authMiddleware, async (req, res) => {
  try {
    await Issue.findOneAndUpdate({
      _id: req.body._id,
    }, req.body);
    res.send({ success: true, message: "Issue updated successfully" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

module.exports = router;
