const router = require("express").Router();
const Request = require("../models/requestsModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Student places a book request
router.post("/add-request", authMiddleware, async (req, res) => {
  try {
    const { book, note } = req.body;
    const userId = req.body.userIdFromToken;

    // Check no duplicate pending request
    const existing = await Request.findOne({ book, user: userId, status: "pending" });
    if (existing) {
      return res.send({ success: false, message: "You already have a pending request for this book" });
    }

    const request = await Request.create({ book, user: userId, note });
    return res.send({ success: true, message: "Book request submitted", data: request });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// Get requests — admin gets all, student gets their own
router.get("/get-requests", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userIdFromToken;
    const User = require("../models/usersModel");
    const currentUser = await User.findById(userId);

    const filter = currentUser.role === "student" ? { user: userId } : {};
    const requests = await Request.find(filter)
      .populate("book")
      .populate("user", "name email rollNumber")
      .sort({ createdAt: -1 });

    return res.send({ success: true, data: requests });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// Admin updates request status (fulfilled / rejected)
router.post("/update-request-status", authMiddleware, async (req, res) => {
  try {
    const { requestId, status } = req.body;
    await Request.findByIdAndUpdate(requestId, { status });
    return res.send({ success: true, message: `Request marked as ${status}` });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// Student cancels their request
router.post("/delete-request", authMiddleware, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.body.requestId);
    return res.send({ success: true, message: "Request cancelled" });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

module.exports = router;
