-- Opdatering af products tabel constraints

-- Opdater description constraint
DO $$ 
BEGIN 
    -- Drop description constraint hvis den findes
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'products_description_check'
    ) THEN
        ALTER TABLE products
        DROP CONSTRAINT products_description_check;
    END IF;
    
    -- Tilføj en mindre restriktiv constraint
    ALTER TABLE products
    ADD CONSTRAINT products_description_check
    CHECK (CHAR_LENGTH(description) >= 10);
END $$;

-- Fjern ikke-nødvendige constraints, fx på category
DO $$ 
BEGIN 
    -- Drop category constraint hvis den findes
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'products_category_not_null'
    ) THEN
        ALTER TABLE products
        DROP CONSTRAINT products_category_not_null;
    END IF;
    
    -- Tillad category at være NULL så category_id kan bruges i stedet
    ALTER TABLE products
    ALTER COLUMN category DROP NOT NULL;
END $$;

-- Vis opdaterede constraints på tabellen
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    pgc.conrelid::regclass AS table_name,
    pg_get_constraintdef(pgc.oid) AS constraint_definition
FROM 
    information_schema.table_constraints tc
JOIN 
    pg_constraint pgc ON tc.constraint_name = pgc.conname
WHERE 
    tc.table_name = 'products'; 