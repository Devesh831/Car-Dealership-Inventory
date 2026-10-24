import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../@types/express';

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Registers a new user. Optionally assigns admin role if valid adminCode provided.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role, adminCode } = req.body;
    // Read admin code dynamically to support test environment overrides
    const ADMIN_CODE = process.env.ADMIN_REGISTRATION_CODE || 'ADMIN_SECRET_2024';

    // Check for duplicate username
    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      res.status(409).json({
        success: false,
        message: 'Username already taken',
      });
      return;
    }

    // Check for duplicate email
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Validate admin code if requesting admin registration
    const assignedRole =
      role === 'admin' && adminCode === ADMIN_CODE ? 'admin' : 'user';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    // Generate JWT
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as 'user' | 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'user' | 'admin',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  try {
    const userProfile = await UserModel.findById(user.id);
    if (!userProfile) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user: userProfile },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
};
