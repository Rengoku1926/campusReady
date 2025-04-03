import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import authMiddleware from '../middleware/auth';
import User from '../models/user';

// Extend Express Request to include a user property
interface AuthRequest extends Request {
  user: {
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
interface AuthUser {
  id: number;
  email: string;
}

interface AuthUser {
    id: number;
    email: string;
  }

const router = express.Router();

router.get('/me', authMiddleware, async (req: Request & { user: AuthUser }, res: Response) => {
  // Now req.user is typed as AuthUser
  try {
    const user = await User.findById(req.user.id);
    // ...rest of the code
  } catch (error) {
    // ...
  }
});


const router = express.Router();

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email }: ProfileRequestBody = req.body;

    // Check if email already exists
    if (email !== req.user.email) {
      const existingUser = await User.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user profile
    const updatedUser = await User.updateProfile(req.user.id, { name, email });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword }: PasswordRequestBody = req.body;

    // Get user with password
    const user = await User.findByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await User.updatePassword(req.user.id, newPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
