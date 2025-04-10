-- Opdatering af products tabellen for at fjerne NOT NULL constraint på images kolonnen

-- Tilføj manglende kolonner og gør images nullable
ALTER TABLE products
ADD COLUMN IF NOT EXISTS condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS category_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ALTER COLUMN images DROP NOT NULL;

-- Hvis der ikke allerede findes en images kolonne, opret den som nullable
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'images'
    ) THEN
        ALTER TABLE products
        ADD COLUMN images TEXT[];
    END IF;
END $$;

-- Drop check constraint på images hvis det findes
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'products_images_check'
    ) THEN
        ALTER TABLE products
        DROP CONSTRAINT products_images_check;
    END IF;
END $$;

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