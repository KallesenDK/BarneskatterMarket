-- Fix database relations og manglende kolonner

-- 1. Tilføj storage kolonner til profiles tabellen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 104857600, -- 100 MB default
ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;

-- 2. Tilføj manglende foreign key relation mellem products og categories
-- Først tjekker vi om products allerede har category_id kolonnen
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products
        ADD COLUMN category_id VARCHAR(50);
    END IF;
END $$;

-- Opdater eksisterende produkter til at bruge category_id baseret på category-værdien
UPDATE products 
SET category_id = category 
WHERE category_id IS NULL AND category IS NOT NULL;

-- Tilføj foreign key constraint
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'products_category_id_fkey'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_category_id_fkey 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id);
    END IF;
END $$;

-- 3. Tilføj manglende views og featured kolonner til products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 4. Fix problem med order kolonne i product_images (skal være display_order)
-- Først, tjek om der er en 'order' kolonne der skal ændres
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'product_images' 
        AND column_name = 'order'
    ) THEN
        -- Hvis en 'order' kolonne findes, skal den omdøbes til 'display_order'
        ALTER TABLE product_images
        RENAME COLUMN "order" TO display_order;
    END IF;
END $$;

-- Viser resultatet af ændringerne
-- Tjek profiles kolonner
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Tjek products kolonner
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Tjek product_images kolonner
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_images'
ORDER BY ordinal_position;

-- Tjek foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE
  tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'products'; 