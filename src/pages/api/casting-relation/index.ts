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
        message: 'Anda perlu login untuk melakukan aksi ini.',
      });
    }

    if (req.method === 'GET') {
      const castingRelations = await prisma.castingRelation.findMany({
        include: {
          film: true,
          casting: true,
        },
      });

      return res.status(200).json(castingRelations);
    }

    if (req.method === 'POST') {
      const { filmId, castings } = req.body;

      if (!filmId || !castings || !Array.isArray(castings)) {
        return res.status(400).json({ error: 'Film ID dan Castings diperlukan' });
      }

      // Buat banyak casting relations
      const newCastingRelations = await prisma.$transaction(
        castings.map((casting) =>
          prisma.castingRelation.create({
            data: {
              filmId,
              castingId: casting.castingId,
              role: casting.role,
            },
          })
        )
      );

      return res.status(201).json(newCastingRelations);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error handling API request:', error.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Terjadi kesalahan tak terduga',
      });
    }

    console.error('Unknown error', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan tak terduga',
    });
  }
}