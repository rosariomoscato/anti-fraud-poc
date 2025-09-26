-- Add user roles and admin functionality
-- This migration adds support for admin users and role management

-- Create user roles table
CREATE TABLE IF NOT EXISTS "user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
	CONSTRAINT "user_role_role_check" CHECK ("role" IN ('user', 'admin', 'investigator'))
);

-- Create unique constraint for user_id
CREATE UNIQUE INDEX IF NOT EXISTS "user_role_user_id_unique" ON "user_role"("user_id");

-- Create admin settings table
CREATE TABLE IF NOT EXISTS "admin_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL UNIQUE,
	"setting_value" json NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS "admin_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" json,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_audit_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Insert default admin user if not exists
-- This will be updated to reference the actual user ID after creation
INSERT INTO "user_role" (id, user_id, role, created_at)
SELECT 
	gen_random_uuid() as id,
	u.id as user_id,
	'admin' as role,
	now() as created_at
FROM "user" u 
WHERE u.email = 'rosariomoscatolab@gmail.com'
AND NOT EXISTS (
	SELECT 1 FROM "user_role" ur 
	WHERE ur.user_id = u.id
)
LIMIT 1;

-- Insert default admin settings
INSERT INTO "admin_settings" (id, setting_key, setting_value, description, updated_at)
VALUES 
	(
		gen_random_uuid(),
		'maintenance_mode',
		'{"enabled": false, "message": "System is under maintenance"}',
		'Maintenance mode settings',
		now()
	),
	(
		gen_random_uuid(),
		'system_settings',
		'{"max_investigators": 10, "auto_assign_investigations": true, "risk_threshold": 70}',
		'System configuration settings',
		now()
	)
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_role_role" ON "user_role"("role");
CREATE INDEX IF NOT EXISTS "idx_admin_audit_admin_id" ON "admin_audit"("admin_id");
CREATE INDEX IF NOT EXISTS "idx_admin_audit_action" ON "admin_audit"("action");
CREATE INDEX IF NOT EXISTS "idx_admin_audit_created_at" ON "admin_audit"("created_at");
CREATE INDEX IF NOT EXISTS "idx_admin_settings_key" ON "admin_settings"("setting_key");