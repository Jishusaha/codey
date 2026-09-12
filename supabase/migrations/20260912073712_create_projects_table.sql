/*
# Create projects table for SmartDEploy

## What this does
Creates a `projects` table to store user website projects — including their file contents, deployment metadata, and template type. Each user can only see and modify their own projects.

## New Tables
- `projects`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users with cascade delete)
  - `name` (text, not null)
  - `description` (text, defaults to empty string)
  - `template` (text, not null, defaults to 'react')
  - `files` (jsonb, not null, defaults to empty object) — stores the full file map
  - `entry` (text, not null, defaults to '/App.js')
  - `deploy_url` (text, nullable) — the live URL after deployment
  - `deploy_status` (text, not null, defaults to 'idle') — idle | building | ready | error
  - `deployment_id` (text, nullable) — external deployment provider ID
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now())

## Security
- Row Level Security enabled on `projects`.
- Four separate owner-scoped policies (SELECT, INSERT, UPDATE, DELETE) restricted to `authenticated` role.
- Each policy checks `auth.uid() = user_id`.
- `user_id` defaults to `auth.uid()` so inserts from the client that omit it still succeed.

## Indexes
- Index on `user_id` for fast per-user lookups.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  template text NOT NULL DEFAULT 'react',
  files jsonb NOT NULL DEFAULT '{}'::jsonb,
  entry text NOT NULL DEFAULT '/App.js',
  deploy_url text,
  deploy_status text NOT NULL DEFAULT 'idle',
  deployment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
