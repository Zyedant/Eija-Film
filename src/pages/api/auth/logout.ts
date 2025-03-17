import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    res.setHeader('Set-Cookie', [
      'token=; Max-Age=0; path=/; HttpOnly; SameSite=Strict',
      'role=; Max-Age=0; path=/; HttpOnly; SameSite=Strict',
      'isLoggedIn=; Max-Age=0; path=/; HttpOnly; SameSite=Strict',
    ]);
    console.log(handler)

    return res.status(200).json({ message: "Logout successful" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
