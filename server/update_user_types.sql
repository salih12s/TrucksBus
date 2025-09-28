-- Update existing users' userType based on their role
UPDATE users 
SET user_type = CASE 
    WHEN role = 'CORPORATE' THEN 'corporate'
    ELSE 'individual'
END
WHERE user_type IS NULL OR user_type = 'individual';