import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const userResult = await pool.query("SELECT id, email, role, is_active FROM users WHERE id = $1", [decoded.id]);
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "User not found. Authorization denied." });
      }

      const user = userResult.rows[0];

      if (!user.is_active) {
         return res.status(403).json({ message: "Account is disabled." });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Token failed. Authorization denied." });
    }
  } else {
    return res.status(401).json({ message: "No token provided. Authorization denied." });
  }
};
