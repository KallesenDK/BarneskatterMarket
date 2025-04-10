-- Tilføj views-kolonnen til products-tabellen hvis den ikke findes
ALTER TABLE products
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Opdater eksisterende produkter til at have 0 views, hvis kolonnen blev tilføjet
UPDATE products
SET views = 0
WHERE views IS NULL;

-- Sørg for at views-kolonnen har en default værdi
ALTER TABLE products
ALTER COLUMN views SET DEFAULT 0;

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
    AND column_name = 'views'; 