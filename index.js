const express = require("express");
const { randomUUID } = require("crypto");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

// PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/taskdb",
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error", err);
});

function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

function normalizeTitle(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  };
}

// ROUTES
app.get("/", (req, res) => {
  res.send("API OK");
});

app.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(result.rows.map(rowToTask));
  })
);

app.post(
  "/tasks",
  asyncHandler(async (req, res) => {
    const title = normalizeTitle(req.body?.title);
    if (!title) throw new HttpError(400, "`title` boş olamaz.");

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const result = await pool.query(
      "INSERT INTO tasks (id, title, created_at) VALUES ($1, $2, $3) RETURNING *",
      [id, title, createdAt]
    );

    res.status(201).json(rowToTask(result.rows[0]));
  })
);

app.delete(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0)
      throw new HttpError(404, "Task bulunamadı.");

    res.json({ message: "deleted" });
  })
);

// AUTH ROUTES
app.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, "email ve password gerekli");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = randomUUID();

    const result = await pool.query(
      "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email",
      [id, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  })
);

app.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      throw new HttpError(401, "Geçersiz email veya password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpError(401, "Geçersiz email veya password");
    }

    const token = jwt.sign(
      { userId: user.id },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ token });
  })
);

// 404 handler
app.use((req, res, next) => {
  next(new HttpError(404, "Route bulunamadı."));
});

// error handler
app.use((err, req, res, next) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message =
    err instanceof HttpError
      ? err.message
      : "Beklenmeyen bir hata oluştu.";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      ...(err instanceof HttpError && err.details !== undefined
        ? { details: err.details }
        : {}),
    },
  });
});

// graceful shutdown
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  pool.end().finally(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});