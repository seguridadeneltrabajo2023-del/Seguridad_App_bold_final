/*
  # Create Trainings Module

  1. New Tables
    - `trainings`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `site_id` (uuid, foreign key)
      - `topic` (text, training topic)
      - `objective` (text, training objective)
      - `training_date` (date)
      - `training_time` (time)
      - `duration_hours` (numeric, duration in hours)
      - `location` (text, physical location)
      - `instructor` (text, instructor name)
      - `instructor_credentials` (text)
      - `training_type` (text, safety/technical/compliance/other)
      - `status` (text, scheduled/in_progress/done/closed)
      - `min_attendance_required` (integer, percentage)
      - `requires_signature` (boolean)
      - `requires_certificate` (boolean)
      - `qr_code` (text, unique QR code for check-in)
      - `created_by` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `closed_at` (timestamptz)
      - `closed_by` (uuid)
    
    - `training_participants`
      - `id` (uuid, primary key)
      - `training_id` (uuid, foreign key)
      - `worker_id` (uuid)
      - `worker_name` (text)
      - `worker_email` (text)
      - `job_role` (text)
      - `attendance_status` (text, invited/confirmed/attended/absent/excused)
      - `check_in_time` (timestamptz)
      - `check_in_method` (text, manual/qr_code/signature_pad)
      - `signature_data` (text, base64 signature image)
      - `signature_timestamp` (timestamptz)
      - `signature_ip` (text)
      - `certificate_issued` (boolean)
      - `certificate_issued_at` (timestamptz)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `training_materials`
      - `id` (uuid, primary key)
      - `training_id` (uuid, foreign key)
      - `material_type` (text, presentation/document/video/reference)
      - `file_name` (text)
      - `file_url` (text)
      - `file_size` (integer)
      - `description` (text)
      - `uploaded_by` (uuid)
      - `uploaded_at` (timestamptz)
    
    - `training_evidence`
      - `id` (uuid, primary key)
      - `training_id` (uuid, foreign key)
      - `evidence_type` (text, photo/attendance_sheet/minutes/evaluation/certificate)
      - `file_name` (text)
      - `file_url` (text)
      - `file_size` (integer)
      - `description` (text)
      - `is_mandatory` (boolean)
      - `uploaded_by` (uuid)
      - `uploaded_at` (timestamptz)
    
    - `training_evaluations`
      - `id` (uuid, primary key)
      - `training_id` (uuid, foreign key)
      - `participant_id` (uuid, foreign key to training_participants)
      - `score` (numeric, evaluation score)
      - `max_score` (numeric)
      - `passed` (boolean)
      - `feedback` (text)
      - `evaluated_at` (timestamptz)
      - `evaluated_by` (uuid)
    
    - `training_certificates`
      - `id` (uuid, primary key)
      - `training_id` (uuid, foreign key)
      - `participant_id` (uuid, foreign key to training_participants)
      - `certificate_number` (text, unique)
      - `issued_date` (date)
      - `expiry_date` (date)
      - `valid_hours` (numeric, training credit hours)
      - `certificate_url` (text)
      - `verification_code` (text)
      - `issued_by` (uuid)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Notes
    - Status flow: scheduled → in_progress → done → closed
    - QR code generated automatically for each training
    - Signatures stored as base64 encoded images
    - Certificates generated after training completion
    - Attendance tracking supports manual entry, QR check-in, and signature pad
*/

-- Create Trainings table
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid,
  topic text NOT NULL,
  objective text,
  training_date date NOT NULL,
  training_time time NOT NULL,
  duration_hours numeric DEFAULT 1.0,
  location text,
  instructor text NOT NULL,
  instructor_credentials text,
  training_type text DEFAULT 'safety',
  status text DEFAULT 'scheduled',
  min_attendance_required integer DEFAULT 80,
  requires_signature boolean DEFAULT true,
  requires_certificate boolean DEFAULT false,
  qr_code text UNIQUE,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  closed_by uuid,
  CONSTRAINT valid_training_type CHECK (training_type IN ('safety', 'technical', 'compliance', 'leadership', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'in_progress', 'done', 'closed', 'cancelled'))
);

-- Create Training Participants table
CREATE TABLE IF NOT EXISTS training_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  worker_id uuid,
  worker_name text NOT NULL,
  worker_email text,
  job_role text,
  attendance_status text DEFAULT 'invited',
  check_in_time timestamptz,
  check_in_method text,
  signature_data text,
  signature_timestamp timestamptz,
  signature_ip text,
  certificate_issued boolean DEFAULT false,
  certificate_issued_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_attendance_status CHECK (attendance_status IN ('invited', 'confirmed', 'attended', 'absent', 'excused')),
  CONSTRAINT valid_check_in_method CHECK (check_in_method IS NULL OR check_in_method IN ('manual', 'qr_code', 'signature_pad'))
);

-- Create Training Materials table
CREATE TABLE IF NOT EXISTS training_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  material_type text DEFAULT 'document',
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  description text,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT valid_material_type CHECK (material_type IN ('presentation', 'document', 'video', 'reference', 'handout'))
);

-- Create Training Evidence table
CREATE TABLE IF NOT EXISTS training_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  description text,
  is_mandatory boolean DEFAULT false,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT valid_evidence_type CHECK (evidence_type IN ('photo', 'attendance_sheet', 'minutes', 'evaluation', 'certificate', 'other'))
);

-- Create Training Evaluations table
CREATE TABLE IF NOT EXISTS training_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES training_participants(id) ON DELETE CASCADE,
  score numeric,
  max_score numeric DEFAULT 100,
  passed boolean DEFAULT false,
  feedback text,
  evaluated_at timestamptz DEFAULT now(),
  evaluated_by uuid
);

-- Create Training Certificates table
CREATE TABLE IF NOT EXISTS training_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES training_participants(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  issued_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  valid_hours numeric,
  certificate_url text,
  verification_code text UNIQUE,
  issued_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trainings_company ON trainings(company_id);
CREATE INDEX IF NOT EXISTS idx_trainings_site ON trainings(site_id);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(training_date);
CREATE INDEX IF NOT EXISTS idx_trainings_qr ON trainings(qr_code);
CREATE INDEX IF NOT EXISTS idx_training_participants_training ON training_participants(training_id);
CREATE INDEX IF NOT EXISTS idx_training_participants_worker ON training_participants(worker_id);
CREATE INDEX IF NOT EXISTS idx_training_participants_attendance ON training_participants(attendance_status);
CREATE INDEX IF NOT EXISTS idx_training_materials_training ON training_materials(training_id);
CREATE INDEX IF NOT EXISTS idx_training_evidence_training ON training_evidence(training_id);
CREATE INDEX IF NOT EXISTS idx_training_evaluations_training ON training_evaluations(training_id);
CREATE INDEX IF NOT EXISTS idx_training_certificates_training ON training_certificates(training_id);
CREATE INDEX IF NOT EXISTS idx_training_certificates_verification ON training_certificates(verification_code);

-- Function to generate QR code identifier
CREATE OR REPLACE FUNCTION generate_training_qr_code()
RETURNS text AS $$
DECLARE
  qr_code text;
BEGIN
  qr_code := 'TRN-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 12));
  RETURN qr_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate QR code
CREATE OR REPLACE FUNCTION set_training_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := generate_training_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_training_qr_code ON trainings;
CREATE TRIGGER trigger_set_training_qr_code
  BEFORE INSERT ON trainings
  FOR EACH ROW
  EXECUTE FUNCTION set_training_qr_code();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS text AS $$
DECLARE
  cert_number text;
BEGIN
  cert_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('certificate_seq')::TEXT, 6, '0');
  RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for certificate numbers
CREATE SEQUENCE IF NOT EXISTS certificate_seq START 1;

-- Add update triggers
DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON trainings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_participants_updated_at ON training_participants;
CREATE TRIGGER update_training_participants_updated_at
  BEFORE UPDATE ON training_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_certificates ENABLE ROW LEVEL SECURITY;

-- Policies for trainings
CREATE POLICY "Users can view trainings"
  ON trainings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create trainings"
  ON trainings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update trainings"
  ON trainings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete trainings"
  ON trainings FOR DELETE
  TO authenticated
  USING (true);

-- Policies for training_participants
CREATE POLICY "Users can view participants"
  ON training_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage participants"
  ON training_participants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for training_materials
CREATE POLICY "Users can view materials"
  ON training_materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage materials"
  ON training_materials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for training_evidence
CREATE POLICY "Users can view evidence"
  ON training_evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage evidence"
  ON training_evidence FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for training_evaluations
CREATE POLICY "Users can view evaluations"
  ON training_evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage evaluations"
  ON training_evaluations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for training_certificates
CREATE POLICY "Users can view certificates"
  ON training_certificates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage certificates"
  ON training_certificates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);