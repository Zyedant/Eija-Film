import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserIdFromToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const tokenFromCookie = req.cookies.token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.id || null;
  } catch (error) {
    console.error('Token expired or invalid', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You need to be logged in to perform this action.',
      });
    }

    if (req.method === 'GET') {
      const castings = await prisma.casting.findMany();
      return res.status(200).json(castings);
    }

    if (req.method === 'POST') {
      const { realName, photoUrl, stageName } = req.body;

      if (!realName || !photoUrl || !stageName) {
        return res.status(400).json({ error: 'Real Name and Photo URL are required' });
      }

      const newCasting = await prisma.casting.create({
        data: {
          realName,
          photoUrl,
          stageName,
        },
      });

      return res.status(201).json(newCasting);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling API request:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  }
}
