import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Function to get userId from JWT token
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
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You need to be logged in to perform this action.',
      });
    }
    
    if (req.method === 'GET') {
      const { filmId, showAll } = req.query;
      
      if (showAll === 'true') {
        const comments = await prisma.comment.findMany({
          include: {
            user: true,
            rating: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        return res.status(200).json(comments);
      }

      if (filmId) {
        // If filmId is provided, filter comments by filmId
        const comments = await prisma.comment.findMany({
          where: { 
            filmId: String(filmId)
          },
          include: {
            user: true,
            rating: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        return res.status(200).json(comments);
      } else {
        // If no filmId, return user's comments
        const comments = await prisma.comment.findMany({
          where: { userId },
          include: {
            user: true,
            rating: true
          }
        });
        return res.status(200).json(comments);
      }
    }

    // POST operation to add a new comment
    if (req.method === 'POST') {
      const { filmId, content, userId } = req.body;

      if (!filmId || !content || !userId) {
        return res.status(400).json({ error: 'Film ID and content are required' });
      }

      // Check if user already commented on this film
      const existingComment = await prisma.comment.findFirst({
        where: {
          userId,
          filmId
        }
      });

      if (existingComment) {
        return res.status(400).json({ 
          error: 'Comment already exists',
          message: 'You have already commented on this film. Please edit your existing comment.'
        });
      }

      const newComment = await prisma.comment.create({
        data: {
          userId,
          filmId,
          content
        },
      });

      return res.status(201).json(newComment);
    }

    // If other methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling API request:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  }
}
