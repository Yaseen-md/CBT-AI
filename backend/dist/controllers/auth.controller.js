import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
const signToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(payload, secret, { expiresIn });
};
const setCookieToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
// POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Check existing user
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            throw createError('Email already in use', 409);
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const result = await query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin, country, has_consented, created_at', [name, email, passwordHash]);
        const user = result.rows[0];
        const token = signToken({ id: user.id, email: user.email, name: user.name, is_admin: user.is_admin, country: user.country, has_consented: user.has_consented });
        setCookieToken(res, token);
        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin, country: user.country, has_consented: user.has_consented, createdAt: user.created_at },
        });
    }
    catch (err) {
        next(err);
    }
};
// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await query('SELECT id, name, email, password_hash, is_admin, country, has_consented FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw createError('Invalid email or password', 401);
        }
        const token = signToken({ id: user.id, email: user.email, name: user.name, is_admin: user.is_admin, country: user.country, has_consented: user.has_consented });
        setCookieToken(res, token);
        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin, country: user.country, has_consented: user.has_consented },
        });
    }
    catch (err) {
        next(err);
    }
};
// POST /api/auth/logout
export const logout = (_req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};
// GET /api/auth/me
export const getMe = async (req, res, next) => {
    try {
        const result = await query('SELECT id, name, email, is_admin, country, has_consented, created_at FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        if (!user)
            throw createError('User not found', 404);
        res.json({ success: true, user });
    }
    catch (err) {
        next(err);
    }
};
// POST /api/auth/consent
export const provideConsent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Update user's consent in DB
        const result = await query('UPDATE users SET has_consented = true, updated_at = NOW() WHERE id = $1 RETURNING id, name, email, is_admin, country, has_consented', [userId]);
        const user = result.rows[0];
        if (!user)
            throw createError('User not found', 404);
        // Issue a new token with has_consented = true
        const token = signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            is_admin: user.is_admin,
            country: user.country,
            has_consented: user.has_consented
        });
        setCookieToken(res, token);
        res.json({
            success: true,
            user,
            token
        });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=auth.controller.js.map