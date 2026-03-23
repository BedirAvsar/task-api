const taskSchemaModule = require("../validation/taskSchema");
const createTaskSchema =
  taskSchemaModule.createTaskSchema ||
  taskSchemaModule.default?.createTaskSchema ||
  taskSchemaModule.default ||
  taskSchemaModule;

const pool = require("../db");
const { randomUUID } = require("crypto");

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function getUserId(req) {
  return req.user?.userId || req.userId;
}

function sendSuccess(res, data) {
  return res.json({ data, error: null });
}

function sendError(res, status, message) {
  return res.status(status).json({
    data: null,
    error: { message },
  });
}

function parsePageLimit(pageRaw, limitRaw) {
  let page = Number(pageRaw);
  let limit = Number(limitRaw);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 10;

  // Basic safety cap (optional but practical)
  limit = Math.min(limit, 100);
  return { page, limit };
}

function parseCompleted(value) {
  if (value === undefined) return undefined;

  if (typeof value === "boolean") return value;
  const s = String(value).toLowerCase().trim();

  if (["true", "1"].includes(s)) return true;
  if (["false", "0"].includes(s)) return false;

  return undefined;
}

function normalizeSearch(value) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;
  const s = value.trim();
  return s ? s : undefined;
}

// GET /tasks
const getTasks = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "Token gerekli veya gecersiz.");

    const { page, limit } = parsePageLimit(req.query.page, req.query.limit);
    const offset = (page - 1) * limit;

    const completedRaw = req.query.completed;
    const completed =
      completedRaw !== undefined ? parseCompleted(completedRaw) : undefined;
    if (completedRaw !== undefined && completed === undefined) {
      return sendError(res, 400, "`completed` true/false olmalidir.");
    }
    const search = normalizeSearch(req.query.search);

    const where = ["user_id = $1"];
    const params = [userId];

    // Filtering (optional)
    if (completed !== undefined) {
      where.push(`completed = $${params.length + 1}`);
      params.push(completed);
    }

    if (search) {
      where.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const baseSelect = `SELECT * FROM tasks ${whereSql} ORDER BY created_at DESC`;

    const limitIndex = params.length + 1;
    const offsetIndex = params.length + 2;

    const result = await pool.query(
      `${baseSelect} LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      [...params, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM tasks ${whereSql}`,
      params
    );

    return res.json({
      data: result.rows,
      meta: {
        page,
        limit,
        total: countResult.rows[0]?.total ?? 0,
      },
      error: null,
    });
  } catch (err) {
    if (res.headersSent) return next(err);
    return sendError(
      res,
      err?.status || 500,
      err?.message || "Beklenmeyen bir hata olustu."
    );
  }
};

// POST /tasks
const createTask = async (req, res, next) => {
  try {
    if (!createTaskSchema || typeof createTaskSchema.safeParse !== "function") {
      return sendError(res, 500, "Task schema yuklenemedi veya gecersiz.");
    }

    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      const issues = parsed.error?.issues || parsed.error?.errors || [];
      const firstMessage = issues[0]?.message || "Gecersiz veri.";
      return sendError(res, 400, firstMessage);
    }

    const { title } = parsed.data;

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "Token gerekli veya gecersiz.");

    const result = await pool.query(
      "INSERT INTO tasks (id, title, created_at, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, title, createdAt, userId]
    );

    return res.status(201).json({ data: result.rows[0], error: null });
  } catch (err) {
    if (res.headersSent) return next(err);
    return sendError(
      res,
      err?.status || 500,
      err?.message || "Beklenmeyen bir hata olustu."
    );
  }
};

// PUT /tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";

    if (!title) {
      return sendError(res, 400, "`title` bos olamaz.");
    }

    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "Token gerekli veya gecersiz.");

    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [title, req.params.id, userId]
    );

    if (result.rowCount === 0) {
      return sendError(res, 404, "Task bulunamadi");
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    if (res.headersSent) return next(err);
    return sendError(
      res,
      err?.status || 500,
      err?.message || "Beklenmeyen bir hata olustu."
    );
  }
};

// DELETE /tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "Token gerekli veya gecersiz.");

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, userId]
    );

    if (result.rowCount === 0) {
      return sendError(res, 404, "Task bulunamadi");
    }

    return sendSuccess(res, { message: "deleted" });
  } catch (err) {
    if (res.headersSent) return next(err);
    return sendError(
      res,
      err?.status || 500,
      err?.message || "Beklenmeyen bir hata olustu."
    );
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};