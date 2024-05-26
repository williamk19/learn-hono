import { z } from 'zod';

export const Response = z.object({
  status: z.string().default('success'),
  code: z.number().min(200).max(299).default(200),
});

export const ListResponse = z.object({
  status: z.string().default('success'),
  code: z.number().min(200).max(299).default(200),
  record_count: z.number(),
});
