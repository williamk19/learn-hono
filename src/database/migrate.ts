import 'dotenv/config';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db, client } from './connection';

await migrate(db, { migrationsFolder: './migrations' });

await client.close();