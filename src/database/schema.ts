import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username', { length: 16 }).notNull().unique(),
  password: text('password', { length: 64 }).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  deleted_at: text('deleted_at'),
});

export const usersRelation = relations(users, ({ many }) => ({
  roles: many(usersToRoles),
  tasks: many(tasks),
}));

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  deleted_at: text('deleted_at'),
});

export const groupsRelations = relations(roles, ({ many }) => ({
  users: many(usersToRoles),
}));

export const usersToRoles = sqliteTable('users_to_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id),
  deleted_at: text('deleted_at'),
});

export const usersToGroupsRelations = relations(usersToRoles, ({ one }) => ({
  role: one(roles, {
    fields: [usersToRoles.roleId],
    references: [roles.id],
  }),
  user: one(users, {
    fields: [usersToRoles.userId],
    references: [users.id],
  }),
}));

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title', { length: 64 }).notNull(),
  description: text('description'),
  status: text('status', { enum: ['TODO', 'IN_PROGRESS', 'DONE'] }).notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
});

export const tasksRelation = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
