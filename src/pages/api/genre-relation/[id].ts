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
  const { filmId } = req.query;

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Anda perlu login untuk melakukan aksi ini.',
    });
  }

  try {
    // GET: Mengambil GenreRelations untuk Film tertentu
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
      const { genreId } = req.body; // Ambil genreId dari body request
    
      if (!genreId) {
        return res.status(400).json({ error: 'Genre ID diperlukan untuk update' });
      }
    
      try {
        // Cek apakah relasi sudah ada
        const existingRelation = await prisma.genreRelation.findFirst({
          where: {
            filmId: String(filmId),
            genreId: String(genreId),
          },
        });
    
        if (!existingRelation) {
          return res.status(404).json({ error: 'GenreRelation tidak ditemukan untuk film ini' });
        }
    
        // Update GenreRelation
        const updatedRelation = await prisma.genreRelation.update({
          where: {
            id: existingRelation.id, // Gunakan ID relasi yang ditemukan
          },
          data: {
            genreId: String(genreId), // Update genreId
          },
        });
    
        return res.status(200).json(updatedRelation);
      } catch (error) {
        console.error('Error updating genre relation:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
      }
    }

    if (req.method === 'DELETE') {
      const { genreId } = req.query; // Ambil genreId dari query parameter
      const bodyGenreId = req.body?.genreId; // Ambil genreId dari body request
    
      const finalGenreId = genreId || bodyGenreId; // Prioritaskan query parameter
    
      if (!finalGenreId) {
        return res.status(400).json({ error: 'Genre ID diperlukan untuk menghapus' });
      }
    
      try {
        // Cek apakah relasi ada
        const existingRelation = await prisma.genreRelation.findFirst({
          where: {
            filmId: String(filmId),
            genreId: String(finalGenreId),
          },
        });
    
        if (!existingRelation) {
          return res.status(404).json({ error: 'GenreRelation tidak ditemukan untuk film ini' });
        }
    
        // Menghapus GenreRelation
        await prisma.genreRelation.deleteMany({
          where: {
            filmId: String(filmId),
            genreId: String(finalGenreId),
          },
        });
    
        return res.status(204).json({ message: 'GenreRelation berhasil dihapus' }); // No content
      } catch (error) {
        console.error('Error deleting genre relation:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
      }
    }

    // Untuk metode lain seperti POST, kembalikan 405
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling API request:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Terjadi kesalahan tak terduga',
    });
  }
}