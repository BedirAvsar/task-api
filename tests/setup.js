const pool = require("../db");

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP,
      user_id UUID REFERENCES users(id)
    );
  `);
});

afterAll(async () => {
  await pool.end();
});