import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types';

export function generateToken(payload: JWTPayload): string {
  const secret: string = String(config.jwtSecret);
  const expiresIn: string = String(config.jwtExpiresIn);
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  try {
    const secret: string = String(config.jwtSecret);
    return jwt.verify(token, secret) as JWTPayload;
  } catch (_error) {
    throw new Error('Invalid or expired token');
  }
}
