-- Fjern NOT NULL constraints fra profiles-tabellen

-- Tjek først hvilke kolonner der har NOT NULL constraint
SELECT 
    column_name, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles' 
    AND is_nullable = 'NO';

-- Fjern NOT NULL constraint fra first_name
ALTER TABLE profiles
ALTER COLUMN first_name DROP NOT NULL;

-- Fjern NOT NULL constraint fra last_name (hvis den findes)
ALTER TABLE profiles
ALTER COLUMN last_name DROP NOT NULL;

-- Prøv at indsætte brugere igen, nu uden NOT NULL constraints
INSERT INTO profiles (id, created_at)
SELECT 
  id, 
  COALESCE(created_at, NOW()) 
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Vis resultatet
SELECT COUNT(*) AS antal_profiler FROM profiles; 