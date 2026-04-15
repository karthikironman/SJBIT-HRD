import express from "express";
import {
    getAllUsersAdmin,
    getPendingApprovals,
    getStudentSubtabData,
    approveSubtab,
    rejectSubtab,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const adminRoutes = express.Router();

const requireAdminOrSuperUser = (req, res, next) => {
    if (!['ADMIN', 'SUPER_USER'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

adminRoutes.get("/users", authMiddleware, requireAdminOrSuperUser, getAllUsersAdmin);
adminRoutes.get("/pending-approvals", authMiddleware, getPendingApprovals);
adminRoutes.get("/student-data/:userId/:subtabKey", authMiddleware, getStudentSubtabData);
adminRoutes.post("/approve/:userId/:subtabKey", authMiddleware, approveSubtab);
adminRoutes.post("/reject/:userId/:subtabKey", authMiddleware, rejectSubtab);

export default adminRoutes;
