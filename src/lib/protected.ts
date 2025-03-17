import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from './middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const user = req.user;
  
  return res.status(200).json({ message: 'Protected content', user });
};

export default verifyAuth(handler);
