import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'USER',
          isActive: true,
        },
      });

      return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error("Error during registration:", error);
      return res.status(500).json({ message: 'Something went wrong', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}
