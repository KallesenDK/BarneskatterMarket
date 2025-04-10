-- Opret en funktion der kopierer brugerdata fra auth.users til profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at)
  VALUES (new.id, NOW())
  ON CONFLICT (id) DO NOTHING; -- Hvis brugeren allerede har en profil, gør ingenting
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fjern eksisterende trigger hvis den findes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Opret trigger, der kører ved oprettelse af nye brugere
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Synkroniser eksisterende brugere (kun dem der mangler en profil)
INSERT INTO profiles (id, created_at)
SELECT 
  id, 
  COALESCE(created_at, NOW()) 
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Viser antallet af brugere i auth.users og profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM profiles) AS profiles_count; 