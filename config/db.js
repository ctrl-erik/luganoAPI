// config/db.js
import 'dotenv/config';
import pg from 'pg'
const { Client } = pg

const db = new Client({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'luganodb',
});

try {
  await db.connect();
  console.log("Connected to psql luganodb");
} catch (err) {
  console.error("Database connection error:", err);
}

export default db;