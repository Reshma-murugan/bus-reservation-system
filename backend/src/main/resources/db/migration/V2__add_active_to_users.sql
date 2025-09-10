-- Add active column to users table
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE;
