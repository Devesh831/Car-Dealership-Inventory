import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured');
  return secret;
};

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
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  } as jwt.SignOptions);
};

/**
 * Verifies and decodes a JWT token.
 * Returns the decoded payload or throws on invalid/expired token.
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
};
