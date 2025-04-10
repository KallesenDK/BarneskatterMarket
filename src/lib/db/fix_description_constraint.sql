-- Denne SQL skal køres direkte i Supabase Studio for at rette description constraint

-- Først, undersøg om constraints eksisterer og vis dem
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conname LIKE 'products_description%'
    OR conrelid::regclass::text = 'products';

-- Forsøg at droppe description constraint
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_description_check;
        RAISE NOTICE 'Successfully dropped products_description_check constraint';
    EXCEPTION 
        WHEN others THEN
            RAISE NOTICE 'Error dropping constraint: %', SQLERRM;
    END;
END $$;

-- Vent et sekund
SELECT pg_sleep(1);

-- Forsøg at rekonstruere constraint med lavere værdi (10 tegn)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE products ADD CONSTRAINT products_description_check CHECK (CHAR_LENGTH(description) >= 10);
        RAISE NOTICE 'Successfully added new constraint with 10 char minimum';
    EXCEPTION 
        WHEN others THEN
            RAISE NOTICE 'Error adding new constraint: %', SQLERRM;
    END;
END $$;

-- Se constraints på tabellen igen
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conname LIKE 'products_description%'
    OR conrelid::regclass::text = 'products'; 