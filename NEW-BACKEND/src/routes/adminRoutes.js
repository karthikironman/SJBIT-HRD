import express from "express";
import { getAllUsersAdmin } from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const adminRoutes = express.Router();

const requireAdminOrSuperUser = (req, res, next) => {
    if (!['ADMIN', 'SUPER_USER'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

adminRoutes.get("/users", authMiddleware, requireAdminOrSuperUser, getAllUsersAdmin);

export default adminRoutes;
