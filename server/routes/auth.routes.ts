import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usersCollection } from '../config/db.js';
import { authenticate, AuthRequest, JWT_SECRET, TOKEN_EXPIRY } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Helper to set HTTP-only cookie
const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existing = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email address already exists.' });
    }

    const assignedRole = ['USER', 'PHARMACIST', 'DOCTOR', 'HOSPITAL_ADMIN'].includes(role)
      ? role
      : 'USER';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await usersCollection.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      password: hashedPassword,
      role: assignedRole,
      status: 'ACTIVE',
      allergies: [],
      currentMedications: [],
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    setAuthCookie(res, token);
    await logAudit(req, 'USER_REGISTER', 'USER', newUser._id, { role: newUser.role, email: newUser.email });

    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({
      message: 'Account created successfully.',
      user: userSafe,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'An unexpected error occurred during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Your account has been suspended by administration.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    setAuthCookie(res, token);
    await logAudit(req, 'USER_LOGIN', 'USER', user._id, { role: user.role, email: user.email });

    // If pharmacist, attach verificationStatus
    let verificationStatus = undefined;
    if (user.role === 'PHARMACIST') {
      const ph = await (await import('../config/db.js')).pharmacistsCollection.findOne({ userId: user._id });
      verificationStatus = ph?.verificationStatus || 'PENDING';
    }

    const { password: _, ...userSafe } = user;
    return res.json({
      message: 'Logged in successfully.',
      user: { ...userSafe, verificationStatus },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'An unexpected error occurred during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await usersCollection.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let verificationStatus = undefined;
    if (user.role === 'PHARMACIST') {
      const ph = await (await import('../config/db.js')).pharmacistsCollection.findOne({ userId: user._id });
      verificationStatus = ph?.verificationStatus || 'PENDING';
    }

    const { password: _, ...userSafe } = user;
    return res.json({ user: { ...userSafe, verificationStatus } });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve user profile.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req: AuthRequest, res) => {
  try {
    const googleEmail = req.body.email || 'alex.johnson@gmail.com';
    const googleName = req.body.name || 'Alex Johnson';

    let user = await usersCollection.findOne({ email: googleEmail.toLowerCase().trim() });
    if (!user) {
      user = await usersCollection.insertOne({
        name: googleName,
        email: googleEmail.toLowerCase().trim(),
        phone: '+1 (555) 234-5678',
        password: await bcrypt.hash('GoogleOAuthSecret123!', 10),
        role: 'USER',
        status: 'ACTIVE',
        allergies: [],
        currentMedications: [],
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    setAuthCookie(res, token);
    await logAudit(req, 'GOOGLE_LOGIN', 'USER', user._id, { role: user.role, email: user.email });

    const { password: _, ...userSafe } = user;
    return res.json({
      message: 'Google Sign In successful.',
      user: userSafe,
      token,
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return res.status(500).json({ message: 'Google Authentication failed.' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  res.clearCookie('token');
  await logAudit(req, 'USER_LOGOUT', 'USER', req.user?._id);
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
