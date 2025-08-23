import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
