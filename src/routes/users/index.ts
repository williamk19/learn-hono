import { OpenAPIHono } from '@hono/zod-openapi';
import { authLoginRoute } from './docs';
import { db } from '../../database/connection';
import { StatusCodes } from 'http-status-codes';

const users = new OpenAPIHono();

users.openapi(authLoginRoute, async (c) => {
  const usersList = await db.query.users.findMany({
    columns: {
      password: false,
    },
    with: {
      roles: {
        columns: {
          id: false,
          userId: false,
        },
        with: {
          role: {
            columns: {
              name: true,
              id: false,
            },
          },
        },
      },
    },
  });

  return c.json({
    code: StatusCodes.OK,
    status: 'success',
    data: usersList,
  });
});

export default users;
