import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

export const verifyAuth = (handler: NextApiHandler, allowedRoles: string[] = []) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {     
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      req.user = { id: decoded.id };
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};
