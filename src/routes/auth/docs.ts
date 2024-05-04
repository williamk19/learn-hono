import { createRoute } from '@hono/zod-openapi';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './schema';

export const authLoginRoute = createRoute({
  summary: 'Login',
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Success login to application.',
      content: {
        'application/json': {
          schema: LoginResponse,
        },
      },
    },
  },
  tags: ['Auth'],
});

export const authRegisterRoute = createRoute({
  summary: 'Register New User',
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterRequest,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RegisterResponse,
        },
      },
      description: 'Registration endpoint',
    },
  },
  tags: ['Auth'],
});
