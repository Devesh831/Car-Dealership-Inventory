import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'car_dealership_super_secret_jwt_key_2024_tdd_kata';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface TokenPayload {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Generates a signed JWT token for the given user payload.
 * Token expires based on JWT_EXPIRES_IN environment variable.
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

/**
 * Verifies and decodes a JWT token.
 * Returns the decoded payload or throws on invalid/expired token.
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
