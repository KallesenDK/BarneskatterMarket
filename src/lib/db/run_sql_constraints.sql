-- Opdatering af products tabel constraints
-- Dette er ren SQL-kode der kan køres direkte i Supabase Studio

-- Opdater description constraint for at mindske længde-kravet
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
        
        -- Tilføj en mindre restriktiv constraint (kun 10 tegn)
        ALTER TABLE products
        ADD CONSTRAINT products_description_check
        CHECK (CHAR_LENGTH(description) >= 10);
    END IF;
END $$;

-- Opdater category feltets ikke-null constraint
DO $$ 
BEGIN 
    -- Undersøg om category har en NOT NULL constraint
    IF EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = 'products'::regclass
        AND attname = 'category'
        AND NOT attnotnull
    ) THEN
        -- Hvis colonnen tillader NULL, så gør intet
        RAISE NOTICE 'Category kolonnen tillader allerede NULL, ingen ændring nødvendig';
    ELSE
        -- Hvis kolonnen er NOT NULL, så ændr den
        ALTER TABLE products 
        ALTER COLUMN category DROP NOT NULL;
    END IF;
END $$;

-- Fjern images-constraints
DO $$ 
BEGIN 
    -- Drop images check constraint hvis det findes
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname LIKE 'products_images_check%'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE products DROP CONSTRAINT ' || conname
            FROM pg_constraint
            WHERE conname LIKE 'products_images_check%'
            LIMIT 1
        );
    END IF;
    
    -- Undersøg om images har en NOT NULL constraint
    IF EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = 'products'::regclass
        AND attname = 'images'
        AND attnotnull
    ) THEN
        -- Fjern NOT NULL constraint
        ALTER TABLE products
        ALTER COLUMN images DROP NOT NULL;
    END IF;
END $$;

-- Tilføj manglende kolonner hvis de ikke findes
ALTER TABLE products
ADD COLUMN IF NOT EXISTS condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS category_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Vis opdaterede constraints på tabellen
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    cc.column_name,
    pg_get_constraintdef(pgc.oid) AS constraint_definition
FROM 
    information_schema.table_constraints tc
JOIN 
    pg_constraint pgc ON tc.constraint_name = pgc.conname
LEFT JOIN
    information_schema.constraint_column_usage cc ON tc.constraint_name = cc.constraint_name
WHERE 
    tc.table_name = 'products'; 