import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  console.log("Received slug:", slug);

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug tidak valid" });
  }

  try {
    console.log("Fetching film with slug:", slug);

    
    const film = await prisma.film.findFirst({
      where: { slug },
      include: {
        genreRelations: { include: { genre: true } },
        castingRelations: { include: { casting: true } },
        comments: { include: { user: true, rating: true } }
        
      },
    });

    console.log("Film data retrieved:", film ? "Yes" : "No");

    
    if (!film) {
      return res.status(404).json({ error: "Film tidak ditemukan" });
    }

    
    const response = {
      ...film,
      avgRating: "0", 
      
      
      
      
      
        
      
      
      
      
      
      
      
      
      
      
        
      
      
      
      
      
    };

    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching film:", error);
    return res.status(500).json({ 
      error: "Terjadi kesalahan server", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}