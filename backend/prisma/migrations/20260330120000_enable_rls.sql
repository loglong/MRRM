-- Enable Row-Level Security on all tenant-aware tables
-- This migration enables PostgreSQL RLS for database-level tenant isolation

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_patients ON patients;
CREATE POLICY tenant_isolation_patients ON patients
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on demands table
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_demands ON demands;
CREATE POLICY tenant_isolation_demands ON demands
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on paths table
ALTER TABLE paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_paths ON paths;
CREATE POLICY tenant_isolation_paths ON paths
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on path_steps table
ALTER TABLE path_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_path_steps ON path_steps;
CREATE POLICY tenant_isolation_path_steps ON path_steps
  FOR ALL
  USING (path_id IN (SELECT id FROM paths WHERE org_id = current_setting('app.current_org_id', true)::uuid));

-- Enable RLS on touchpoints table
ALTER TABLE touchpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_touchpoints ON touchpoints;
CREATE POLICY tenant_isolation_touchpoints ON touchpoints
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on followup_plans table
ALTER TABLE followup_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_followup_plans ON followup_plans;
CREATE POLICY tenant_isolation_followup_plans ON followup_plans
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on followup_records table
ALTER TABLE followup_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_followup_records ON followup_records;
CREATE POLICY tenant_isolation_followup_records ON followup_records
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on journey_milestones table
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_journey_milestones ON journey_milestones;
CREATE POLICY tenant_isolation_journey_milestones ON journey_milestones
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_roles ON roles;
CREATE POLICY tenant_isolation_roles ON roles
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- Force RLS for table owner as well (important for Prisma)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE patients FORCE ROW LEVEL SECURITY;
ALTER TABLE demands FORCE ROW LEVEL SECURITY;
ALTER TABLE paths FORCE ROW LEVEL SECURITY;
ALTER TABLE path_steps FORCE ROW LEVEL SECURITY;
ALTER TABLE touchpoints FORCE ROW LEVEL SECURITY;
ALTER TABLE followup_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE followup_records FORCE ROW LEVEL SECURITY;
ALTER TABLE journey_milestones FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
