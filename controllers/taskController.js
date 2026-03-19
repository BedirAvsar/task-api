const pool = require("../db");
const { randomUUID } = require("crypto");

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// GET /tasks
const getTasks = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// POST /tasks
const createTask = async (req, res, next) => {
  try {
    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title) return next(createHttpError(400, "`title` bos olamaz."));

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const result = await pool.query(
      "INSERT INTO tasks (id, title, created_at, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, title, createdAt, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );

    if (result.rowCount === 0) {
      return next(createHttpError(404, "Task bulunamadi"));
    }

    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  createTask,
  deleteTask,
};