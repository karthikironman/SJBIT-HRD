import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/userController.js";
import { validateUser } from "../middlewares/inputValidator.js";

const userRoutes = express.Router();

userRoutes.post("/user",validateUser, createUser);
userRoutes.get("/user", getAllUsers);
userRoutes.get("/user/:id", getUserById);
userRoutes.put("/user/:id", validateUser, updateUser);
userRoutes.delete("/user/:id", deleteUser);

export default userRoutes;