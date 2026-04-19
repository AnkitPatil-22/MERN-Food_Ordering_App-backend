import { Request, Response } from "express";
import * as UserService from "../services/MyUser.service";

const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const user = await UserService.getUserById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }

        res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const createCurrentUser = async (req: Request, res: Response) => {
    try {
        const { auth0Id } = req.body;

        const existingUser = await UserService.getUserByAuth0Id(auth0Id);
        if (existingUser) {
            return res.status(200).send();
        }

        const newUser = await UserService.createUser(req.body);
        res.status(201).json(newUser.toObject());
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating user" });
    }
};

const updateCurrentUser = async (req: Request, res: Response) => {
    try {
        const updatedUser = await UserService.updateUser(req.userId, req.body);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.send(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user" });
    }
};

export default {
    createCurrentUser,
    updateCurrentUser,
    getCurrentUser,
};
