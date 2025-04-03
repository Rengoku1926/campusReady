import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user';

const router = express.Router();

interface AuthRequestBody {
  email: string;
  password: string;
}

// Register a new user
router.post('/register', async (req: Request, res: Response) : Promise<void> =>  {
    try {
      const { name, email, password }: { name: string; email: string; password: string } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return 
      }
  
      // Create new user
      const user = await User.create({ name, email, password });
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );
  
      res.status(201).json({ token, user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
  });
  

// Login user
router.post('/login', async (req: Request, res: Response) : Promise<void> =>  {
  try {
    const { email, password }: AuthRequestBody = req.body;
    
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return 
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return 
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
