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
      const genreRelations = await prisma.genreRelation.findMany({
        include: {
          genre: {
            select: {
              id: true,
              name: true,
            },
          },
          film: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
      return res.status(200).json(genreRelations);
    }

    if (req.method === 'POST') {
      const { filmId, genreId } = req.body;

      if (!filmId || !genreId || !Array.isArray(genreId)) {
        return res.status(400).json({ error: 'Film ID dan Genre ID (sebagai array) diperlukan' });
      }

      const film = await prisma.film.findUnique({
        where: { id: filmId },
      });

      if (!film) {
        return res.status(404).json({ error: `Film dengan ID ${filmId} tidak ditemukan.` });
      }

      try {
        const newGenreRelations = await Promise.all(
          genreId.map(async (id) => {
            const genre = await prisma.genre.findUnique({
              where: { id },
            });

            if (!genre) {
              throw new Error(`Genre dengan ID ${id} tidak ditemukan.`);
            }

            return prisma.genreRelation.create({
              data: {
                filmId,
                genreId: id,
              },
            });
          })
        );

        return res.status(201).json(newGenreRelations);
      } catch (error: unknown) { 
        if (error instanceof Error) {
          console.error('Error creating genre relations:', error.message);
          return res.status(500).json({ error: error.message });
        } else {
          console.error('Unknown error creating genre relations:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    }

    if (req.method === 'PUT') {
      const { filmId, genreId } = req.body;

      if (!filmId || !genreId || !Array.isArray(genreId)) {
        return res.status(400).json({ error: 'Film ID dan Genre ID (sebagai array) diperlukan' });
      }

      try {
        await prisma.genreRelation.deleteMany({
          where: { filmId },
        });

        const updatedGenreRelations = await Promise.all(
          genreId.map(async (id) => {
            const genre = await prisma.genre.findUnique({
              where: { id },
            });

            if (!genre) {
              throw new Error(`Genre dengan ID ${id} tidak ditemukan.`);
            }

            return prisma.genreRelation.create({
              data: {
                filmId,
                genreId: id,
              },
            });
          })
        );

        return res.status(200).json(updatedGenreRelations);
      } catch (error: unknown) { 
        if (error instanceof Error) {
          console.error('Error updating genre relations:', error.message);
          return res.status(500).json({ error: error.message });
        } else {
          console.error('Unknown error updating genre relations:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: unknown) { 
    if (error instanceof Error) {
      console.error('Error handling API request:', error.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Terjadi kesalahan tak terduga',
      });
    } else {
      console.error('Unknown error handling API request:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Terjadi kesalahan tak terduga',
      });
    }
  }
}
