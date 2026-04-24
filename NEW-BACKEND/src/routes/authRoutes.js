import express from "express";
import { register, verifyOtp, login, logout, refreshToken, forgotPassword, resetPassword } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/inputValidator.js";

const authRoutes = express.Router();

authRoutes.post("/register", validateRegister, register);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/login", validateLogin, login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);

export default authRoutes;
