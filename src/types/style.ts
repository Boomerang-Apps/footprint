import { z } from 'zod';

// Database schema validation
export const StyleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  created_at: z.string().datetime().optional(),
});

export type Style = z.infer<typeof StyleSchema>;

// API Response schemas
export const StylesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(StyleSchema).optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  details: z.string().optional(),
});

export type StylesResponse = z.infer<typeof StylesResponseSchema>;

// Query parameters validation
export const StylesQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100).optional(),
});

export type StylesQuery = z.infer<typeof StylesQuerySchema>;
