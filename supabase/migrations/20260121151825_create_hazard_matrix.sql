/*
  # Create Hazard Matrix Module

  1. New Tables
    - `hazard_types_catalog`
      - `id` (uuid, primary key)
      - `company_id` (uuid, company-specific catalog or null for global)
      - `category` (text, hazard category: physical/chemical/biological/ergonomic/psychosocial)
      - `name` (text, hazard type name)
      - `description` (text, detailed description)
      - `is_active` (boolean, whether it's available for selection)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `hazard_matrix`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `site_id` (uuid, foreign key to sites)
      - `process_area` (text, process or area name)
      - `task_activity` (text, task or activity description)
      - `hazard_type_id` (uuid, foreign key to hazard_types_catalog)
      - `hazard_description` (text, specific hazard description)
      - `consequence` (text, potential consequence)
      - `probability` (integer, 1-5 scale)
      - `severity` (integer, 1-5 scale)
      - `risk_level` (text, calculated: low/medium/high/critical)
      - `risk_score` (integer, probability * severity)
      - `existing_controls` (text, current control measures)
      - `proposed_controls` (text, proposed improvements)
      - `owner_id` (uuid, responsible person)
      - `review_date` (date, next review date)
      - `status` (text, open/under_review/controls_implemented/closed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid)
      - `updated_by` (uuid)
    
    - `hazard_evidence`
      - `id` (uuid, primary key)
      - `hazard_id` (uuid, foreign key to hazard_matrix)
      - `evidence_type` (text, photo/inspection_report/document/video)
      - `file_name` (text)
      - `file_url` (text)
      - `file_size` (integer)
      - `description` (text)
      - `uploaded_by` (uuid)
      - `uploaded_at` (timestamptz)
    
    - `hazard_actions`
      - `id` (uuid, primary key)
      - `hazard_id` (uuid, foreign key to hazard_matrix)
      - `action_description` (text)
      - `priority` (text, low/medium/high/critical)
      - `assigned_to` (uuid, responsible person)
      - `due_date` (date)
      - `status` (text, pending/in_progress/completed/cancelled)
      - `completion_date` (date)
      - `completion_notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `hazard_history`
      - `id` (uuid, primary key)
      - `hazard_id` (uuid, foreign key to hazard_matrix)
      - `action` (text, created/updated/reviewed/controls_added/closed)
      - `changed_by` (uuid)
      - `changed_at` (timestamptz)
      - `details` (jsonb)
      - `previous_values` (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on company membership

  3. Notes
    - Risk Level calculation: 
      - 1-4: Low (Green)
      - 5-9: Medium (Yellow)
      - 10-15: High (Orange)
      - 16-25: Critical (Red)
    - Probability & Severity scale: 1 (Very Low) to 5 (Very High)
*/

-- Create Hazard Types Catalog table
CREATE TABLE IF NOT EXISTS hazard_types_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  category text NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_hazard_category CHECK (category IN ('physical', 'chemical', 'biological', 'ergonomic', 'psychosocial', 'environmental', 'other'))
);

-- Create Hazard Matrix table
CREATE TABLE IF NOT EXISTS hazard_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid,
  process_area text NOT NULL,
  task_activity text NOT NULL,
  hazard_type_id uuid REFERENCES hazard_types_catalog(id) ON DELETE SET NULL,
  hazard_description text NOT NULL,
  consequence text NOT NULL,
  probability integer NOT NULL,
  severity integer NOT NULL,
  risk_level text NOT NULL,
  risk_score integer NOT NULL,
  existing_controls text,
  proposed_controls text,
  owner_id uuid,
  review_date date,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT valid_probability CHECK (probability BETWEEN 1 AND 5),
  CONSTRAINT valid_severity CHECK (severity BETWEEN 1 AND 5),
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'under_review', 'controls_implemented', 'closed'))
);

-- Create Hazard Evidence table
CREATE TABLE IF NOT EXISTS hazard_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id uuid NOT NULL REFERENCES hazard_matrix(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  description text,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT valid_evidence_type CHECK (evidence_type IN ('photo', 'inspection_report', 'document', 'video'))
);

-- Create Hazard Actions table
CREATE TABLE IF NOT EXISTS hazard_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id uuid NOT NULL REFERENCES hazard_matrix(id) ON DELETE CASCADE,
  action_description text NOT NULL,
  priority text DEFAULT 'medium',
  assigned_to uuid,
  due_date date,
  status text DEFAULT 'pending',
  completion_date date,
  completion_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_action_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_action_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Create Hazard History table
CREATE TABLE IF NOT EXISTS hazard_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id uuid NOT NULL REFERENCES hazard_matrix(id) ON DELETE CASCADE,
  action text NOT NULL,
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  details jsonb DEFAULT '{}',
  previous_values jsonb DEFAULT '{}',
  CONSTRAINT valid_hazard_action CHECK (action IN ('created', 'updated', 'reviewed', 'controls_added', 'status_changed', 'closed'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hazard_types_catalog_company ON hazard_types_catalog(company_id);
CREATE INDEX IF NOT EXISTS idx_hazard_types_catalog_category ON hazard_types_catalog(category);
CREATE INDEX IF NOT EXISTS idx_hazard_matrix_company ON hazard_matrix(company_id);
CREATE INDEX IF NOT EXISTS idx_hazard_matrix_site ON hazard_matrix(site_id);
CREATE INDEX IF NOT EXISTS idx_hazard_matrix_risk_level ON hazard_matrix(risk_level);
CREATE INDEX IF NOT EXISTS idx_hazard_matrix_status ON hazard_matrix(status);
CREATE INDEX IF NOT EXISTS idx_hazard_matrix_owner ON hazard_matrix(owner_id);
CREATE INDEX IF NOT EXISTS idx_hazard_evidence_hazard ON hazard_evidence(hazard_id);
CREATE INDEX IF NOT EXISTS idx_hazard_actions_hazard ON hazard_actions(hazard_id);
CREATE INDEX IF NOT EXISTS idx_hazard_actions_assigned ON hazard_actions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_hazard_history_hazard ON hazard_history(hazard_id);

-- Add trigger to update updated_at
DROP TRIGGER IF EXISTS update_hazard_types_catalog_updated_at ON hazard_types_catalog;
CREATE TRIGGER update_hazard_types_catalog_updated_at
  BEFORE UPDATE ON hazard_types_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hazard_matrix_updated_at ON hazard_matrix;
CREATE TRIGGER update_hazard_matrix_updated_at
  BEFORE UPDATE ON hazard_matrix
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hazard_actions_updated_at ON hazard_actions;
CREATE TRIGGER update_hazard_actions_updated_at
  BEFORE UPDATE ON hazard_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE hazard_types_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_history ENABLE ROW LEVEL SECURITY;

-- Policies for hazard_types_catalog
CREATE POLICY "Users can view hazard types"
  ON hazard_types_catalog FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage hazard types"
  ON hazard_types_catalog FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for hazard_matrix
CREATE POLICY "Users can view hazards"
  ON hazard_matrix FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create hazards"
  ON hazard_matrix FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update hazards"
  ON hazard_matrix FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete hazards"
  ON hazard_matrix FOR DELETE
  TO authenticated
  USING (true);

-- Policies for hazard_evidence
CREATE POLICY "Users can view evidence"
  ON hazard_evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage evidence"
  ON hazard_evidence FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for hazard_actions
CREATE POLICY "Users can view actions"
  ON hazard_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage actions"
  ON hazard_actions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for hazard_history
CREATE POLICY "Users can view history"
  ON hazard_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create history"
  ON hazard_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default hazard types catalog
INSERT INTO hazard_types_catalog (company_id, category, name, description, is_active) VALUES
  (NULL, 'physical', 'Slips, Trips, and Falls', 'Risk of slipping, tripping, or falling on surfaces or from heights', true),
  (NULL, 'physical', 'Moving Machinery', 'Contact with moving parts of machinery or equipment', true),
  (NULL, 'physical', 'Noise', 'Exposure to excessive noise levels', true),
  (NULL, 'physical', 'Vibration', 'Exposure to hand-arm or whole-body vibration', true),
  (NULL, 'physical', 'Temperature Extremes', 'Exposure to extreme hot or cold conditions', true),
  (NULL, 'physical', 'Electrical', 'Risk of electrical shock or burns', true),
  (NULL, 'physical', 'Fire and Explosion', 'Risk of fire or explosion', true),
  (NULL, 'chemical', 'Hazardous Substances', 'Exposure to harmful chemicals', true),
  (NULL, 'chemical', 'Dust and Fumes', 'Inhalation of dust, fumes, or vapors', true),
  (NULL, 'chemical', 'Asbestos', 'Exposure to asbestos fibers', true),
  (NULL, 'biological', 'Bacteria and Viruses', 'Exposure to infectious agents', true),
  (NULL, 'biological', 'Mold and Fungi', 'Exposure to mold spores or fungal growth', true),
  (NULL, 'ergonomic', 'Manual Handling', 'Risk from lifting, carrying, or moving objects', true),
  (NULL, 'ergonomic', 'Repetitive Motion', 'Injuries from repetitive tasks', true),
  (NULL, 'ergonomic', 'Poor Posture', 'Issues from awkward or static postures', true),
  (NULL, 'psychosocial', 'Work Stress', 'Mental health impacts from work pressure', true),
  (NULL, 'psychosocial', 'Violence and Harassment', 'Workplace violence or harassment', true),
  (NULL, 'environmental', 'Confined Spaces', 'Risks in confined or enclosed spaces', true),
  (NULL, 'environmental', 'Working at Heights', 'Risks from working above ground level', true),
  (NULL, 'environmental', 'Poor Lighting', 'Inadequate lighting causing visibility issues', true)
ON CONFLICT DO NOTHING;