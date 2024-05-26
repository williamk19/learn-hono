import { z } from 'zod';
import { ListResponse } from '../../utils/schema/response';

export const TasksListParamsRequest = z.object({
  offset: z.string().default('0').pipe(z.coerce.number().min(0).default(0)),
  limit: z.string().default('10').pipe(z.coerce.number().min(0).default(10)),
});

export const TasksListResponse = z.object({
  ...ListResponse.shape,
  data: z.array(
    z.object({
      id: z.number().nonnegative().gt(0),
      title: z.string().max(64),
      description: z.string().nullable(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
      user: z.object({
        id: z.number().nonnegative().gt(0),
        username: z.string().max(16).min(4),
        name: z.string().min(4),
        email: z.string().email(),
      }),
    }),
  ),
});
