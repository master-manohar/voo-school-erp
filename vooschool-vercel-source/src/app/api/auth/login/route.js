import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-voo-key';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, password } = body; // For phase 1, we might use password instead of OTP, or mock OTP.

    // Let's implement a simple phone + password login for Phase 1.
    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    // Query the database
    const users = await query('SELECT * FROM users WHERE phone = ?', [phone]);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info (excluding password hash)
    const { password_hash, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, token }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
