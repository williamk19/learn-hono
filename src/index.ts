import { logger } from 'hono/logger';
import { bearerAuth } from 'hono/bearer-auth';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';

import auth from './routes/auth';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';
import users from './routes/users';
import { verify } from 'hono/jwt';

const app = new OpenAPIHono();

app.use(logger());
app.doc('/openapi.json', {
  openapi: '3.0.3',
  info: {
    version: '1.0.0',
    title: 'Prompt Backend',
  },
});
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'https://prompt.williamk19.my.id'],
  }),
);

app.route('/auth', auth);

app.get('/', (c) => {
  return c.text('OK');
});

app.use(
  '/*',
  bearerAuth({
    verifyToken(token, c) {
      return verify(token, process.env.JWT_SECRET!, 'HS512');
    },
  }),
);

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  name: 'Authorization',
  scheme: 'bearer',
  in: 'header',
  description: 'Bearer token',
});

app.route('/users', users);

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    const { status, message } = err;
    c.status(status);

    return c.json({
      code: status,
      message: err.message,
    });
  }

  c.status(StatusCodes.INTERNAL_SERVER_ERROR);

  return c.json({
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: `Something wrong on the backend`,
  });
});

export default app;
