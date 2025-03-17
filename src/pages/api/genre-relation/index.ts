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
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You need to be logged in to perform this action.',
    });
  }

  try {
    // GET: Mengambil semua genre relations
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

    // POST: Menambahkan GenreRelation baru
    if (req.method === 'POST') {
      const { filmId, genreId } = req.body;

      if (!filmId || !genreId || !Array.isArray(genreId)) {
        return res.status(400).json({ error: 'Film ID dan Genre ID (sebagai array) diperlukan' });
      }

      // Validasi apakah filmId ada di database
      const film = await prisma.film.findUnique({
        where: { id: filmId },
      });

      if (!film) {
        return res.status(404).json({ error: `Film dengan ID ${filmId} tidak ditemukan.` });
      }

      // Menambahkan genre relation satu per satu
      try {
        const newGenreRelations = await Promise.all(
          genreId.map(async (id) => {
            // Validasi apakah genreId ada di database
            const genre = await prisma.genre.findUnique({
              where: { id },
            });

            if (!genre) {
              throw new Error(`Genre dengan ID ${id} tidak ditemukan.`);
            }

            // Menambahkan GenreRelation
            return prisma.genreRelation.create({
              data: {
                filmId,
                genreId: id,
              },
            });
          })
        );

        return res.status(201).json(newGenreRelations);
      } catch (error) {
        console.error('Error creating genre relations:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    // PUT: Mengupdate GenreRelation
    if (req.method === 'PUT') {
      const { filmId, genreId } = req.body;

      if (!filmId || !genreId || !Array.isArray(genreId)) {
        return res.status(400).json({ error: 'Film ID dan Genre ID (sebagai array) diperlukan' });
      }

      try {
        // Hapus semua relasi genre untuk film ini
        await prisma.genreRelation.deleteMany({
          where: { filmId },
        });

        // Tambahkan relasi genre baru
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
      } catch (error) {
        console.error('Error updating genre relations:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    // Untuk metode lain seperti DELETE, kembalikan 405
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling API request:', error.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Terjadi kesalahan tak terduga',
    });
  }
}