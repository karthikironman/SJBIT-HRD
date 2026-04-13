import pool from "../config/db.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({ status, message, data });
};

export const getAllUsersAdmin = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
        );
        handleResponse(res, 200, "Users fetched successfully", result.rows);
    } catch (err) {
        next(err);
    }
};
