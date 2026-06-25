import { z } from 'zod';

export const courseSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
    description: z.string({ required_error: 'Description is required' }).min(10, 'Description must be at least 10 characters'),
    price: z.number({ required_error: 'Price is required' }).int().nonnegative('Price must be non-negative'),
    thumbnailUrl: z.string().url('Invalid URL').optional(),
    isPublished: z.boolean().optional()
  })
});
