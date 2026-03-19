const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  deleteTask,
} = require("../controllers/taskController");

router.get("/tasks", authMiddleware, getTasks);
router.post("/tasks", authMiddleware, createTask);
router.delete("/tasks/:id", authMiddleware, deleteTask);

module.exports = router;