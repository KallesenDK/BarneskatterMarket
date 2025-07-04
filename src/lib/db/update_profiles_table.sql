-- Opdater profiles-tabellen med manglende kolonner (tilføj kolonner hvis de ikke findes)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Indsæt alle manglende brugere i profiles-tabellen
INSERT INTO profiles (id, created_at)
SELECT 
  id, 
  COALESCE(created_at, NOW()) 
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Opret trigger-funktion for automatisk at oprette profil for nye brugere
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at)
  VALUES (new.id, NOW());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop eksisterende trigger hvis den findes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Opret ny trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tilføj Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop eksisterende policies for at undgå konflikter
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Opret policies for sikkerhed
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Vis resultat (antal profiler)
SELECT COUNT(*) AS antal_profiler FROM profiles; 