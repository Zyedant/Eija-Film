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
  const userId = getUserIdFromToken(req); 
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You need to be logged in to perform this action.',
    });
  }

  try {
    if (req.method === 'GET') {
      const { filmId, userId } = req.query;

      if (filmId) {
        const ratings = await prisma.rating.findMany({
          where: {
            filmId: String(filmId),
          },
        });
        return res.status(200).json(ratings);
      }

      if (userId) {
        const ratings = await prisma.rating.findMany({
          where: {
            userId: String(userId),
          },
        });
        return res.status(200).json(ratings);
      }

      const allRatings = await prisma.rating.findMany();
      return res.status(200).json(allRatings);
    }

    if (req.method === 'POST') {
      const { filmId, score, commentId } = req.body;

      if (!filmId || !score) {
        return res.status(400).json({ error: 'FilmId and score are required' });
      }

      const existingRating = await prisma.rating.findFirst({
        where: {
          userId: userId,
          filmId: String(filmId),
        },
      });

      if (existingRating) {
        return res.status(400).json({ error: 'You have already rated this film' });
      }

      const newRating = await prisma.rating.create({
        data: {
          userId,
          filmId,
          score,
          commentId: commentId
        },
      });

      return res.status(201).json(newRating);
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