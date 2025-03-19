import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { parse } from 'path';

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
      const film = await prisma.film.findUnique({
        where: { id: String(id) },
      });
      if (!film) {
        return res.status(404).json({ error: 'Film not found' });
      }
      return res.status(200).json(film);
    }

    if (req.method === 'PUT') {
      const { title, description, posterUrl, trailerUrl, duration, releaseYear, category, episode } = req.body;

      if ((category === 'SERIES' || category === 'ANIME') && (!episode || episode <= 0)) {
        return res.status(400).json({ error: 'Episode is required for SERIES or ANIME' });
      }

      const updatedFilm = await prisma.film.update({
        where: { id: String(id) },
        data: {
          title,
          description,
          posterUrl,
          trailerUrl,
          duration: parseInt(duration, 10),
          releaseYear: parseInt(releaseYear, 10),
          category,
          episode: category === 'MOVIE' ? null : parseInt(episode, 10),
        },
      });
      return res.status(200).json(updatedFilm);
    }

    if (req.method === 'DELETE') {
      await prisma.film.delete({
        where: { id: String(id) },
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error handling API request:', error.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
      });
    }

    console.error('Unknown error', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
