import { z } from 'zod';
import { Response } from '../../utils/schema/response';

export const UsersListResponse = z.object({
  ...Response.shape,
  data: z.array(
    z.object({
      id: z.number().nonnegative().gt(0),
      username: z.string().max(16).min(4),
      name: z.string().min(4),
      email: z.string().email(),
      roles: z.array(
        z.object({
          id: z.number().nonnegative().gt(0),
          name: z.string(),
        }),
      ),
    }),
  ),
});

export const UserEditParams = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '2',
  }),
});

export const UserEditRequest = z.object({
  username: z.string().max(16).min(4),
  name: z.string(),
  email: z.string(),
  role: z.object({
    id: z.number().nonnegative().gt(0),
    name: z.string(),
  }),
});

export const UserEditResponse = z.object({
  ...Response.shape,
  data: z.object({
    id: z.number().nonnegative().gt(0),
    username: z.string().max(16).min(4),
    name: z.string().min(4),
    email: z.string().email(),
    roles: z.array(
      z.object({
        id: z.number().nonnegative().gt(0),
        name: z.string(),
      }),
    ),
  }),
});
