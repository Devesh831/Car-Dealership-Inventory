import { z } from 'zod';

/**
 * Zod schema for user registration request validation.
 * Enforces minimum length and format requirements.
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Invalid email address format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  role: z
    .enum(['user', 'admin'])
    .optional()
    .default('user'),
  adminCode: z
    .string()
    .optional(),
});

/**
 * Zod schema for user login request validation.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Zod schema for vehicle creation/update validation.
 */
export const vehicleSchema = z.object({
  make: z
    .string()
    .min(1, 'Make is required')
    .max(50, 'Make cannot exceed 50 characters'),
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model cannot exceed 50 characters'),
  year: z
    .number()
    .int('Year must be an integer')
    .min(1900, 'Year must be at least 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  category: z.enum(['Sedan', 'SUV', 'Truck', 'Coupe', 'Van', 'Electric', 'Hybrid']),
  price: z
    .number()
    .positive('Price must be a positive number'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .default(''),
  image_url: z
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal(''))
    .default(''),
});

/**
 * Zod schema for vehicle update (all fields optional).
 */
export const vehicleUpdateSchema = vehicleSchema.partial();

/**
 * Zod schema for purchase/restock quantity validation.
 */
export const quantitySchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be a positive number'),
});

/**
 * Zod schema for search query parameters.
 */
export const searchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.enum(['Sedan', 'SUV', 'Truck', 'Coupe', 'Van', 'Electric', 'Hybrid']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
export type QuantityInput = z.infer<typeof quantitySchema>;
export type SearchInput = z.infer<typeof searchSchema>;
