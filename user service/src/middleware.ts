import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { IUser, User } from './model.js';

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;

        if (!decoded || !decoded.id) {
            res.status(401).json({
                message: "Invalid token"
            });
            return;
        }

        const userId = decoded.id;
        const user = await User.findById(userId).select('+password');

        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized"
        });
    }
};