const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const register = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return next(createHttpError(400, "email ve password gerekli"));
    }

    email = String(email).toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(String(password), 10);

    const result = await pool.query(
      "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email",
      [randomUUID(), email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = String(email || "").toLowerCase().trim();
    password = String(password || "");

    if (!email || !password) {
      return next(createHttpError(400, "email ve password gerekli"));
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return next(createHttpError(401, "Gecersiz email veya password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError(401, "Gecersiz email veya password"));
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
