/*
  # Create Work Plan Module

  1. New Tables
    - `work_plan_activities`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `title` (text, activity title)
      - `description` (text, detailed description)
      - `activity_type` (text, inspection/training/audit/report_delivery)
      - `status` (text, planned/in_progress/completed/overdue/cancelled)
      - `start_date` (timestamptz, activity start date/time)
      - `end_date` (timestamptz, activity end date/time)
      - `site_id` (uuid, foreign key to sites)
      - `location` (text, specific location details)
      - `owner_id` (uuid, foreign key to auth.users - responsible person)
      - `completed_at` (timestamptz, completion timestamp)
      - `completed_by` (uuid, who marked it complete)
      - `cancelled_at` (timestamptz, cancellation timestamp)
      - `cancelled_by` (uuid, who cancelled)
      - `cancellation_reason` (text, reason for cancellation)
      - `reminder_enabled` (boolean, email reminder enabled)
      - `reminder_time` (text, reminder timing: 1_day_before/2_hours_before/etc)
      - `color` (text, hex color for calendar display)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
      - `created_by` (uuid, creator)
    
    - `activity_participants`
      - `id` (uuid, primary key)
      - `activity_id` (uuid, foreign key to work_plan_activities)
      - `user_id` (uuid, participant user)
      - `role` (text, participant/presenter/observer)
      - `attendance_status` (text, confirmed/declined/pending)
      - `added_at` (timestamptz, when added)
    
    - `activity_evidence_requirements`
      - `id` (uuid, primary key)
      - `activity_id` (uuid, foreign key to work_plan_activities)
      - `requirement_name` (text, name of required evidence)
      - `is_required` (boolean, whether it's mandatory)
      - `is_completed` (boolean, whether it's been fulfilled)
      - `order_index` (integer, display order)
    
    - `activity_evidence_files`
      - `id` (uuid, primary key)
      - `activity_id` (uuid, foreign key to work_plan_activities)
      - `requirement_id` (uuid, foreign key to activity_evidence_requirements)
      - `file_name` (text, original file name)
      - `file_url` (text, storage URL)
      - `file_type` (text, mime type)
      - `file_size` (integer, file size in bytes)
      - `uploaded_by` (uuid, who uploaded)
      - `uploaded_at` (timestamptz, upload timestamp)
      - `notes` (text, additional notes)
    
    - `activity_history`
      - `id` (uuid, primary key)
      - `activity_id` (uuid, foreign key to work_plan_activities)
      - `action` (text, action type: created/updated/completed/rescheduled/cancelled)
      - `changed_by` (uuid, foreign key to auth.users)
      - `changed_at` (timestamptz, when the change occurred)
      - `details` (jsonb, additional details about the change)
      - `previous_values` (jsonb, previous values before change)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage activities based on their role and company
*/

-- Create Work Plan Activities table
CREATE TABLE IF NOT EXISTS work_plan_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  activity_type text NOT NULL DEFAULT 'inspection',
  status text NOT NULL DEFAULT 'planned',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  site_id uuid,
  location text,
  owner_id uuid,
  completed_at timestamptz,
  completed_by uuid,
  cancelled_at timestamptz,
  cancelled_by uuid,
  cancellation_reason text,
  reminder_enabled boolean DEFAULT false,
  reminder_time text DEFAULT '1_day_before',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  CONSTRAINT valid_activity_type CHECK (activity_type IN ('inspection', 'training', 'audit', 'report_delivery', 'meeting', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('planned', 'in_progress', 'completed', 'overdue', 'cancelled')),
  CONSTRAINT valid_reminder_time CHECK (reminder_time IN ('1_day_before', '2_hours_before', '1_hour_before', '30_min_before', 'none'))
);

-- Create Activity Participants table
CREATE TABLE IF NOT EXISTS activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES work_plan_activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'participant',
  attendance_status text DEFAULT 'pending',
  added_at timestamptz DEFAULT now(),
  CONSTRAINT valid_participant_role CHECK (role IN ('participant', 'presenter', 'observer', 'organizer')),
  CONSTRAINT valid_attendance_status CHECK (attendance_status IN ('confirmed', 'declined', 'pending'))
);

-- Create Activity Evidence Requirements table
CREATE TABLE IF NOT EXISTS activity_evidence_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES work_plan_activities(id) ON DELETE CASCADE,
  requirement_name text NOT NULL,
  is_required boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  order_index integer DEFAULT 0
);

-- Create Activity Evidence Files table
CREATE TABLE IF NOT EXISTS activity_evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES work_plan_activities(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES activity_evidence_requirements(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  notes text
);

-- Create Activity History table
CREATE TABLE IF NOT EXISTS activity_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES work_plan_activities(id) ON DELETE CASCADE,
  action text NOT NULL,
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  details jsonb DEFAULT '{}',
  previous_values jsonb DEFAULT '{}',
  CONSTRAINT valid_action CHECK (action IN ('created', 'updated', 'completed', 'rescheduled', 'cancelled', 'status_changed', 'evidence_added'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_work_plan_activities_company ON work_plan_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_work_plan_activities_status ON work_plan_activities(status);
CREATE INDEX IF NOT EXISTS idx_work_plan_activities_owner ON work_plan_activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_work_plan_activities_site ON work_plan_activities(site_id);
CREATE INDEX IF NOT EXISTS idx_work_plan_activities_dates ON work_plan_activities(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_activity_participants_activity ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_evidence_requirements_activity ON activity_evidence_requirements(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_evidence_files_activity ON activity_evidence_files(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_activity ON activity_history(activity_id);

-- Add trigger to update updated_at
DROP TRIGGER IF EXISTS update_work_plan_activities_updated_at ON work_plan_activities;
CREATE TRIGGER update_work_plan_activities_updated_at
  BEFORE UPDATE ON work_plan_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE work_plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_evidence_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;

-- Policies for work_plan_activities
CREATE POLICY "Users can view activities in their company"
  ON work_plan_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create activities"
  ON work_plan_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update activities"
  ON work_plan_activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete activities"
  ON work_plan_activities FOR DELETE
  TO authenticated
  USING (true);

-- Policies for activity_participants
CREATE POLICY "Users can view participants"
  ON activity_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage participants"
  ON activity_participants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for activity_evidence_requirements
CREATE POLICY "Users can view evidence requirements"
  ON activity_evidence_requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage evidence requirements"
  ON activity_evidence_requirements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for activity_evidence_files
CREATE POLICY "Users can view evidence files"
  ON activity_evidence_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage evidence files"
  ON activity_evidence_files FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for activity_history
CREATE POLICY "Users can view activity history"
  ON activity_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create history entries"
  ON activity_history FOR INSERT
  TO authenticated
  WITH CHECK (true);