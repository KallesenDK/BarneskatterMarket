-- Create user_bans table
CREATE TABLE IF NOT EXISTS user_bans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    banned_by UUID NOT NULL REFERENCES profiles(id),
    reason TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Admins can view all bans
CREATE POLICY "Admins can view all bans"
ON user_bans FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can create bans
CREATE POLICY "Only admins can create bans"
ON user_bans FOR INSERT
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can update bans
CREATE POLICY "Only admins can update bans"
ON user_bans FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can delete bans
CREATE POLICY "Only admins can delete bans"
ON user_bans FOR DELETE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_bans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_bans_updated_at
    BEFORE UPDATE ON user_bans
    FOR EACH ROW
    EXECUTE FUNCTION update_user_bans_updated_at();

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Only owners can view all profiles
CREATE POLICY "Owners can view all profiles"
ON profiles FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

-- Only owners can update all profiles
CREATE POLICY "Owners can update all profiles"
ON profiles FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

-- Create trigger to update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 