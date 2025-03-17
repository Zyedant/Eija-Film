import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(200).json({ message: 'If your email is in our system, you will receive a password reset link' });
    }

    const token = randomBytes(32).toString('hex');
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    });

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        isUsed: false,
        expiresAt
      }
    });

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: ${resetUrl}`,
      html: `
        <div>
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    return res.status(200).json({ message: 'If your email is in our system, you will receive a password reset link' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
}