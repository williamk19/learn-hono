import { OpenAPIHono } from '@hono/zod-openapi';
import { tasksListRoute } from './docs';
import { db } from '../../database/connection';
import { RoleEnum, TaskType } from '../../types/tasks.types';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';
import { count, eq, sql } from 'drizzle-orm';
import { tasks } from '../../database/schema';

const tasksApi = new OpenAPIHono();

tasksApi.openapi(tasksListRoute, async (c) => {
  const { offset, limit } = c.req.query();
  const user = c.get('jwtPayload');

  let tasksList: TaskType[] = [];
  let tasksListCount = 0;

  if (user.role === RoleEnum.Admin || user.role === RoleEnum.Pm) {
    tasksList = await db.query.tasks.findMany({
      columns: {
        userId: false,
      },
      with: {
        user: {
          columns: {
            password: false,
            deleted_at: false,
          },
        },
      },
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    const [result] = await db
      .select({ count: sql<number>`count(${tasks.id})` })
      .from(tasks)
      .offset(parseInt(offset))
      .limit(parseInt(limit));
    tasksListCount = result.count;
  } else if (user.role === RoleEnum.Employee) {
    const userId = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, user.username),
    });

    if (!userId)
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'Cannot find updated user.',
      });

    tasksList = await db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.userId, userId.id),
      columns: {
        userId: false,
      },
      with: {
        user: {
          columns: {
            password: false,
            deleted_at: false,
          },
        },
      },
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    const [result] = await db
      .select({ count: sql<number>`count(${tasks.id})` })
      .from(tasks)
      .where(eq(tasks.userId, userId.id))
      .offset(parseInt(offset))
      .limit(parseInt(limit));
    tasksListCount = result.count;
  }

  return c.json({
    record_count: tasksListCount,
    code: StatusCodes.OK,
    status: 'success',
    data: tasksList,
  });
});

export default tasksApi;
