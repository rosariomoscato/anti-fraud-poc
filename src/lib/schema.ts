import { pgTable, text, timestamp, boolean, integer, numeric, json, real } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Anti-Fraud System Tables

export const insuranceClaim = pgTable("insurance_claim", {
  id: text("id").primaryKey(),
  claimNumber: text("claim_number").notNull().unique(),
  policyNumber: text("policy_number").notNull(),
  claimantId: text("claimant_id").notNull(),
  claimantName: text("claimant_name").notNull(),
  claimantEmail: text("claimant_email"),
  claimantPhone: text("claimant_phone"),
  
  // Incident Details
  incidentDate: timestamp("incident_date").notNull(),
  incidentTime: text("incident_time"),
  incidentLocation: text("incident_location").notNull(),
  incidentCity: text("incident_city").notNull(),
  incidentProvince: text("incident_province").notNull(),
  incidentPostalCode: text("incident_postal_code").notNull(),
  incidentCountry: text("incident_country").default("IT"),
  
  // Vehicle Information
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year"),
  vehicleLicensePlate: text("vehicle_license_plate").notNull(),
  vehicleVin: text("vehicle_vin"),
  
  // Claim Details
  claimType: text("claim_type").notNull(), // COLLISION, THEFT, VANDALISM, NATURAL_DISASTER, OTHER
  claimDescription: text("claim_description"),
  estimatedDamage: numeric("estimated_damage", { precision: 12, scale: 2 }),
  claimedAmount: numeric("claimed_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Claim Status
  claimStatus: text("claim_status").default("SUBMITTED"), // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, UNDER_INVESTIGATION
  priorityLevel: text("priority_level").default("MEDIUM"), // LOW, MEDIUM, HIGH, URGENT
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  submittedBy: text("submitted_by").references(() => user.id),
});

export const riskAssessment = pgTable("risk_assessment", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull().references(() => insuranceClaim.id, { onDelete: "cascade" }),
  
  // Risk Score
  overallRiskScore: integer("overall_risk_score").notNull(), // 1-100
  riskCategory: text("risk_category").notNull(), // LOW, MEDIUM, HIGH
  
  // Individual Risk Factors
  locationRiskScore: integer("location_risk_score"), // 1-100
  timeRiskScore: integer("time_risk_score"), // 1-100
  amountRiskScore: integer("amount_risk_score"), // 1-100
  historyRiskScore: integer("history_risk_score"), // 1-100
  behaviorRiskScore: integer("behavior_risk_score"), // 1-100
  
  // Feature Importance
  featureImportance: json("feature_importance"), // JSON object with feature weights
  
  // ML Model Predictions
  modelPrediction: json("model_prediction"), // Individual model predictions
  modelConfidence: real("model_confidence"), // 0.0-1.0
  
  // Explainable AI
  explanation: json("explanation"), // Detailed explanation of the risk assessment
  
  // Status
  assessmentStatus: text("assessment_status").default("PENDING"), // PENDING, COMPLETED, REVIEWED, ESCALATED
  reviewLevel: integer("review_level").default(1), // 1=auto, 2=supervisor, 3=expert
  
  // Metadata
  assessedAt: timestamp("assessed_at").notNull().defaultNow(),
  assessedBy: text("assessed_by").references(() => user.id),
  nextReviewDate: timestamp("next_review_date"),
});

export const fraudPattern = pgTable("fraud_pattern", {
  id: text("id").primaryKey(),
  patternName: text("pattern_name").notNull().unique(),
  patternDescription: text("pattern_description"),
  patternType: text("pattern_type").notNull(), // GEOGRAPHIC, TEMPORAL, BEHAVIORAL, FINANCIAL, NETWORK
  
  // Pattern Detection Rules
  detectionRules: json("detection_rules").notNull(), // JSON array of detection rules
  threshold: numeric("threshold", { precision: 5, scale: 2 }), // Confidence threshold for this pattern
  
  // Pattern Statistics
  detectionCount: integer("detection_count").default(0),
  falsePositiveRate: real("false_positive_rate").default(0.0),
  truePositiveRate: real("true_positive_rate").default(0.0),
  
  // Status
  isActive: boolean("is_active").default(true),
  severityLevel: text("severity_level").default("MEDIUM"), // LOW, MEDIUM, HIGH, CRITICAL
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: text("created_by").references(() => user.id),
});

export const fraudDetection = pgTable("fraud_detection", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull().references(() => insuranceClaim.id, { onDelete: "cascade" }),
  patternId: text("pattern_id").references(() => fraudPattern.id, { onDelete: "set null" }),
  riskAssessmentId: text("risk_assessment_id").references(() => riskAssessment.id, { onDelete: "cascade" }),
  
  // Detection Details
  detectionType: text("detection_type").notNull(), // RULE_BASED, ML_BASED, HYBRID
  confidenceScore: real("confidence_score").notNull(), // 0.0-1.0
  detectionStrength: text("detection_strength"), // WEAK, MODERATE, STRONG
  
  // Detection Evidence
  evidence: json("evidence").notNull(), // JSON object with detection evidence
  matchedRules: json("matched_rules"), // Array of matched rule descriptions
  
  // Status
  detectionStatus: text("detection_status").default("DETECTED"), // DETECTED, REVIEWED, CONFIRMED, FALSE_POSITIVE
  isEscalated: boolean("is_escalated").default(false),
  
  // Metadata
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => user.id),
});

export const investigation = pgTable("investigation", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull().references(() => insuranceClaim.id, { onDelete: "cascade" }),
  riskAssessmentId: text("risk_assessment_id").references(() => riskAssessment.id, { onDelete: "cascade" }),
  
  // Investigation Details
  investigatorId: text("investigator_id").references(() => user.id),
  investigationStatus: text("investigation_status").default("OPEN"), // OPEN, IN_PROGRESS, PENDING_REVIEW, CLOSED, ESCALATED
  priority: text("priority").default("MEDIUM"), // LOW, MEDIUM, HIGH, URGENT
  
  // Investigation Timeline
  assignedAt: timestamp("assigned_at"),
  startedAt: timestamp("started_at"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  
  // Investigation Results
  findings: json("findings"), // JSON object with investigation findings
  recommendations: text("recommendations"),
  finalDecision: text("final_decision"), // APPROVED, REJECTED, ESCALATED
  
  // Investigation Metrics
  totalHoursSpent: real("total_hours_spent").default(0.0),
  documentsReviewed: integer("documents_reviewed").default(0),
  interviewsConducted: integer("interviews_conducted").default(0),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dataImport = pgTable("data_import", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // CSV, JSON, PARQUET
  fileSize: integer("file_size"), // in bytes
  
  // Import Status
  importStatus: text("import_status").default("PENDING"), // PENDING, PROCESSING, COMPLETED, FAILED, PARTIAL
  processedRecords: integer("processed_records").default(0),
  totalRecords: integer("total_records"),
  successRecords: integer("success_records").default(0),
  errorRecords: integer("error_records").default(0),
  
  // Data Quality
  validationErrors: json("validation_errors"), // Array of validation errors
  dataQualityScore: real("data_quality_score"), // 0.0-1.0
  
  // Import Configuration
  importConfiguration: json("import_configuration"), // Import settings and mappings
  
  // Metadata
  importedAt: timestamp("imported_at").notNull().defaultNow(),
  importedBy: text("imported_by").references(() => user.id),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
});

export const dataExport = pgTable("data_export", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // CSV, JSON, PARQUET
  
  // Export Configuration
  exportConfiguration: json("export_configuration").notNull(), // Export filters and settings
  exportQuery: text("export_query"), // SQL query used for export
  
  // Export Status
  exportStatus: text("export_status").default("PENDING"), // PENDING, PROCESSING, COMPLETED, FAILED
  exportedRecords: integer("exported_records").default(0),
  estimatedRecords: integer("estimated_records"),
  
  // File Information
  fileSize: integer("file_size"), // in bytes
  downloadUrl: text("download_url"), // Temporary download URL
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  exportedBy: text("exported_by").references(() => user.id),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"), // For download URL expiration
});

export const analyticsMetric = pgTable("analytics_metric", {
  id: text("id").primaryKey(),
  metricName: text("metric_name").notNull().unique(),
  metricCategory: text("metric_category").notNull(), // RISK_SCORE, CLAIM_VOLUME, DETECTION_RATE, INVESTIGATION_TIME
  
  // Metric Value
  metricValue: numeric("metric_value", { precision: 12, scale: 2 }),
  metricUnit: text("metric_unit"), // percentage, currency, count, etc.
  
  // Time Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Dimensions
  dimensions: json("dimensions"), // JSON object with dimension filters
  
  // Metadata
  calculatedAt: timestamp("calculated_at").notNull().defaultNow(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const systemAudit = pgTable("system_audit", {
  id: text("id").primaryKey(),
  action: text("action").notNull(), // CREATE, READ, UPDATE, DELETE
  entityType: text("entity_type").notNull(), // CLAIM, ASSESSMENT, INVESTIGATION, etc.
  entityId: text("entity_id").notNull(),
  
  // User Information
  userId: text("user_id").references(() => user.id),
  userAction: text("user_action").notNull(), // Specific action performed
  
  // Change Details
  oldValues: json("old_values"), // Previous values (for updates)
  newValues: json("new_values"), // New values (for creates/updates)
  
  // Request Information
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin and User Management Tables

export const userRole = pgTable("user_role", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("user"), // user, admin, investigator
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").references(() => user.id),
});

export const adminSettings = pgTable("admin_settings", {
  id: text("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: json("setting_value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by").references(() => user.id),
});

export const adminAudit = pgTable("admin_audit", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type definitions for better TypeScript support
export type InsuranceClaim = typeof insuranceClaim.$inferSelect;
export type NewInsuranceClaim = typeof insuranceClaim.$inferInsert;
export type RiskAssessment = typeof riskAssessment.$inferSelect;
export type NewRiskAssessment = typeof riskAssessment.$inferInsert;
export type FraudPattern = typeof fraudPattern.$inferSelect;
export type NewFraudPattern = typeof fraudPattern.$inferInsert;
export type FraudDetection = typeof fraudDetection.$inferSelect;
export type NewFraudDetection = typeof fraudDetection.$inferInsert;
export type Investigation = typeof investigation.$inferSelect;
export type NewInvestigation = typeof investigation.$inferInsert;
export type DataImport = typeof dataImport.$inferSelect;
export type NewDataImport = typeof dataImport.$inferInsert;
export type DataExport = typeof dataExport.$inferSelect;
export type NewDataExport = typeof dataExport.$inferInsert;
export type AnalyticsMetric = typeof analyticsMetric.$inferSelect;
export type NewAnalyticsMetric = typeof analyticsMetric.$inferInsert;
export type SystemAudit = typeof systemAudit.$inferSelect;
export type NewSystemAudit = typeof systemAudit.$inferInsert;
export type UserRole = typeof userRole.$inferSelect;
export type NewUserRole = typeof userRole.$inferInsert;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type NewAdminSettings = typeof adminSettings.$inferInsert;
export type AdminAudit = typeof adminAudit.$inferSelect;
export type NewAdminAudit = typeof adminAudit.$inferInsert;
