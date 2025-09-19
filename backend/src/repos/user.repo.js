import pool from "../db.js";

export async function findByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
}

export async function create({ name, email, passwordHash, membershipStatus, membershipExpiration }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, membership_status, membership_expiration)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, membership_status, membership_expiration`,
    [name, email, passwordHash, membershipStatus, membershipExpiration]
  );
  return rows[0];
}
