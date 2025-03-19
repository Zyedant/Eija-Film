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
    if (req.method === 'GET') {
      const { filmId, showAll } = req.query;

      if (showAll === 'true') {
        const comments = await prisma.comment.findMany({
          include: {
            user: true,
            rating: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return res.status(200).json(comments);
      }

      if (filmId) {
        const comments = await prisma.comment.findMany({
          where: {
            filmId: String(filmId),
          },
          include: {
            user: true,
            rating: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return res.status(200).json(comments);
      } else {
        const comments = await prisma.comment.findMany({
          include: {
            user: true,
            rating: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return res.status(200).json(comments);
      }
    }

    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Anda perlu login untuk melakukan tindakan ini.',
      });
    }

    if (req.method === 'POST') {
      const { filmId, content } = req.body;

      if (!filmId || !content) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Film ID dan konten komentar diperlukan.',
        });
      }

      const existingComment = await prisma.comment.findFirst({
        where: {
          userId,
          filmId,
        },
      });

      if (existingComment) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Anda sudah memberikan komentar untuk film ini. Silakan edit komentar Anda yang sudah ada.',
        });
      }

      const newComment = await prisma.comment.create({
        data: {
          userId,
          filmId,
          content,
        },
        include: {
          user: true, 
        },
      });

      return res.status(201).json(newComment);
    }

    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Metode HTTP tidak didukung.',
    });
  } catch (error: unknown) {
    console.error('Error handling API request:', error);

    if (error instanceof Error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Terjadi kesalahan tak terduga.',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan tak terduga.',
    });
  }
}