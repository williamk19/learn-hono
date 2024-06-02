import { createRoute } from '@hono/zod-openapi';
import { TaskDetailParams, TaskDetailResponse, TasksListParamsRequest, TasksListResponse } from './schema';

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
      description: 'Success getting list of tasks.',
      content: {
        'application/json': {
          schema: TasksListResponse,
        },
      },
    },
  },
  tags: ['Tasks'],
});

export const taskDetailRoute = createRoute({
  summary: 'Get task detail by id',
  method: 'get',
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    params: TaskDetailParams
  },
  path: '/{id}',
  responses: {
    200: {
      description: 'Success getting task detail.',
      content: {
        'application/json': {
          schema: TaskDetailResponse,
        },
      },
    },
  },
  tags: ['Tasks'],
});
