-- Add is_read column to audit_logs table
-- This allows tracking which audit logs have been read by users

-- Add is_read column (defaults to false for new logs)
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add read_at timestamp column
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add index for faster queries on unread logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_is_read ON audit_logs(is_read);

-- Add index for combined query (unread logs ordered by date)
CREATE INDEX IF NOT EXISTS idx_audit_logs_unread_created ON audit_logs(is_read, created_at DESC);

-- Add comment to document the columns
COMMENT ON COLUMN audit_logs.is_read IS 'Indicates whether this audit log has been marked as read';
COMMENT ON COLUMN audit_logs.read_at IS 'Timestamp when the log was marked as read';
