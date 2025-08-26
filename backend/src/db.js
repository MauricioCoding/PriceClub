import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const { DATABASE_URL, NODE_ENV } = process.env;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
