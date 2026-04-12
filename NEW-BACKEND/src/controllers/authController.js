import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'STUDENT') RETURNING id, email, role, created_at",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // Check if account is active
    if (!user.is_active && user.role !== 'ADMIN' && user.role !== 'SUPER_USER') {
        // As per typical systems, maybe we let them login but prompt verification?
        // Let's just allow login for now, we have email_verified field to restrict access to specific routes later.
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to database
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
      [user.id, refreshToken]
    );

    res.json({
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Check if token exists in DB
    const tokenResult = await pool.query("SELECT * FROM refresh_tokens WHERE token = $1", [refreshToken]);
    if (tokenResult.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Verify token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Look up user to ensure they still exist
      const userResult = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [decoded.id]);
      if (userResult.rows.length === 0) {
        return res.status(403).json({ message: "User not found" });
      }
      
      const user = userResult.rows[0];
      const newTokens = generateTokens(user);

      // Rotate the refresh token in the database
      await pool.query(
        "UPDATE refresh_tokens SET token = $1 WHERE token = $2",
        [newTokens.refreshToken, refreshToken]
      );

      res.json({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      });
    } catch (err) {
      // Token expired or invalid
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
      return res.status(403).json({ message: "Refresh token expired or invalid" });
    }
  } catch (error) {
    next(error);
  }
};
