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
    return res.status(401).json({ error: 'Unauthorized', message: 'You need to be logged in to perform this action.' });
  }

  try {
    if (req.method === 'POST') {
      const { filmId, rating, comment, replyToCommentId } = req.body;

      // Cek apakah filmId, rating dan comment tersedia
      if (!filmId || (comment && !rating)) {
        return res.status(400).json({ error: 'Rating and comment are required if comment is provided' });
      }

      // Cek apakah pengguna sudah memberikan rating dan komentar sebelumnya
      const existingRating = await prisma.rating.findFirst({
        where: {
          AND: [{ userId }, { filmId }],
        },
      });

      if (existingRating && !replyToCommentId) {
        return res.status(400).json({ error: 'You have already rated and commented on this film.' });
      }

      // Menambahkan rating jika belum ada rating sebelumnya
      let newRating = null;
      if (!existingRating && rating) {
        newRating = await prisma.rating.create({
          data: {
            userId,
            filmId,
            score: rating,
          },
        });
      }

      // Menambahkan komentar (termasuk balasan)
      const newComment = await prisma.comment.create({
        data: {
          userId,
          filmId,
          content: comment,
          replyToCommentId, // null jika bukan balasan
        },
      });

      return res.status(201).json({ rating: newRating, comment: newComment });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling API request:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
