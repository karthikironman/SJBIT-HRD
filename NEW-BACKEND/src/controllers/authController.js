import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const HARDCODED_OTP = '123456';
const OTP_EXPIRY_MINUTES = 10;

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const verifiedUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND email_verified = true",
      [email]
    );
    if (verifiedUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, role, email_verified)
       VALUES ($1, $2, 'STUDENT', false)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, updated_at = CURRENT_TIMESTAMP`,
      [email, hashedPassword]
    );

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await pool.query(
      `INSERT INTO email_otps (email, purpose, otp, expires_at)
       VALUES ($1, 'registration', $2, $3)
       ON CONFLICT (email, purpose) DO UPDATE SET otp = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      [email, HARDCODED_OTP, expiresAt]
    );

    res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpResult = await pool.query(
      "SELECT * FROM email_otps WHERE email = $1 AND purpose = 'registration'",
      [email]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "No OTP found for this email. Please register again." });
    }

    const record = otpResult.rows[0];

    if (new Date() > new Date(record.expires_at)) {
      await pool.query("DELETE FROM email_otps WHERE email = $1 AND purpose = 'registration'", [email]);
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    await pool.query(
      "UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP WHERE email = $1",
      [email]
    );
    await pool.query("DELETE FROM email_otps WHERE email = $1 AND purpose = 'registration'", [email]);

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
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

    if (!user.email_verified) {
      return res.status(403).json({ message: "Email not verified. Please complete OTP verification first." });
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

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND email_verified = true",
      [email]
    );
    if (userResult.rows.length === 0) {
      // Return generic message to avoid email enumeration
      return res.status(200).json({ message: "If that email is registered, an OTP has been sent." });
    }

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await pool.query(
      `INSERT INTO email_otps (email, purpose, otp, expires_at)
       VALUES ($1, 'password_reset', $2, $3)
       ON CONFLICT (email, purpose) DO UPDATE SET otp = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      [email, HARDCODED_OTP, expiresAt]
    );

    res.status(200).json({ message: "If that email is registered, an OTP has been sent." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpResult = await pool.query(
      "SELECT * FROM email_otps WHERE email = $1 AND purpose = 'password_reset'",
      [email]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    const record = otpResult.rows[0];

    if (new Date() > new Date(record.expires_at)) {
      await pool.query("DELETE FROM email_otps WHERE email = $1 AND purpose = 'password_reset'", [email]);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2",
      [hashedPassword, email]
    );
    await pool.query("DELETE FROM email_otps WHERE email = $1 AND purpose = 'password_reset'", [email]);

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};
