ALTER TABLE roles ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE users ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE users_to_roles ADD `deleted_at` text;