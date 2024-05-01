import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './schema';
import { db } from '../../database/connection';
import { eq } from 'drizzle-orm';
import { users, usersToRoles } from '../../database/schema';
import { StatusCodes } from 'http-status-codes';
import { sign } from 'hono/jwt';

const auth = new OpenAPIHono();

const authLoginRoute = createRoute({
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

const authRegisterRoute = createRoute({
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

auth.openapi(authLoginRoute, async (c) => {
  const body = await c.req.json<z.infer<typeof LoginRequest>>();

  const user = await db.query.users.findFirst({
    where: eq(users.username, body.username),
    with: {
      roles: {
        columns: {
          userId: false,
          id: false,
        },
        with: {
          role: {
            columns: { name: true },
          },
        },
      },
    },
  });

  if (!user)
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message:
        'Unable to login, make sure your username and password are correct.',
    });

  const isMatch = await Bun.password.verify(body.password, user.password);

  if (!isMatch)
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message:
        'Unable to login, make sure your username and password are correct.',
    });

  const payload = {
    sub: user.username,
    role: user.roles[0].role.name,
    exp: process.env.JWT_EXP,
  };

  const token = await sign(payload, process.env.JWT_SECRET!);

  return c.json({
    code: StatusCodes.OK,
    status: 'success',
    data: {
      accessToken: token,
      username: user.username,
      roles: user.roles,
    },
  });
});

auth.openapi(authRegisterRoute, async (c) => {
  const body = await c.req.json<z.infer<typeof RegisterRequest>>();

  const userExists = await db.query.users.findFirst({
    where: eq(users.username, body.username),
  });

  if (userExists)
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message: 'Username already exists.',
    });

  try {
    const hashedPassword = await Bun.password.hash(body.password);
    const insertedNewUser = await db
      .insert(users)
      .values({ ...body, password: hashedPassword })
      .returning({ insertedId: users.id });

    await db
      .insert(usersToRoles)
      .values({ userId: insertedNewUser[0].insertedId, roleId: 3 });

    const newUser = await db.query.users.findFirst({
      columns: {
        password: false,
      },
      with: {
        roles: {
          columns: {
            userId: false,
            id: false,
          },
          with: {
            role: {
              columns: { name: true },
            },
          },
        },
      },
      where: eq(users.id, insertedNewUser[0].insertedId),
    });

    if (!newUser)
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'Cannot find created user.',
      });

    return c.json({
      status: 'success',
      code: StatusCodes.CREATED,
      data: newUser,
    });
  } catch (error) {
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message: `Unable to create new user. [${error}]`,
    });
  }
});

export default auth;
