import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { usersCollection } from '../config/db.js';
import { Role } from '../../src/types/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'mediconnect-ai-super-secret-key-prod-college-2026';
export const TOKEN_EXPIRY = '7d';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: Role };
    const user = await usersCollection.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Account has been suspended by administration.' });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};

export const requireRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Action requires role: ${roles.join(' or ')}. Your role is: ${req.user.role}`,
      });
    }

    next();
  };
};
