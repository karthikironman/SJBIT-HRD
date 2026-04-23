import express from "express";
import {
    getAllUsersAdmin,
    getPendingApprovals,
    getStudentSubtabData,
    approveSubtab,
    rejectSubtab,
    updateUserRole,
    createBulkFPCs,
    deleteUser,
    updateFpcDepartments,
    searchStudents
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const adminRoutes = express.Router();

const requireAdminOrSuperUser = (req, res, next) => {
    if (!['ADMIN', 'SUPER_USER'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

const requireStaffOrAdmin = (req, res, next) => {
    if (!['ADMIN', 'SUPER_USER', 'FPC', 'SPC'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied. Staff only." });
    }
    next();
};

const requireAdminSuperUserFpc = (req, res, next) => {
    if (!['ADMIN', 'SUPER_USER', 'FPC'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied." });
    }
    next();
};

adminRoutes.get("/search", authMiddleware, requireStaffOrAdmin, searchStudents);
adminRoutes.get("/users", authMiddleware, requireAdminSuperUserFpc, getAllUsersAdmin);
adminRoutes.get("/pending-approvals", authMiddleware, requireStaffOrAdmin, getPendingApprovals);
adminRoutes.get("/student-data/:userId/:subtabKey", authMiddleware, requireStaffOrAdmin, getStudentSubtabData);
adminRoutes.post("/approve/:userId/:subtabKey", authMiddleware, requireStaffOrAdmin, approveSubtab);
adminRoutes.post("/reject/:userId/:subtabKey", authMiddleware, requireStaffOrAdmin, rejectSubtab);
adminRoutes.patch("/users/:id/role", authMiddleware, requireAdminOrSuperUser, updateUserRole);
adminRoutes.patch("/users/:id/fpc-departments", authMiddleware, requireAdminOrSuperUser, updateFpcDepartments);
adminRoutes.post("/users/bulk-fpcs", authMiddleware, requireAdminOrSuperUser, createBulkFPCs);
adminRoutes.delete("/users/:id", authMiddleware, requireAdminOrSuperUser, deleteUser);

export default adminRoutes;
