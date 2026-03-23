const express = require("express");
require("dotenv").config();

const rateLimit = require("express-rate-limit");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: { message: "Too many requests, please try again later." },
  },
});

app.use(express.json());
app.use(limiter);

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API OK");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;