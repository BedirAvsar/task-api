const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL || "postgresql://localhost:5432/taskdb";

  const isLocalConnection =
  /localhost|127\.0\.0\.1|postgres/.test(connectionString) ||
  process.env.NODE_ENV === "test";

const pool = new Pool({
  connectionString,
  // Render/managed DB often requires SSL, local & CI postgres usually does not.
  ssl: isLocalConnection ? false : { rejectUnauthorized: false },
});

module.exports = pool;