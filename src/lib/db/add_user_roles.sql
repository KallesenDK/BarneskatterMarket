-- Tilføj 'role' kolonne til profiles-tabellen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Opret enum type for bruger-roller
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'owner');
  END IF;
END $$;

-- Sæt roller for alle brugere til 'user' hvis de er NULL eller tomme
UPDATE profiles 
SET role = 'user'
WHERE role IS NULL OR role = '';

-- Fjern default constraint før type-konvertering
ALTER TABLE profiles
ALTER COLUMN role DROP DEFAULT;

-- Konverter role kolonnen til user_role type
ALTER TABLE profiles
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Tilføj default constraint igen med den nye type
ALTER TABLE profiles
ALTER COLUMN role SET DEFAULT 'user'::user_role;

-- Opret en Function for at tjekke en brugers rolle
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role::TEXT INTO user_role FROM profiles WHERE id = user_id;
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Opret en Function for at tildele en rolle til en bruger
CREATE OR REPLACE FUNCTION assign_user_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET role = new_role::user_role
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fjern eksisterende policy, hvis den findes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Owner can update roles'
  ) THEN
    DROP POLICY "Owner can update roles" ON profiles;
  END IF;
END
$$;

-- Opret policies, så kun owner kan ændre roller og brugere kun kan ændre egne profiler
CREATE POLICY "Owner can update profiles"
ON profiles FOR UPDATE
USING (
  -- Owner kan opdatere alle profiler
  (auth.uid() IN (SELECT id FROM profiles WHERE role = 'owner')) OR
  -- Brugere kan opdatere deres egen profil
  (auth.uid() = id)
);

-- Opret en separat funktion for at kontrollere rolle-ændringer 
CREATE OR REPLACE FUNCTION check_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Hvis brugeren ikke er owner, og forsøger at ændre en rolle
  IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'owner' AND 
     OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Kun ejere kan ændre brugerroller';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger hvis den allerede findes
DROP TRIGGER IF EXISTS check_role_changes_trigger ON profiles;

-- Opret trigger til at kontrollere rolle-ændringer
CREATE TRIGGER check_role_changes_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_role_changes();

-- Vis brugere og deres roller
SELECT 
  p.id, 
  auth.email(), 
  p.first_name, 
  p.last_name, 
  p.role
FROM 
  profiles p
JOIN 
  auth.users u ON p.id = u.id
ORDER BY 
  CASE 
    WHEN p.role = 'owner' THEN 1
    WHEN p.role = 'admin' THEN 2
    ELSE 3
  END,
  p.first_name,
  p.last_name; 