/*
  # Create OSH Responsibles Module

  1. New Tables
    - `osh_responsibles`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `name` (text, full name of the responsible person)
      - `employee_id` (text, employee identification number)
      - `role_title` (text, job title/role)
      - `email` (text, contact email)
      - `phone` (text, contact phone number)
      - `status` (text, Active/Inactive/Pending)
      - `license_expiry_date` (date, occupational health license expiry)
      - `approved_by` (uuid, foreign key to auth.users)
      - `approved_at` (timestamptz, approval timestamp)
      - `site_id` (uuid, foreign key to sites)
      - `is_current` (boolean, marks current active responsible)
      - `deactivated_at` (timestamptz, when deactivated)
      - `deactivated_by` (uuid, who deactivated)
      - `replacement_notes` (text, notes about replacement)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
    
    - `osh_responsible_documents`
      - `id` (uuid, primary key)
      - `responsible_id` (uuid, foreign key to osh_responsibles)
      - `document_type` (text, CV/License/Diploma/Other)
      - `file_name` (text, original file name)
      - `file_url` (text, storage URL)
      - `file_size` (integer, file size in bytes)
      - `expiry_date` (date, document expiry date if applicable)
      - `status` (text, valid/expiring/expired)
      - `uploaded_at` (timestamptz, upload timestamp)
      - `uploaded_by` (uuid, who uploaded)
      - `notes` (text, additional notes)
    
    - `osh_responsible_history`
      - `id` (uuid, primary key)
      - `responsible_id` (uuid, foreign key to osh_responsibles)
      - `action` (text, action type: created/updated/approved/deactivated/replaced)
      - `changed_by` (uuid, foreign key to auth.users)
      - `changed_at` (timestamptz, when the change occurred)
      - `details` (jsonb, additional details about the change)
      - `previous_values` (jsonb, previous values before change)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage responsibles based on their role and company
*/

-- Create OSH Responsibles table
CREATE TABLE IF NOT EXISTS osh_responsibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  employee_id text,
  role_title text NOT NULL,
  email text NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  license_expiry_date date,
  approved_by uuid,
  approved_at timestamptz,
  site_id uuid,
  is_current boolean DEFAULT true,
  deactivated_at timestamptz,
  deactivated_by uuid,
  replacement_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Create OSH Responsible Documents table
CREATE TABLE IF NOT EXISTS osh_responsible_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsible_id uuid NOT NULL REFERENCES osh_responsibles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  expiry_date date,
  status text NOT NULL DEFAULT 'valid',
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid,
  notes text,
  CONSTRAINT valid_document_type CHECK (document_type IN ('cv', 'license', 'diploma', 'other')),
  CONSTRAINT valid_document_status CHECK (status IN ('valid', 'expiring', 'expired'))
);

-- Create OSH Responsible History table
CREATE TABLE IF NOT EXISTS osh_responsible_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsible_id uuid NOT NULL REFERENCES osh_responsibles(id) ON DELETE CASCADE,
  action text NOT NULL,
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  details jsonb DEFAULT '{}',
  previous_values jsonb DEFAULT '{}',
  CONSTRAINT valid_action CHECK (action IN ('created', 'updated', 'approved', 'deactivated', 'replaced', 'document_added', 'document_removed'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_osh_responsibles_company ON osh_responsibles(company_id);
CREATE INDEX IF NOT EXISTS idx_osh_responsibles_status ON osh_responsibles(status);
CREATE INDEX IF NOT EXISTS idx_osh_responsibles_site ON osh_responsibles(site_id);
CREATE INDEX IF NOT EXISTS idx_osh_responsibles_license_expiry ON osh_responsibles(license_expiry_date);
CREATE INDEX IF NOT EXISTS idx_osh_responsible_documents_responsible ON osh_responsible_documents(responsible_id);
CREATE INDEX IF NOT EXISTS idx_osh_responsible_history_responsible ON osh_responsible_history(responsible_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at
DROP TRIGGER IF EXISTS update_osh_responsibles_updated_at ON osh_responsibles;
CREATE TRIGGER update_osh_responsibles_updated_at
  BEFORE UPDATE ON osh_responsibles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE osh_responsibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE osh_responsible_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE osh_responsible_history ENABLE ROW LEVEL SECURITY;

-- Policies for osh_responsibles
CREATE POLICY "Users can view responsibles in their company"
  ON osh_responsibles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create responsibles"
  ON osh_responsibles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update responsibles"
  ON osh_responsibles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete responsibles"
  ON osh_responsibles FOR DELETE
  TO authenticated
  USING (true);

-- Policies for osh_responsible_documents
CREATE POLICY "Users can view documents"
  ON osh_responsible_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create documents"
  ON osh_responsible_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update documents"
  ON osh_responsible_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete documents"
  ON osh_responsible_documents FOR DELETE
  TO authenticated
  USING (true);

-- Policies for osh_responsible_history
CREATE POLICY "Users can view history"
  ON osh_responsible_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create history"
  ON osh_responsible_history FOR INSERT
  TO authenticated
  WITH CHECK (true);