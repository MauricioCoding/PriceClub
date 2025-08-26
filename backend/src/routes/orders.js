import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";


const router = express.Router();

router.use(express.json({ type: ["application/json", "application/*+json"] }));

router.post("/echo", (req, res) => {
  console.log("ECHO headers CT:", req.headers["content-type"]);
  console.log("ECHO body:", req.body);
  res.json({ seen: req.body, ct: req.headers["content-type"] });
});

// Load secret from environment
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  console.error("❌ JWT_SECRET is missing from environment!");
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    console.log("Decoded token:", user);
    next();
  });
}

// GET /orders/my - orders for current user
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT o.id AS order_id, o.order_date, o.total,
              json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price)) AS items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.id ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/checkout", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    // Helpful debug
  console.log("CT:", req.headers["content-type"]);
  console.log("REQ BODY:", JSON.stringify(req.body));

    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items must be a non-empty array" });
    }

    // Normalize to numbers (handles "1" -> 1)
    const norm = items.map((it) => ({
      product_id: Number(it?.product_id),
      quantity: Number(it?.quantity),
    }));

    // Validate after normalization
    for (const it of norm) {
      if (!Number.isInteger(it.product_id) || it.product_id <= 0) {
        return res.status(400).json({ error: `Invalid product_id: ${it.product_id}` });
      }
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
        return res.status(400).json({ error: `Invalid quantity for product ${it.product_id}: ${it.quantity}` });
      }
    }

    const userId = req.user.id;

    // Membership check (kept)
    const { rows: urows } = await client.query(
      "SELECT membership_status, membership_expiration FROM users WHERE id = $1",
      [userId]
    );
    const user = urows[0];
    if (
      !user ||
      user.membership_status !== "active" ||
      new Date(user.membership_expiration) < new Date()
    ) {
      return res.status(403).json({ error: "Membership expired or user not found" });
    }

    await client.query("BEGIN");

    // Bulk load products (price + stock)
    const ids = norm.map((i) => i.product_id);
    const { rows: prows } = await client.query(
      `SELECT id, price, stock FROM products WHERE id = ANY($1::int[]) FOR UPDATE`,
      [ids]
    );
    const map = new Map(prows.map((p) => [p.id, { price: Number(p.price), stock: Number(p.stock) }]));

    // Existence + stock
    for (const it of norm) {
      const p = map.get(it.product_id);
      if (!p) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Product ${it.product_id} not found` });
      }
      if (it.quantity > p.stock) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Not enough stock for product ${it.product_id}` });
      }
    }

    // Compute total
    const total = norm.reduce((acc, it) => acc + map.get(it.product_id).price * it.quantity, 0);

    // Create order
    const { rows: orows } = await client.query(
      "INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id, order_date",
      [userId, total]
    );
    const orderId = orows[0].id;
    const orderDate = orows[0].order_date;

    // Insert order_items (multi-values)
    const values = [];
    const params = [];
    let i = 1;
    for (const it of norm) {
      values.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
      const { price } = map.get(it.product_id);
      params.push(orderId, it.product_id, it.quantity, price);
    }
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${values.join(",")}`,
      params
    );

    // Decrement stock
    for (const it of norm) {
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [it.quantity, it.product_id]);
    }

    await client.query("COMMIT");
    return res.status(201).json({ order_id: orderId, total, order_date: orderDate });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});


export default router;
