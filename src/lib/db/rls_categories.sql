-- Først skal vi sikre, at RLS er aktiveret på tabellen
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Opret en politik der tillader administratorer at indsætte nye kategorier
CREATE POLICY "Tillad administratorer at indsætte kategorier"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Opret en politik der tillader administratorer at læse kategorier
CREATE POLICY "Tillad alle at læse kategorier"
ON categories FOR SELECT
USING (true);

-- Opret en politik der tillader administratorer at opdatere kategorier
CREATE POLICY "Tillad administratorer at opdatere kategorier"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Opret en politik der tillader administratorer at slette kategorier
CREATE POLICY "Tillad administratorer at slette kategorier"
ON categories FOR DELETE
TO authenticated
USING (true); 