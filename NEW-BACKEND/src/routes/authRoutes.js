import express from "express";
import { register, login, logout, refreshToken } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/inputValidator.js";

const authRoutes = express.Router();

authRoutes.post("/register", validateRegister, register);
authRoutes.post("/login", validateLogin, login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh", refreshToken);

export default authRoutes;
