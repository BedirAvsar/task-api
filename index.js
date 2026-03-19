const express = require("express");
const { randomUUID } = require("crypto");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   * @param {unknown} [details]
   */
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

// PostgreSQL connection pool (default: local taskdb)
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : { database: "taskdb" }
);

pool.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Unexpected PostgreSQL client error", err);
});

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
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

app.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    // As requested: SELECT * FROM tasks
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

    // As requested: INSERT INTO tasks
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
    // As requested: DELETE FROM tasks WHERE id = $1
    const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    if (result.rowCount === 0) throw new HttpError(404, "Task bulunamadı.");
    res.json({ message: "deleted" });
  })
);

app.use((req, res, next) => {
  next(new HttpError(404, "Route bulunamadı."));
});

app.use((err, req, res, next) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message =
    err instanceof HttpError ? err.message : "Beklenmeyen bir hata oluştu.";

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      ...(err instanceof HttpError && err.details !== undefined
        ? { details: err.details }
        : null),
    },
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`${signal} received, shutting down...`);
  pool.end().finally(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));