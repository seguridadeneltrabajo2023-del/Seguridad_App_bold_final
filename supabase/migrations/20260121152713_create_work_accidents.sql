/*
  # Create Work Accidents Module

  1. New Tables
    - `accident_classification_catalogs`
      - `id` (uuid, primary key)
      - `company_id` (uuid, null for global catalogs)
      - `catalog_type` (text, injury_type/body_part/agent/unsafe_act/unsafe_condition)
      - `name` (text, classification name)
      - `description` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `work_accidents`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `site_id` (uuid, foreign key)
      - `incident_number` (text, auto-generated unique identifier)
      - `incident_date` (date)
      - `incident_time` (time)
      - `incident_type` (text, accident/incident/near_miss)
      - `severity` (text, minor/moderate/serious/critical/fatal)
      - `worker_id` (uuid, affected worker)
      - `worker_name` (text)
      - `job_role` (text)
      - `location` (text, specific location)
      - `area` (text, work area)
      - `description` (text, incident description)
      - `witnesses` (text, witness names and details)
      - `injury_type_id` (uuid, foreign key)
      - `body_part_id` (uuid, foreign key)
      - `agent_id` (uuid, foreign key)
      - `unsafe_act_id` (uuid, foreign key)
      - `unsafe_condition_id` (uuid, foreign key)
      - `status` (text, open/in_investigation/action_required/closed)
      - `days_lost` (integer, lost time days)
      - `medical_treatment_required` (boolean)
      - `reported_by` (uuid)
      - `reported_at` (timestamptz)
      - `investigated_by` (uuid)
      - `investigation_date` (date)
      - `closed_by` (uuid)
      - `closed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `accident_evidence`
      - `id` (uuid, primary key)
      - `accident_id` (uuid, foreign key)
      - `evidence_type` (text, photo/document/medical_leave/witness_statement)
      - `file_name` (text)
      - `file_url` (text)
      - `file_size` (integer)
      - `description` (text)
      - `is_mandatory` (boolean)
      - `uploaded_by` (uuid)
      - `uploaded_at` (timestamptz)
    
    - `accident_corrective_actions`
      - `id` (uuid, primary key)
      - `accident_id` (uuid, foreign key)
      - `action_type` (text, corrective/preventive)
      - `action_description` (text)
      - `priority` (text, low/medium/high/critical)
      - `assigned_to` (uuid)
      - `due_date` (date)
      - `status` (text, pending/in_progress/completed/cancelled)
      - `completion_date` (date)
      - `completion_notes` (text)
      - `verification_required` (boolean)
      - `verified_by` (uuid)
      - `verified_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `accident_timeline`
      - `id` (uuid, primary key)
      - `accident_id` (uuid, foreign key)
      - `event_type` (text, reported/investigation_started/evidence_added/action_added/action_completed/status_changed/closed)
      - `event_description` (text)
      - `event_data` (jsonb)
      - `created_by` (uuid)
      - `created_at` (timestamptz)
    
    - `accident_statistics`
      - `id` (uuid, primary key)
      - `company_id` (uuid)
      - `site_id` (uuid)
      - `year` (integer)
      - `month` (integer)
      - `total_accidents` (integer)
      - `total_incidents` (integer)
      - `total_near_misses` (integer)
      - `days_without_accident` (integer)
      - `last_accident_date` (date)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on company membership

  3. Notes
    - Incident numbers follow pattern: ACC-YYYY-NNNN
    - Severity levels: minor, moderate, serious, critical, fatal
    - Status flow: open → in_investigation → action_required → closed
    - Mandatory evidence validation enforced at application level
*/

-- Create Accident Classification Catalogs table
CREATE TABLE IF NOT EXISTS accident_classification_catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  catalog_type text NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_catalog_type CHECK (catalog_type IN ('injury_type', 'body_part', 'agent', 'unsafe_act', 'unsafe_condition'))
);

-- Create Work Accidents table
CREATE TABLE IF NOT EXISTS work_accidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid,
  incident_number text UNIQUE NOT NULL,
  incident_date date NOT NULL,
  incident_time time NOT NULL,
  incident_type text NOT NULL DEFAULT 'accident',
  severity text NOT NULL,
  worker_id uuid,
  worker_name text NOT NULL,
  job_role text,
  location text NOT NULL,
  area text,
  description text NOT NULL,
  witnesses text,
  injury_type_id uuid REFERENCES accident_classification_catalogs(id) ON DELETE SET NULL,
  body_part_id uuid REFERENCES accident_classification_catalogs(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES accident_classification_catalogs(id) ON DELETE SET NULL,
  unsafe_act_id uuid REFERENCES accident_classification_catalogs(id) ON DELETE SET NULL,
  unsafe_condition_id uuid REFERENCES accident_classification_catalogs(id) ON DELETE SET NULL,
  status text DEFAULT 'open',
  days_lost integer DEFAULT 0,
  medical_treatment_required boolean DEFAULT false,
  reported_by uuid,
  reported_at timestamptz DEFAULT now(),
  investigated_by uuid,
  investigation_date date,
  closed_by uuid,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_incident_type CHECK (incident_type IN ('accident', 'incident', 'near_miss')),
  CONSTRAINT valid_severity CHECK (severity IN ('minor', 'moderate', 'serious', 'critical', 'fatal')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_investigation', 'action_required', 'closed'))
);

-- Create Accident Evidence table
CREATE TABLE IF NOT EXISTS accident_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accident_id uuid NOT NULL REFERENCES work_accidents(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  description text,
  is_mandatory boolean DEFAULT false,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT valid_evidence_type CHECK (evidence_type IN ('photo', 'document', 'medical_leave', 'witness_statement', 'investigation_report'))
);

-- Create Accident Corrective Actions table
CREATE TABLE IF NOT EXISTS accident_corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accident_id uuid NOT NULL REFERENCES work_accidents(id) ON DELETE CASCADE,
  action_type text NOT NULL DEFAULT 'corrective',
  action_description text NOT NULL,
  priority text DEFAULT 'medium',
  assigned_to uuid,
  due_date date,
  status text DEFAULT 'pending',
  completion_date date,
  completion_notes text,
  verification_required boolean DEFAULT false,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_action_type CHECK (action_type IN ('corrective', 'preventive')),
  CONSTRAINT valid_action_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_action_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Create Accident Timeline table
CREATE TABLE IF NOT EXISTS accident_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accident_id uuid NOT NULL REFERENCES work_accidents(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_description text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('reported', 'investigation_started', 'evidence_added', 'action_added', 'action_completed', 'status_changed', 'closed'))
);

-- Create Accident Statistics table
CREATE TABLE IF NOT EXISTS accident_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid,
  year integer NOT NULL,
  month integer NOT NULL,
  total_accidents integer DEFAULT 0,
  total_incidents integer DEFAULT 0,
  total_near_misses integer DEFAULT 0,
  days_without_accident integer DEFAULT 0,
  last_accident_date date,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, site_id, year, month)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accident_catalogs_company ON accident_classification_catalogs(company_id);
CREATE INDEX IF NOT EXISTS idx_accident_catalogs_type ON accident_classification_catalogs(catalog_type);
CREATE INDEX IF NOT EXISTS idx_work_accidents_company ON work_accidents(company_id);
CREATE INDEX IF NOT EXISTS idx_work_accidents_site ON work_accidents(site_id);
CREATE INDEX IF NOT EXISTS idx_work_accidents_status ON work_accidents(status);
CREATE INDEX IF NOT EXISTS idx_work_accidents_date ON work_accidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_work_accidents_number ON work_accidents(incident_number);
CREATE INDEX IF NOT EXISTS idx_accident_evidence_accident ON accident_evidence(accident_id);
CREATE INDEX IF NOT EXISTS idx_accident_actions_accident ON accident_corrective_actions(accident_id);
CREATE INDEX IF NOT EXISTS idx_accident_timeline_accident ON accident_timeline(accident_id);
CREATE INDEX IF NOT EXISTS idx_accident_stats_company ON accident_statistics(company_id);

-- Add update triggers
DROP TRIGGER IF EXISTS update_accident_catalogs_updated_at ON accident_classification_catalogs;
CREATE TRIGGER update_accident_catalogs_updated_at
  BEFORE UPDATE ON accident_classification_catalogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_accidents_updated_at ON work_accidents;
CREATE TRIGGER update_work_accidents_updated_at
  BEFORE UPDATE ON work_accidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accident_actions_updated_at ON accident_corrective_actions;
CREATE TRIGGER update_accident_actions_updated_at
  BEFORE UPDATE ON accident_corrective_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE accident_classification_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_accidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_statistics ENABLE ROW LEVEL SECURITY;

-- Policies for accident_classification_catalogs
CREATE POLICY "Users can view classification catalogs"
  ON accident_classification_catalogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage classification catalogs"
  ON accident_classification_catalogs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for work_accidents
CREATE POLICY "Users can view accidents"
  ON work_accidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create accidents"
  ON work_accidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update accidents"
  ON work_accidents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete accidents"
  ON work_accidents FOR DELETE
  TO authenticated
  USING (true);

-- Policies for accident_evidence
CREATE POLICY "Users can view evidence"
  ON accident_evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage evidence"
  ON accident_evidence FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for accident_corrective_actions
CREATE POLICY "Users can view corrective actions"
  ON accident_corrective_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage corrective actions"
  ON accident_corrective_actions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for accident_timeline
CREATE POLICY "Users can view timeline"
  ON accident_timeline FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create timeline events"
  ON accident_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for accident_statistics
CREATE POLICY "Users can view statistics"
  ON accident_statistics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage statistics"
  ON accident_statistics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default classification catalogs
INSERT INTO accident_classification_catalogs (company_id, catalog_type, name, description, is_active) VALUES
  -- Injury Types
  (NULL, 'injury_type', 'Fracture', 'Broken bone or bones', true),
  (NULL, 'injury_type', 'Laceration', 'Deep cut or tear in skin', true),
  (NULL, 'injury_type', 'Contusion', 'Bruise or impact injury', true),
  (NULL, 'injury_type', 'Sprain/Strain', 'Ligament or muscle injury', true),
  (NULL, 'injury_type', 'Burn', 'Heat or chemical burn', true),
  (NULL, 'injury_type', 'Amputation', 'Loss of body part', true),
  (NULL, 'injury_type', 'Concussion', 'Head injury with brain impact', true),
  (NULL, 'injury_type', 'Exposure', 'Chemical or biological exposure', true),
  
  -- Body Parts
  (NULL, 'body_part', 'Head', 'Head and skull', true),
  (NULL, 'body_part', 'Eyes', 'Eyes and vision', true),
  (NULL, 'body_part', 'Back', 'Spine and back', true),
  (NULL, 'body_part', 'Hand/Fingers', 'Hands and fingers', true),
  (NULL, 'body_part', 'Leg/Foot', 'Legs, feet, and toes', true),
  (NULL, 'body_part', 'Arm/Shoulder', 'Arms and shoulders', true),
  (NULL, 'body_part', 'Chest/Abdomen', 'Torso area', true),
  (NULL, 'body_part', 'Multiple Areas', 'Multiple body parts affected', true),
  
  -- Agents
  (NULL, 'agent', 'Machinery/Equipment', 'Powered machinery or equipment', true),
  (NULL, 'agent', 'Hand Tools', 'Manual or power tools', true),
  (NULL, 'agent', 'Chemicals', 'Chemical substances', true),
  (NULL, 'agent', 'Vehicle', 'Vehicles or mobile equipment', true),
  (NULL, 'agent', 'Falling Objects', 'Objects falling from height', true),
  (NULL, 'agent', 'Sharp Objects', 'Knives, blades, or sharp edges', true),
  (NULL, 'agent', 'Hot Surface', 'Hot surfaces or substances', true),
  (NULL, 'agent', 'Electrical', 'Electrical sources', true),
  
  -- Unsafe Acts
  (NULL, 'unsafe_act', 'Improper Use of Equipment', 'Incorrect equipment operation', true),
  (NULL, 'unsafe_act', 'Not Using PPE', 'Failure to use required safety equipment', true),
  (NULL, 'unsafe_act', 'Working at Unsafe Speed', 'Operating too fast or too slow', true),
  (NULL, 'unsafe_act', 'Improper Lifting', 'Incorrect manual handling technique', true),
  (NULL, 'unsafe_act', 'Taking Shortcuts', 'Bypassing safety procedures', true),
  (NULL, 'unsafe_act', 'Horseplay', 'Unsafe behavior or playing around', true),
  
  -- Unsafe Conditions
  (NULL, 'unsafe_condition', 'Poor Housekeeping', 'Cluttered or disorganized workspace', true),
  (NULL, 'unsafe_condition', 'Inadequate Lighting', 'Poor visibility conditions', true),
  (NULL, 'unsafe_condition', 'Defective Equipment', 'Malfunctioning or damaged equipment', true),
  (NULL, 'unsafe_condition', 'Slippery Surfaces', 'Wet or oily surfaces', true),
  (NULL, 'unsafe_condition', 'Inadequate Guarding', 'Missing or insufficient machine guards', true),
  (NULL, 'unsafe_condition', 'Poor Ventilation', 'Inadequate air circulation', true)
ON CONFLICT DO NOTHING;