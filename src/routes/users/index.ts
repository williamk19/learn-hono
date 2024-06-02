import { OpenAPIHono } from '@hono/zod-openapi';
import { editUserRoute, usersListRoute } from './docs';
import { db } from '../../database/connection';
import { StatusCodes } from 'http-status-codes';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { roles, users, usersToRoles } from '../../database/schema';
import { HTTPException } from 'hono/http-exception';

const usersApi = new OpenAPIHono();

usersApi.openapi(usersListRoute, async (c) => {
  const user = c.get('jwtPayload');
  console.log(user);

  const usersList = await db.query.users.findMany({
    columns: {
      password: false,
    },
    with: {
      roles: {
        where: isNull(roles.deleted_at),
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

  const convertedUsersList = usersList.map((user) => {
    return {
      ...user,
      roles: user.roles.map((r) => ({
        id: r.roleId,
        name: r.role.name,
      })),
    };
  });

  const users = [
    ...convertedUsersList.filter((u) => u.username === user.username),
    ...convertedUsersList.filter((u) => u.username !== user.username),
  ];

  return c.json({
    code: StatusCodes.OK,
    status: 'success',
    data: users,
  });
});

usersApi.openapi(editUserRoute, async (c) => {
  const body = c.req.valid('json');
  const { id } = c.req.valid('param');

  await db
    .update(users)
    .set({
      username: body.username,
      name: body.name,
      email: body.email,
    })
    .where(eq(users.id, parseInt(id)))
    .returning();

  const existingRole = await db.query.usersToRoles.findMany({
    where: and(
      eq(usersToRoles.userId, parseInt(id)),
      isNull(usersToRoles.deleted_at),
    ),
  });

  let isUserRolesExists = false;

  existingRole.forEach(async (role) => {
    if (role.roleId === body.role.id) {
      isUserRolesExists = true;
    } else {
      await db
        .update(usersToRoles)
        .set({ deleted_at: new Date().toISOString() })
        .where(
          and(
            eq(usersToRoles.userId, parseInt(id)),
            eq(usersToRoles.roleId, role.roleId),
          ),
        );
    }
  });

  if (!isUserRolesExists) {
    await db
      .insert(usersToRoles)
      .values({ userId: parseInt(id), roleId: body.role.id });
  }

  const updatedUser = await db.query.users.findFirst({
    columns: {
      password: false,
      deleted_at: false,
    },
    with: {
      roles: {
        orderBy: [asc(roles.id)],
        columns: {
          userId: false,
          deleted_at: false,
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
    where: eq(users.id, parseInt(id)),
  });

  if (!updatedUser)
    throw new HTTPException(StatusCodes.NOT_FOUND, {
      message: 'Cannot find updated user.',
    });

  const updatedUserWithRole = {
    ...updatedUser,
    roles: updatedUser.roles.map((r) => ({
      id: r.roleId,
      name: r.role.name,
    })),
  };

  return c.json({
    code: StatusCodes.OK,
    status: 'success',
    data: updatedUserWithRole,
  });
});

export default usersApi;
