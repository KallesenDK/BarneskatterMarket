-- Start med en frisk profiles-tabel (slet den gamle hvis den findes)
DROP TABLE IF EXISTS profiles;

-- Opret en ny profiles-tabel med den korrekte struktur
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  avatar_url VARCHAR(255),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Indsæt alle eksisterende brugere i den nye profiles-tabel
INSERT INTO profiles (id, created_at)
SELECT id, COALESCE(created_at, NOW()) 
FROM auth.users;

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