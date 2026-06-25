import { z } from 'zod';

export const lectureSchema = z.object({
  body: z.object({
    sectionId: z.string({ required_error: 'Section ID is required' }),
    title: z.string({ required_error: 'Title is required' }),
    videoUrl: z.string().url('Invalid URL'),
    duration: z.number().int().nonnegative().optional(),
    isFree: z.boolean().optional()
  })
});
