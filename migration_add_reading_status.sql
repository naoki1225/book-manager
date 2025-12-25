-- Add reading_status column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS reading_status TEXT DEFAULT 'read' 
CHECK (reading_status IN ('read', 'reading', 'want_to_read'));

-- Update existing records to 'read' status
UPDATE posts 
SET reading_status = 'read' 
WHERE reading_status IS NULL;

-- Create index for better performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_posts_reading_status ON posts(reading_status);

-- Create index for user_id and reading_status combination
CREATE INDEX IF NOT EXISTS idx_posts_user_status ON posts(user_id, reading_status);
