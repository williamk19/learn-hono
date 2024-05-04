import { z } from 'zod';
import { Response } from '../../utils/schema/response';

export const UsersListResponse = z.object({
  ...Response.shape,
  data: z.array(
    z.object({
      id: z.number().nonnegative().gt(0),
      username: z.string().max(16).min(4),
      name: z.string().min(4).nullable(),
      email: z.string().email().nullable(),
      roles: z.array(
        z.object({
          roleId: z.number().nonnegative().gt(0),
          role: z.object({
            name: z.string().nullable(),
          }),
        }),
      ),
    }),
  ),
});
