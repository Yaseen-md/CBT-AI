import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const signToken = (payload: { id: string; email: string; name: string }) => {
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

const setCookieToken = (res: Response, token: string) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        // Check existing user
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            throw createError('Email already in use', 409);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, passwordHash]
        );

        const user = result.rows[0];
        const token = signToken({ id: user.id, email: user.email, name: user.name });
        setCookieToken(res, token);

        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw createError('Invalid email or password', 401);
        }

        const token = signToken({ id: user.id, email: user.email, name: user.name });
        setCookieToken(res, token);

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/logout
export const logout = (_req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1',
            [req.user!.id]
        );
        const user = result.rows[0];
        if (!user) throw createError('User not found', 404);

        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};
