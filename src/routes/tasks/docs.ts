import { createRoute, z } from '@hono/zod-openapi';
import { TasksListParamsRequest, TasksListResponse } from './schema';

export const tasksListRoute = createRoute({
  summary: 'List all tasks',
  method: 'get',
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    query: TasksListParamsRequest,
  },
  path: '/',
  responses: {
    200: {
      description: 'Success getting list of users.',
      content: {
        'application/json': {
          schema: TasksListResponse,
        },
      },
    },
  },
  tags: ['Tasks'],
});
