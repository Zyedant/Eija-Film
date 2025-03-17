import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
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
      const films = await prisma.film.findMany({
        include: {
          genreRelations: { include: { genre: true } },
        }
      });
      return res.status(200).json(films);
    }

    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You need to be logged in to perform this action.',
      });
    }

    if (req.method === 'POST') {
      const { title, description, posterUrl, trailerUrl, duration, releaseYear, category, episode } = req.body;
    
      if (!title || !description || !category) {
        return res.status(400).json({ error: 'Title, description, and category are required' });
      }
    
      if ((category === 'SERIES' || category === 'ANIME') && (!episode || episode <= 0)) {
        return res.status(400).json({ error: 'Episode is required for SERIES or ANIME' });
      }
    
      const slug = slugify(title, { lower: true, strict: true });
    
      const newFilm = await prisma.film.create({
        data: {
          userId,
          title,
          slug,
          description,
          posterUrl,
          trailerUrl,
          duration,
          releaseYear,
          category,
          episode: category === 'MOVIE' ? null : parseInt(episode, 10),
        },
      });
    
      return res.status(201).json(newFilm);
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
