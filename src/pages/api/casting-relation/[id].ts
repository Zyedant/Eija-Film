import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Fungsi untuk mengambil user ID dari token JWT
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
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You need to be logged in to perform this action.',
    });
  }

  try {
    if (req.method === 'GET') {
      // Handle GET request for a single casting relation by ID
      const castingRelation = await prisma.castingRelation.findUnique({
        where: { id: String(id) },
        include: {
          film: true,
          casting: true,
        },
      });
      if (!castingRelation) {
        return res.status(404).json({ error: 'Casting relation not found' });
      }
      return res.status(200).json(castingRelation);
    }

    if (req.method === 'PUT') {
      // Handle PUT request to update a casting relation
      const { filmId, castingId, role } = req.body;

      // Validasi input castingData
      if (!filmId || !castingId || !role) {
        return res.status(400).json({ error: 'Film ID, Casting ID, dan Role diperlukan' });
      }

      const updatedCastingRelation = await prisma.castingRelation.update({
        where: { id: String(id) },
        data: {
          filmId,
          castingId,
          role,
        },
      });
      return res.status(200).json(updatedCastingRelation);
    }

    if (req.method === 'DELETE') {
      // Handle DELETE request to remove a casting relation
      await prisma.castingRelation.delete({
        where: { id: String(id) },
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling API request:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
