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
  const { filmId } = req.query;

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Anda perlu login untuk melakukan aksi ini.',
    });
  }

  try {
    if (req.method === 'GET') {
      const genreRelations = await prisma.genreRelation.findMany({
        where: { filmId: String(filmId) },
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

      if (!genreRelations || genreRelations.length === 0) {
        return res.status(404).json({ error: 'Tidak ada genre ditemukan untuk film ini' });
      }

      return res.status(200).json(genreRelations);
    }

    if (req.method === 'PUT') {
      const { genreId } = req.body; 
    
      if (!genreId) {
        return res.status(400).json({ error: 'Genre ID diperlukan untuk update' });
      }
    
      try {
        const existingRelation = await prisma.genreRelation.findFirst({
          where: {
            filmId: String(filmId),
            genreId: String(genreId),
          },
        });
    
        if (!existingRelation) {
          return res.status(404).json({ error: 'GenreRelation tidak ditemukan untuk film ini' });
        }
        
        const updatedRelation = await prisma.genreRelation.update({
          where: {
            id: existingRelation.id, 
          },
          data: {
            genreId: String(genreId), 
          },
        });
    
        return res.status(200).json(updatedRelation);
      } catch (error: unknown) { 
        if (error instanceof Error) {
          console.error('Error updating genre relation:', error.message);
          return res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
        console.error('Unknown error', error);
        return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
      }
    }

    if (req.method === 'DELETE') {
      const { genreId } = req.query; 
      const bodyGenreId = req.body?.genreId; 
    
      const finalGenreId = genreId || bodyGenreId; 
    
      if (!finalGenreId) {
        return res.status(400).json({ error: 'Genre ID diperlukan untuk menghapus' });
      }
    
      try {
        const existingRelation = await prisma.genreRelation.findFirst({
          where: {
            filmId: String(filmId),
            genreId: String(finalGenreId),
          },
        });
    
        if (!existingRelation) {
          return res.status(404).json({ error: 'GenreRelation tidak ditemukan untuk film ini' });
        }
        
        await prisma.genreRelation.deleteMany({
          where: {
            filmId: String(filmId),
            genreId: String(finalGenreId),
          },
        });
    
        return res.status(204).json({ message: 'GenreRelation berhasil dihapus' }); 
      } catch (error: unknown) { 
        if (error instanceof Error) {
          console.error('Error deleting genre relation:', error.message);
          return res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
        console.error('Unknown error', error);
        return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
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
    }
    console.error('Unknown error', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan tak terduga',
    });
  }
}
