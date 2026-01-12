-- Add login tracking to parents table
-- Run this in your Supabase SQL Editor

-- Add last_login_at column to track when users last logged in
ALTER TABLE parents ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Update existing users to have their created_at as last_login (for migration)
UPDATE parents SET last_login_at = created_at WHERE last_login_at IS NULL;

-- Create a function to update last login time
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last_login_at for the parent when they access the app
  UPDATE parents SET last_login_at = NOW() WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'parents' AND column_name = 'last_login_at';
