-- Fix categories tabellen til at bruge VARCHAR for id og oprette manglende standard-kategorier

-- 1. Tjek om categories tabellen eksisterer
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'categories'
    ) THEN
        -- Opret categories tabellen hvis den ikke findes
        CREATE TABLE categories (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        RAISE NOTICE 'Oprettet categories tabel med VARCHAR(50) id';
    ELSE
        RAISE NOTICE 'categories tabel eksisterer allerede';
    END IF;
END $$;

-- 2. Tilføj Row Level Security til categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. Tilføj policies for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- 4. Indsæt standard-kategorier hvis de ikke findes
INSERT INTO categories (id, name, created_at)
SELECT '1', 'Elektronik', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '1');

INSERT INTO categories (id, name, created_at)
SELECT '2', 'Møbler', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '2');

INSERT INTO categories (id, name, created_at)
SELECT '3', 'Tøj og mode', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '3');

INSERT INTO categories (id, name, created_at)
SELECT '4', 'Sport og fritid', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '4');

INSERT INTO categories (id, name, created_at)
SELECT '5', 'Hjem og have', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '5');

INSERT INTO categories (id, name, created_at)
SELECT '6', 'Biler og bådudstyr', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '6');

INSERT INTO categories (id, name, created_at)
SELECT '7', 'Børn og baby', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '7');

INSERT INTO categories (id, name, created_at)
SELECT '8', 'Samlerartikler', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = '8');

-- 5. Fix products.category_id relation
DO $$ 
BEGIN
    -- Drop eksisterende foreign key constraint hvis den findes
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    
    -- Opret category_id kolonne hvis den ikke findes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products
        ADD COLUMN category_id VARCHAR(50);
    ELSE
        -- Hvis kolonnen findes men ikke er VARCHAR(50), konverter den
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            AND column_name = 'category_id' 
            AND data_type != 'character varying'
        ) THEN
            -- Omdøb eksisterende kolonne
            ALTER TABLE products
            RENAME COLUMN category_id TO category_id_old;
            
            -- Opret ny kolonne
            ALTER TABLE products
            ADD COLUMN category_id VARCHAR(50);
            
            -- Kopier data hvis muligt
            UPDATE products
            SET category_id = category_id_old::VARCHAR
            WHERE category_id_old IS NOT NULL;
            
            RAISE NOTICE 'Konverteret category_id til VARCHAR(50)';
        END IF;
    END IF;
    
    -- Forsøg at tilføje foreign key constraint
    ALTER TABLE products
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id);
    
    RAISE NOTICE 'Foreign key constraint oprettet mellem products.category_id og categories.id';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Fejl ved oprettelse af foreign key constraint: %', SQLERRM;
END $$;

-- 6. Opdater eksisterende produkter til at bruge category_id
UPDATE products 
SET category_id = category 
WHERE category_id IS NULL AND category IS NOT NULL;

-- 7. Vis status
SELECT * FROM categories ORDER BY id;

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

-- Tjek kolonne datatyper
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('categories', 'products') 
    AND column_name IN ('id', 'category_id'); 