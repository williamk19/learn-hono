import { logger } from 'hono/logger';
import { bearerAuth } from 'hono/bearer-auth';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';

import auth from './routes/auth';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

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

app.route('/auth', auth);

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    const { status, message } = err;
    c.status(status);

    return c.json({
      code: status,
      message: err.message,
    });
  }

  return c.json({
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: `Something wrong on the backend`,
  });
});

app.get('/', (c) => {
  return c.text('OK');
});

export default app;
