import { Request } from 'express';

/**
 * Extended Express Request type that includes the authenticated user payload
 * after JWT verification middleware processes the request.
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'user' | 'admin';
  };
}
