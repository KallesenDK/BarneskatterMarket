-- Løs problem med NOT NULL constraints og manglende default værdier

-- Først tilføj default værdier til kolonner og fjern NOT NULL constraints
ALTER TABLE profiles
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN first_name SET DEFAULT '',
ALTER COLUMN last_name DROP NOT NULL,
ALTER COLUMN last_name SET DEFAULT '';

-- Opdater eksisterende rækker, der har NULL-værdier
UPDATE profiles
SET 
  first_name = '' 
WHERE 
  first_name IS NULL;

UPDATE profiles
SET 
  last_name = '' 
WHERE 
  last_name IS NULL;

-- Indsæt manglende brugere med tomme strenge som navne
INSERT INTO profiles (id, first_name, last_name, created_at)
SELECT 
  id,
  '',  -- tom streng som first_name
  '',  -- tom streng som last_name
  COALESCE(created_at, NOW()) 
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Opdater trigger-funktionen til at inkludere tomme strenge som standard
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, created_at)
  VALUES (new.id, '', '', NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vis antal profiler efter ændringer
SELECT COUNT(*) AS antal_profiler FROM profiles; 