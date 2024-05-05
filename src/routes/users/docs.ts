import { createRoute } from '@hono/zod-openapi';
import { UserEditParams, UserEditRequest, UserEditResponse, UsersListResponse } from './schema';

export const usersListRoute = createRoute({
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

export const editUserRoute = createRoute({
  summary: 'Edit user',
  method: 'put',
  security: [
    {
      Bearer: [],
    },
  ],
  path: '/{id}',
  request: {
    params: UserEditParams,
    body: {
      content: {
        'application/json': {
          schema: UserEditRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Success edit user.',
      content: {
        'application/json': {
          schema: UserEditResponse,
        },
      },
    },
  },
  tags: ['Users'],
});
