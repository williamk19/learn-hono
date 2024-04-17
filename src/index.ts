import { Hono } from "hono";
import { db } from "./database/connection";
import { users } from "./database/schema/schema";

const app = new Hono();

app.get("/william", async (c) => {
  const result = await db.select().from(users);
  return c.json(result);
});

export default app;
