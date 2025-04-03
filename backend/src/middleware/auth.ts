import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return void res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return void res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
