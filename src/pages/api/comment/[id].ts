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
    return res.status(400).json({ error: 'Comment ID is required' });
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
      const comment = await prisma.comment.findUnique({
        where: { id: String(id) },
        include: {
          user: true,
          film: true,
        }
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      return res.status(200).json(comment);
    }

    if (req.method === 'PUT') {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const comment = await prisma.comment.findUnique({
        where: { id: String(id) },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden', message: 'You can only edit your own comments' });
      }

      const updatedComment = await prisma.comment.update({
        where: { id: String(id) },
        data: { content },
      });

      return res.status(200).json(updatedComment);
    }

    if (req.method === 'DELETE') {
      const comment = await prisma.comment.findUnique({
        where: { id: String(id) },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden', message: 'You can only delete your own comments' });
      }

      await prisma.comment.delete({
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
