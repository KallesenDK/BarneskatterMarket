-- Kør denne fil via Supabase Studio eller direkte på databasen for at rette products tabellen

-- Vis den nuværende struktur af products tabellen
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'products'
ORDER BY 
    ordinal_position;

-- Opretter manglende kolonner i products-tabellen
ALTER TABLE products
ADD COLUMN IF NOT EXISTS condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS category_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Bekræft at kolonnerne nu findes
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'condition'
) AS condition_column_exists,
EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'category_id'
) AS category_id_column_exists,
EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'location'
) AS location_column_exists,
EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'status'
) AS status_column_exists;

-- Vis den opdaterede struktur af products tabellen
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'products'
ORDER BY 
    ordinal_position; 