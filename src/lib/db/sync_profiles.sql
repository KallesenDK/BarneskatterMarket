-- Dette script kopierer alle eksisterende brugere til profiles-tabellen

-- Indsæt manglende brugere i profiles-tabellen
INSERT INTO profiles (id, created_at)
SELECT 
  id, 
  COALESCE(created_at, NOW()) 
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Vis resultat (antal profiler)
SELECT COUNT(*) AS antal_profiler FROM profiles; 