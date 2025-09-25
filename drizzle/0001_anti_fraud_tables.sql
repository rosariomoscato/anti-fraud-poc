-- Migration for Anti-Fraud System Tables
-- This migration creates all tables for the fraud detection system
-- while preserving existing authentication tables

-- Create insurance claims table
CREATE TABLE IF NOT EXISTS "insurance_claim" (
	"id" text PRIMARY KEY NOT NULL,
	"claim_number" text NOT NULL UNIQUE,
	"policy_number" text NOT NULL,
	"claimant_id" text NOT NULL,
	"claimant_name" text NOT NULL,
	"claimant_email" text,
	"claimant_phone" text,
	"incident_date" timestamp NOT NULL,
	"incident_time" text,
	"incident_location" text NOT NULL,
	"incident_city" text NOT NULL,
	"incident_province" text NOT NULL,
	"incident_postal_code" text NOT NULL,
	"incident_country" text DEFAULT 'IT',
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"vehicle_year" integer,
	"vehicle_license_plate" text NOT NULL,
	"vehicle_vin" text,
	"claim_type" text NOT NULL,
	"claim_description" text,
	"estimated_damage" numeric(12, 2),
	"claimed_amount" numeric(12, 2) NOT NULL,
	"claim_status" text DEFAULT 'SUBMITTED',
	"priority_level" text DEFAULT 'MEDIUM',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"submitted_by" text
);

-- Create risk assessment table
CREATE TABLE IF NOT EXISTS "risk_assessment" (
	"id" text PRIMARY KEY NOT NULL,
	"claim_id" text NOT NULL,
	"overall_risk_score" integer NOT NULL,
	"risk_category" text NOT NULL,
	"location_risk_score" integer,
	"time_risk_score" integer,
	"amount_risk_score" integer,
	"history_risk_score" integer,
	"behavior_risk_score" integer,
	"feature_importance" json,
	"model_prediction" json,
	"model_confidence" real,
	"explanation" json,
	"assessment_status" text DEFAULT 'PENDING',
	"review_level" integer DEFAULT 1,
	"assessed_at" timestamp DEFAULT now() NOT NULL,
	"assessed_by" text,
	"next_review_date" timestamp,
	CONSTRAINT "risk_assessment_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "insurance_claim"("id") ON DELETE CASCADE
);

-- Create fraud patterns table
CREATE TABLE IF NOT EXISTS "fraud_pattern" (
	"id" text PRIMARY KEY NOT NULL,
	"pattern_name" text NOT NULL UNIQUE,
	"pattern_description" text,
	"pattern_type" text NOT NULL,
	"detection_rules" json NOT NULL,
	"threshold" numeric(5, 2),
	"detection_count" integer DEFAULT 0,
	"false_positive_rate" real DEFAULT 0.0,
	"true_positive_rate" real DEFAULT 0.0,
	"is_active" boolean DEFAULT true,
	"severity_level" text DEFAULT 'MEDIUM',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text
);

-- Create fraud detection table
CREATE TABLE IF NOT EXISTS "fraud_detection" (
	"id" text PRIMARY KEY NOT NULL,
	"claim_id" text NOT NULL,
	"pattern_id" text,
	"risk_assessment_id" text,
	"detection_type" text NOT NULL,
	"confidence_score" real NOT NULL,
	"detection_strength" text,
	"evidence" json NOT NULL,
	"matched_rules" json,
	"detection_status" text DEFAULT 'DETECTED',
	"is_escalated" boolean DEFAULT false,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	CONSTRAINT "fraud_detection_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "insurance_claim"("id") ON DELETE CASCADE,
	CONSTRAINT "fraud_detection_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "fraud_pattern"("id") ON DELETE SET NULL,
	CONSTRAINT "fraud_detection_risk_assessment_id_fkey" FOREIGN KEY ("risk_assessment_id") REFERENCES "risk_assessment"("id") ON DELETE CASCADE
);

-- Create investigation table
CREATE TABLE IF NOT EXISTS "investigation" (
	"id" text PRIMARY KEY NOT NULL,
	"claim_id" text NOT NULL,
	"risk_assessment_id" text,
	"investigator_id" text,
	"investigation_status" text DEFAULT 'OPEN',
	"priority" text DEFAULT 'MEDIUM',
	"assigned_at" timestamp,
	"started_at" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"findings" json,
	"recommendations" text,
	"final_decision" text,
	"total_hours_spent" real DEFAULT 0.0,
	"documents_reviewed" integer DEFAULT 0,
	"interviews_conducted" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investigation_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "insurance_claim"("id") ON DELETE CASCADE,
	CONSTRAINT "investigation_risk_assessment_id_fkey" FOREIGN KEY ("risk_assessment_id") REFERENCES "risk_assessment"("id") ON DELETE CASCADE
);

-- Create data import table
CREATE TABLE IF NOT EXISTS "data_import" (
	"id" text PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer,
	"import_status" text DEFAULT 'PENDING',
	"processed_records" integer DEFAULT 0,
	"total_records" integer,
	"success_records" integer DEFAULT 0,
	"error_records" integer DEFAULT 0,
	"validation_errors" json,
	"data_quality_score" real,
	"import_configuration" json,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"imported_by" text,
	"completed_at" timestamp,
	"error_message" text
);

-- Create data export table
CREATE TABLE IF NOT EXISTS "data_export" (
	"id" text PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"export_configuration" json NOT NULL,
	"export_query" text,
	"export_status" text DEFAULT 'PENDING',
	"exported_records" integer DEFAULT 0,
	"estimated_records" integer,
	"file_size" integer,
	"download_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"exported_by" text,
	"completed_at" timestamp,
	"expires_at" timestamp
);

-- Create analytics metrics table
CREATE TABLE IF NOT EXISTS "analytics_metric" (
	"id" text PRIMARY KEY NOT NULL,
	"metric_name" text NOT NULL UNIQUE,
	"metric_category" text NOT NULL,
	"metric_value" numeric(12, 2),
	"metric_unit" text,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"dimensions" json,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);

-- Create system audit table
CREATE TABLE IF NOT EXISTS "system_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"user_id" text,
	"user_action" text NOT NULL,
	"old_values" json,
	"new_values" json,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_insurance_claim_claim_number" ON "insurance_claim"("claim_number");
CREATE INDEX IF NOT EXISTS "idx_insurance_claim_claimant_id" ON "insurance_claim"("claimant_id");
CREATE INDEX IF NOT EXISTS "idx_insurance_claim_incident_date" ON "insurance_claim"("incident_date");
CREATE INDEX IF NOT EXISTS "idx_insurance_claim_claim_status" ON "insurance_claim"("claim_status");
CREATE INDEX IF NOT EXISTS "idx_insurance_claim_incident_location" ON "insurance_claim"("incident_city", "incident_province");

CREATE INDEX IF NOT EXISTS "idx_risk_assessment_claim_id" ON "risk_assessment"("claim_id");
CREATE INDEX IF NOT EXISTS "idx_risk_assessment_overall_score" ON "risk_assessment"("overall_risk_score");
CREATE INDEX IF NOT EXISTS "idx_risk_assessment_risk_category" ON "risk_assessment"("risk_category");
CREATE INDEX IF NOT EXISTS "idx_risk_assessment_status" ON "risk_assessment"("assessment_status");

CREATE INDEX IF NOT EXISTS "idx_fraud_detection_claim_id" ON "fraud_detection"("claim_id");
CREATE INDEX IF NOT EXISTS "idx_fraud_detection_confidence" ON "fraud_detection"("confidence_score");
CREATE INDEX IF NOT EXISTS "idx_fraud_detection_status" ON "fraud_detection"("detection_status");
CREATE INDEX IF NOT EXISTS "idx_fraud_detection_detected_at" ON "fraud_detection"("detected_at");

CREATE INDEX IF NOT EXISTS "idx_investigation_claim_id" ON "investigation"("claim_id");
CREATE INDEX IF NOT EXISTS "idx_investigation_status" ON "investigation"("investigation_status");
CREATE INDEX IF NOT EXISTS "idx_investigation_priority" ON "investigation"("priority");

CREATE INDEX IF NOT EXISTS "idx_data_import_status" ON "data_import"("import_status");
CREATE INDEX IF NOT EXISTS "idx_data_import_imported_at" ON "data_import"("imported_at");

CREATE INDEX IF NOT EXISTS "idx_data_export_status" ON "data_export"("export_status");
CREATE INDEX IF NOT EXISTS "idx_data_export_created_at" ON "data_export"("created_at");

CREATE INDEX IF NOT EXISTS "idx_analytics_metric_category" ON "analytics_metric"("metric_category");
CREATE INDEX IF NOT EXISTS "idx_analytics_metric_period" ON "analytics_metric"("period_start", "period_end");

CREATE INDEX IF NOT EXISTS "idx_system_audit_entity" ON "system_audit"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_system_audit_user" ON "system_audit"("user_id");
CREATE INDEX IF NOT EXISTS "idx_system_audit_action" ON "system_audit"("action");
CREATE INDEX IF NOT EXISTS "idx_system_audit_created_at" ON "system_audit"("created_at");

-- Create foreign key constraints for user references
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'insurance_claim_submitted_by_fkey') THEN
        ALTER TABLE "insurance_claim" ADD CONSTRAINT "insurance_claim_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'risk_assessment_assessed_by_fkey') THEN
        ALTER TABLE "risk_assessment" ADD CONSTRAINT "risk_assessment_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fraud_pattern_created_by_fkey') THEN
        ALTER TABLE "fraud_pattern" ADD CONSTRAINT "fraud_pattern_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fraud_detection_reviewed_by_fkey') THEN
        ALTER TABLE "fraud_detection" ADD CONSTRAINT "fraud_detection_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'investigation_investigator_id_fkey') THEN
        ALTER TABLE "investigation" ADD CONSTRAINT "investigation_investigator_id_fkey" FOREIGN KEY ("investigator_id") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'data_import_imported_by_fkey') THEN
        ALTER TABLE "data_import" ADD CONSTRAINT "data_import_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'data_export_exported_by_fkey') THEN
        ALTER TABLE "data_export" ADD CONSTRAINT "data_export_exported_by_fkey" FOREIGN KEY ("exported_by") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'system_audit_user_id_fkey') THEN
        ALTER TABLE "system_audit" ADD CONSTRAINT "system_audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;
    END IF;
END $$;