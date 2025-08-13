/*
  # Create Lucia Auth Tables

  1. New Tables
    - `auth_user`
      - `id` (text, primary key)
      - `email` (text, unique)
      - `hashed_password` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `user_session`
      - `id` (text, primary key)
      - `user_id` (text, foreign key)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- Create auth_user table
CREATE TABLE IF NOT EXISTS auth_user (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_session table
CREATE TABLE IF NOT EXISTS user_session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session ENABLE ROW LEVEL SECURITY;

-- Create policies for auth_user
CREATE POLICY "Users can view their own data"
  ON auth_user
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own data"
  ON auth_user
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', true));

-- Create policies for user_session
CREATE POLICY "Users can view their own sessions"
  ON user_session
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own sessions"
  ON user_session
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_user_email ON auth_user(email);
CREATE INDEX IF NOT EXISTS idx_user_session_user_id ON user_session(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_expires_at ON user_session(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auth_user
CREATE TRIGGER update_auth_user_updated_at
  BEFORE UPDATE ON auth_user
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();