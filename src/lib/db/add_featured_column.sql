-- Tilføj featured-kolonnen til products-tabellen hvis den ikke findes
ALTER TABLE products
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Opdater eksisterende produkter til at have featured = false, hvis kolonnen blev tilføjet
UPDATE products
SET featured = false
WHERE featured IS NULL;

-- Sørg for at featured-kolonnen har en default værdi
ALTER TABLE products
ALTER COLUMN featured SET DEFAULT false;

-- Vis strukturen af products-tabellen efter ændringen
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'products'
    AND column_name = 'featured'; 