import { z } from 'zod';
import { Response } from '../../utils/schema/response';

export const LoginRequest = z.object({
  username: z.string().max(16).min(4),
  password: z.string().min(8),
});

export const LoginResponse = z.object({
  ...Response.shape,
  data: z.object({
    accessToken: z.string(),
    username: z.string().max(16).min(4),
    roles: z.array(
      z.object({
        roleId: z.number().nonnegative().gt(0),
        role: z.object({
          name: z.string().nullable(),
        }),
      }),
    ),
  }),
});

export const RegisterRequest = z.object({
  username: z.string().max(16).min(4),
  password: z.string().min(8).max(64),
  name: z.string().min(4),
  email: z.string().email(),
});

export const RegisterResponse = z.object({
  ...Response.shape,
  data: z.object({
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
});
