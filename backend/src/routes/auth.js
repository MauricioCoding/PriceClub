import 'dotenv/config';
import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = process.env.JWT_SECRET; // replace with env var in production

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, membership_status, membership_expiration) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email",
      [name, email, hashed, "active", "2025-12-31"]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("🔹 /login hit");
  console.log("Body:", req.body);

  try {
    const { email, password } = req.body;

    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log("User query result:", userRes.rows);

    if (userRes.rows.length === 0) {
      console.log("❌ User not found");
      return res.status(400).json({ error: "User not found" });
    }

    const user = userRes.rows[0];
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const match = await bcrypt.compare(password, hashedPassword);
    console.log("Password match:", match);

    if (!match) {
      console.log("❌ Invalid password");
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, membership_status: user.membership_status },
      SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful");
    res.json({ token, user: { id: user.id, name: user.name, membership_status: user.membership_status } });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
