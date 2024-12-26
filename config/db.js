// config/db.js
import 'dotenv/config';
import pg from 'pg'
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});


// Log successful connection
pool.on('connect', () => {
  console.log("Connected to psql luganodb: (" + pool.options.host + ")");
});

// Handle errors from the pool
pool.on('error', (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Export the pool object for use in models
export default pool;