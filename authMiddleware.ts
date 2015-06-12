// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { redisClient } from '../utils/redisClient';
import { AuthService } from '../services/authService';
import { UnauthorizedError } from '../errors/UnauthorizedError';

const authService = new AuthService();

export const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      throw new UnauthorizedError('Authorization header is missing');
    }

    const token = authorizationHeader.replace('Bearer ', '');
    const decoded = verify(token, process.env.JWT_SECRET as string);
    if (!decoded) {
      throw new UnauthorizedError('Invalid token');
    }

    const userId = (decoded as any).userId;
    const user = await authService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify token blacklisting
    const isTokenBlacklisted = await redisClient.exists(`blacklist:${token}`);
    if (isTokenBlacklisted) {
      throw new UnauthorizedError('Token is blacklisted');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).send({ error: error.message });
    } else {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
    }
  }
};

export const validateUserRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const userRole = user.role;
      if (!allowedRoles.includes(userRole)) {
        throw new UnauthorizedError(`User role ${userRole} is not allowed`);
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(403).send({ error: error.message });
      } else {
        console.error(error);
        res.status(500).send({ error: 'Internal server error' });
      }
    }
  };
};