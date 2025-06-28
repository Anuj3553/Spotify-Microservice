import { Request, Response } from "express";
import TryCatch from "./TryCatch.js";
import { User } from "./model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./middleware.js";

export const registerUser = TryCatch(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email })

    if (user) {
        res.status(400).json({
            message: "User already exists"
        })
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user = await User.create({
        name,
        email,
        password: hashPassword
    });

    const token = jwt.sign(
        { id: user._id, email: user.email }, process.env.JWT_SEC as string, { expiresIn: "7d" }
    );

    res.status(201).json({
        message: "User registered successfully",
        user,
        token
    });
});

export const loginUser = TryCatch(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(400).json({
            message: "User does not exist"
        });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.status(400).json({
            message: "Invalid credentials"
        });
        return;
    }

    const token = jwt.sign(
        { id: user._id, email: user.email }, process.env.JWT_SEC as string, { expiresIn: "7d" }
    );

    res.status(200).json({
        message: "User logged in successfully",
        user,
        token
    });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
        res.status(404).json({
            message: "User not found"
        });
        return;
    }

    res.status(200).json({
        message: "User profile fetched successfully",
        user
    });
}); 