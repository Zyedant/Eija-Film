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

    // Gunakan findFirst() karena slug tidak dikonfigurasi sebagai unik
    const film = await prisma.film.findFirst({
      where: { slug },
      include: {
        genreRelations: { include: { genre: true } },
        castingRelations: { include: { casting: true } },
        comments: { include: { user: true, rating: true } }
        // Hapus ratings karena belum tersedia
      },
    });

    console.log("Film data retrieved:", film ? "Yes" : "No");

    // Jika film tidak ditemukan, kirim error 404
    if (!film) {
      return res.status(404).json({ error: "Film tidak ditemukan" });
    }

    // Transformasi data untuk menangani JSON fields
    const response = {
      ...film,
      avgRating: "0", // Set rating ke 0 secara eksplisit
      // genreRelations: film.genreRelations.map(relation => {
      //   // Parse genreId if it's a JSON string
      //   const genreIds = typeof relation.genreId === 'string' 
      //     ? JSON.parse(relation.genreId) 
      //     : relation.genreId;
        
      //   return {
      //     ...relation,
      //     genreId: genreIds
      //   };
      // }),
      // castingRelations: film.castingRelations.map(relation => {
      //   // Parse castingData if it's a JSON string
      //   const castingData = typeof relation.castingData === 'string' 
      //     ? JSON.parse(relation.castingData) 
      //     : relation.castingData;
        
      //   return {
      //     ...relation,
      //     castingData
      //   };
      // })
    };

    // Kirimkan respons JSON yang valid
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching film:", error);
    return res.status(500).json({ 
      error: "Terjadi kesalahan server", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}