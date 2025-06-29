import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config();

interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    playList: string[];
}

interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const { data } = await axios.get(`${process.env.USER_URL}/api/v1/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        req.user = data.user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
}

// Multer Setup
import multer from 'multer';

const storage = multer.memoryStorage();

const uploadFile = multer({ storage }).single('file');

export default uploadFile;