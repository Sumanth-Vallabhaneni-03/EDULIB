const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

// register a new user
router.post("/register", async (req, res) => {
  try {
    // check if email already exists
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.send({ success: false, message: "Email already exists" });
    }

    // check if roll number already exists (students only)
    if (req.body.rollNumber) {
      const existingRoll = await User.findOne({ rollNumber: req.body.rollNumber });
      if (existingRoll) {
        return res.send({ success: false, message: "Roll number already registered" });
      }
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // if no rollNumber provided, explicitly set to null (for sparse index)
    if (!req.body.rollNumber) req.body.rollNumber = null;

    const newUser = new User(req.body);
    await newUser.save();
    return res.send({
      success: true,
      message: "Account created successfully. Please login.",
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// login a user (accepts email OR roll number)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // find user by email or roll number
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { rollNumber: identifier },
      ],
    });

    if (!user) {
      return res.send({
        success: false,
        message: "No account found with that email or roll number",
      });
    }

    // check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.send({ success: false, message: "Invalid password" });
    }

    // sign token
    const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, {
      expiresIn: "1d",
    });
    return res.send({ success: true, message: "Login successful", data: token });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

// get logged in user details
router.get("/get-logged-in-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userIdFromToken);
    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist",
      });
    }
    return res.send({
      success: true,
      message: "User details fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
});

// get all the users (students)
router.get("/get-all-users/:role", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).sort({
      createdAt: -1,
    });
    return res.send({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
});

// get user by id
router.get("/get-user-by-id/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist",
      });
    }
    return res.send({
      success: true,
      message: "User fetched successfully",
      data: user,
    });

  } catch (error) {
    return res.send({
      success: false,
      message: 'User does not exist',
    });
  }
});

// ── BULK IMPORT STUDENTS ──────────────────────────────────
// Accepts: { students: [ { name, email, phone, rollNumber, password } ] }
// Returns: { imported: [], skipped: [] }
router.post("/bulk-import", authMiddleware, async (req, res) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.send({ success: false, message: "No student data provided" });
    }

    const imported = [];
    const skipped  = [];

    for (const student of students) {
      const { name, email, phone, rollNumber, password } = student;

      // Basic validation
      if (!name || !email || !phone || !password) {
        skipped.push({ ...student, reason: "Missing required fields (name, email, phone, password)" });
        continue;
      }

      // Email duplicate check
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        skipped.push({ ...student, reason: `Email already registered: ${email}` });
        continue;
      }

      // Roll number duplicate check
      if (rollNumber) {
        const rollExists = await User.findOne({ rollNumber });
        if (rollExists) {
          skipped.push({ ...student, reason: `Roll number already registered: ${rollNumber}` });
          continue;
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.create({
        name,
        email,
        phone,
        rollNumber: rollNumber || null,
        password: hashedPassword,
        role: "student",
        status: "active",
      });

      imported.push({ name, email, rollNumber: rollNumber || "—" });
    }

    return res.send({
      success: true,
      message: `Import complete: ${imported.length} imported, ${skipped.length} skipped`,
      data: { imported, skipped },
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

module.exports = router;
