//Standardized response function

import { createUserService, deleteUserService, getAllUsersService, updateUserService } from "../models/userModel.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    })
}

export const createUser = async (req , res, next) => {
    const {name, email} = req.body;
    try{
        const newUser = await createUserService(name, email);
        handleResponse(res, 201, "User created successfully", newUser);
    }catch(err){
        next(err)
    }
}

export const getAllUsers = async (req , res, next) => {
    try{
        const users = await getAllUsersService();
        handleResponse(res, 200, "User fetched successfully", users);
    }catch(err){
        next(err)
    }
}

export const getUserById = async (req , res, next) => {
    try{
        const user = await getUserById(req.params.id);
        if(!user) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User fetched successfully", user);
    }catch(err){
        next(err)
    }
}

export const updateUser = async (req , res, next) => {
    const {name, email} = req.body;
    try{
        const updatedUser = await updateUserService(req.params.id, name, email);
        if(!updatedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User updated successfully", updatedUser);
    }catch(err){
        next(err)
    }
}

export const deleteUser = async (req , res, next) => {
    const {name, email} = req.body;
    try{
        const deletedUser = await deleteUserService(req.params.id, name, email);
        if(!deletedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User deleted successfully", deletedUser);
    }catch(err){
        next(err)
    }
}