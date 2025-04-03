import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

interface ProfileRequestBody {
  name: string;
  email: string;
}

interface PasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email }: ProfileRequestBody = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (email !== req.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
    }

    const updatedUser = await User.updateProfile(req.user.id, { name, email });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword }: PasswordRequestBody = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findByEmail(req.user.email);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    await User.updatePassword(req.user.id, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// You'll also need to export your auth middleware if it is used in the above routes.
function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export default router;
