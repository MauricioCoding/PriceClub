import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as users from "../repos/user.repo.js";

const SECRET = process.env.JWT_SECRET;

function httpError(message, statusCode = 400) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

export async function signup({ name, email, password }) {
  if (!SECRET) throw httpError("Server misconfigured: missing JWT secret", 500);
  if (!name || !email || !password) throw httpError("Missing fields: name, email, password");

  // Optional: check if user exists
  const existing = await users.findByEmail(email);
  if (existing) throw httpError("Email already registered", 409);

  const hashed = await bcrypt.hash(password, 10);

  const created = await users.create({
    name,
    email,
    passwordHash: hashed,
    membershipStatus: "active",
    membershipExpiration: "2025-12-31", // keep your original default
  });

  // Return safe fields only
  return { id: created.id, name: created.name, email: created.email };
}

export async function login({ email, password }) {
  if (!SECRET) throw httpError("Server misconfigured: missing JWT secret", 500);
  if (!email || !password) throw httpError("Missing email or password");

  const user = await users.findByEmail(email);
  if (!user) throw httpError("User not found", 404);

  // ✅ Compare plain password against the STORED hash (do NOT re-hash the stored hash)
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

  return {
    token,
    user: { id: user.id, name: user.name, membership_status: user.membership_status },
  };
}
