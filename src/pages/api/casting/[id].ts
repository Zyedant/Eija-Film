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
      const casting = await prisma.casting.findUnique({
        where: { id: String(id) },
      });
      if (!casting) {
        return res.status(404).json({ error: 'Casting not found' });
      }
      return res.status(200).json(casting);
    }

    if (req.method === 'PUT') {
      const { realName, photoUrl, stageName } = req.body;
      
      if (!realName || !photoUrl || !stageName) {
        return res.status(400).json({ error: 'Real Name and Photo URL are required' });
      }

      const updatedCasting = await prisma.casting.update({
        where: { id: String(id) },
        data: {
          realName,
          photoUrl,
          stageName,
        },
      });
      return res.status(200).json(updatedCasting);
    }

    if (req.method === 'DELETE') {
      await prisma.casting.delete({
        where: { id: String(id) },
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error handling API request:', error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }

    console.error('Unknown error', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unknown error occurred' });
  }
}
