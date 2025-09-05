import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role = UserRole.USER
      }: RegisterRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required'
        });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({
          error: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          role,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
        }
      });

      // Generate JWT tokens
      const accessToken = AuthController.generateAccessToken(user.id, user.role);
      const refreshToken = AuthController.generateRefreshToken(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required'
        });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          isActive: true,
        }
      });

      if (!user) {
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      // Check if account is active
      if (!user.isActive) {
        res.status(403).json({
          error: 'Account is suspended'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      // Generate JWT tokens
      const accessToken = AuthController.generateAccessToken(user.id, user.role);
      const refreshToken = AuthController.generateRefreshToken(user.id);

      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Generate access token
  private static generateAccessToken(userId: number, role: UserRole): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    return jwt.sign(
      { userId, role },
      secret,
      { expiresIn: process.env.JWT_EXPIRE || '15m' } as jwt.SignOptions
    );
  }

  // Generate refresh token
  private static generateRefreshToken(userId: number): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' } as jwt.SignOptions
    );
  }

  // Refresh token
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          error: 'Refresh token is required'
        });
        return;
      }

      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, secret) as any;
      
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          role: true,
          isActive: true,
        }
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          error: 'Invalid refresh token'
        });
        return;
      }

      // Generate new access token
      const accessToken = AuthController.generateAccessToken(user.id, user.role);

      res.json({
        accessToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        error: 'Invalid refresh token'
      });
    }
  }

  // Logout (optional - mainly for clearing client-side tokens)
  static async logout(req: Request, res: Response): Promise<void> {
    res.json({
      message: 'Logged out successfully'
    });
  }

  // Get current user
  static async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
        }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
