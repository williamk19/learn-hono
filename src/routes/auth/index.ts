import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { LoginRequest, RegisterRequest } from './schema';
import { db } from '../../database/connection';
import { asc, eq, isNull } from 'drizzle-orm';
import { roles, users, usersToRoles } from '../../database/schema';
import { StatusCodes } from 'http-status-codes';
import { sign } from 'hono/jwt';
import { authLoginRoute, authRegisterRoute } from './docs';

const auth = new OpenAPIHono();

auth.openapi(authLoginRoute, async (c) => {
  const body = await c.req.json<z.infer<typeof LoginRequest>>();

  const user = await db.query.users.findFirst({
    where: eq(users.username, body.username),
    with: {
      roles: {
        where: isNull(roles.deleted_at),
        orderBy: [asc(roles.id)],
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

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: 'Prompt BE',
    sub: user.username,
    role: user.roles[0].role.name,
    iat: now,
    nbf: now,
    exp: now + parseInt(process.env.JWT_EXP!),
  };

  const token = await sign(payload, process.env.JWT_SECRET!, 'HS512');

  const userRoles = user.roles.map((r) => ({
    id: r.roleId,
    name: r.role.name,
  }));

  return c.json({
    code: StatusCodes.OK,
    status: 'success',
    data: {
      accessToken: token,
      username: user.username,
      roles: userRoles,
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
          orderBy: [asc(roles.id)],
          columns: {
            userId: false,
            id: false,
          },
          with: {
            role: {
              columns: { name: true },
            },
          },
          where: isNull(roles.deleted_at),
        },
      },
      where: eq(users.id, insertedNewUser[0].insertedId),
    });

    if (!newUser)
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'Cannot find created user.',
      });

    const createdUser = {
      ...newUser,
      roles: newUser.roles.map((r) => ({
        id: r.roleId,
        name: r.role.name,
      })),
    };

    return c.json({
      status: 'success',
      code: StatusCodes.CREATED,
      data: createdUser,
    });
  } catch (error) {
    throw new HTTPException(StatusCodes.BAD_REQUEST, {
      message: `Unable to create new user. [${error}]`,
    });
  }
});

export default auth;
