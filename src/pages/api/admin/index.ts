import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getToken({ req });
    
    let totalFilmsByUser: number | null = null; 

    if (token && token.sub) {
      const userId = token.sub; 

      totalFilmsByUser = await prisma.film.count({
        where: { userId: userId as string }, 
      });
    }

    const totalUsers = await prisma.user.count();
    const activeSessions = await prisma.user.count({
      where: { isActive: true },
    });
    const totalFilms = await prisma.film.count();

    res.status(200).json({
      totalUsers,
      activeSessions,
      totalFilms,
      totalFilmsByUser, 
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
