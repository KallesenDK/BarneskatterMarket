-- Drop eksisterende policies hvis de findes
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can modify roles" ON user_roles;

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create basic read policy for all authenticated users
CREATE POLICY "Allow users to read roles"
    ON user_roles FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for modifications (insert, update, delete)
CREATE POLICY "Only admins can modify roles"
    ON user_roles FOR ALL
    TO authenticated
    WITH CHECK (role = 'admin');

-- Insert initial admin role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE role = 'admin'
    ) THEN
        INSERT INTO user_roles (user_id, role)
        SELECT id, 'admin'::user_role
        FROM auth.users
        LIMIT 1;
    END IF;
END
$$; 