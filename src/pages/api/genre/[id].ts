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
      // Handle GET request for a single genre by ID
      const genre = await prisma.genre.findUnique({
        where: { id: String(id) },
      });
      if (!genre) {
        return res.status(404).json({ error: 'Genre not found' });
      }
      return res.status(200).json(genre);
    }

    if (req.method === 'PUT') {
      // Handle PUT request to update a genre
      const { name } = req.body;
      const updatedGenre = await prisma.genre.update({
        where: { id: String(id) },
        data: {
          name,
        },
      });
      return res.status(200).json(updatedGenre);
    }

    if (req.method === 'DELETE') {
      // Handle DELETE request to remove a genre
      await prisma.genre.delete({
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
