-- Opret eller opdater categories tabellen
DO $$
BEGIN
  -- Kontroller om tabellen har den rigtige struktur
  IF NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'categories'
  ) THEN
    CREATE TABLE categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );
  END IF;
  
  -- Tilføj RLS til categories tabellen
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  
  -- Opret policies så alle kan se kategorier
  DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
  CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);
  
  -- Opret policy så kun admin kan indsætte kategorier
  DROP POLICY IF EXISTS "Only admin can insert categories" ON categories;
  CREATE POLICY "Only admin can insert categories"
  ON categories FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');
END $$;

-- Indsæt kun kategorier hvis tabellen er tom
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories LIMIT 1) THEN
    -- Indsætning af hovedkategorier
    INSERT INTO categories (id, name, created_at) VALUES
    ('1', 'Elektronik', NOW()),
    ('2', 'Møbler', NOW()),
    ('3', 'Tøj og mode', NOW()),
    ('4', 'Sport og fritid', NOW()),
    ('5', 'Hjem og have', NOW()),
    ('6', 'Biler og bådudstyr', NOW()),
    ('7', 'Børn og baby', NOW()),
    ('8', 'Samlerartikler', NOW()),
    ('9', 'Spil og legetøj', NOW()),
    ('10', 'Bøger og medier', NOW()),
    ('11', 'Skønhed og velvære', NOW()),
    ('12', 'Håndlavede produkter', NOW()),
    ('13', 'Værktøj og maskiner', NOW()),
    ('14', 'Instrumenter', NOW()),
    ('15', 'Kunst og dekoration', NOW());
  END IF;
END $$; 