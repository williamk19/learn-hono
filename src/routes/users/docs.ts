import { createRoute } from '@hono/zod-openapi';
import { UsersListResponse } from './schema';

export const authLoginRoute = createRoute({
  summary: 'List users',
  method: 'get',
  security: [
    {
      Bearer: [],
    },
  ],
  path: '/',
  responses: {
    200: {
      description: 'Success getting list of users.',
      content: {
        'application/json': {
          schema: UsersListResponse,
        },
      },
    },
  },
  tags: ['Users'],
});
