-- Add reset token fields to users table
-- Run this script to add forgot password functionality

-- Add reset_token column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'reset_token') THEN
        ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
        RAISE NOTICE 'Added reset_token column to users table';
    ELSE
        RAISE NOTICE 'reset_token column already exists in users table';
    END IF;
END $$;

-- Add reset_token_expiry column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'reset_token_expiry') THEN
        ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP;
        RAISE NOTICE 'Added reset_token_expiry column to users table';
    ELSE
        RAISE NOTICE 'reset_token_expiry column already exists in users table';
    END IF;
END $$;

-- Add index on reset_token for better performance
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE tablename = 'users' AND indexname = 'idx_users_reset_token') THEN
        CREATE INDEX idx_users_reset_token ON users(reset_token);
        RAISE NOTICE 'Added index on reset_token column';
    ELSE
        RAISE NOTICE 'Index on reset_token already exists';
    END IF;
END $$;

RAISE NOTICE 'Reset token fields setup completed successfully!';
