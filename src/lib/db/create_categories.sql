-- Fix categories tabellen til at bruge UUID for id og oprette manglende standard-kategorier

-- 1. Tjek om categories tabellen eksisterer og dens datatype
DO $$ 
DECLARE
    id_data_type TEXT;
BEGIN
    -- Tjek om categories tabellen eksisterer
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'categories'
    ) THEN
        -- Opret categories tabellen med UUID id
        CREATE TABLE categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        RAISE NOTICE 'Oprettet categories tabel med UUID id';
        id_data_type := 'uuid';
    ELSE
        -- Tjek om id kolonnen er UUID
        SELECT data_type INTO id_data_type
        FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'id';
        
        RAISE NOTICE 'categories tabellen eksisterer allerede med id datatype: %', id_data_type;
    END IF;
END $$;

-- 2. Tilføj Row Level Security til categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. Tilføj policies for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- 4. Indsæt standard-kategorier med UUID id
DO $$
DECLARE
    elektronik_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    moebler_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
    toej_id UUID := '00000000-0000-0000-0000-000000000003'::UUID;
    sport_id UUID := '00000000-0000-0000-0000-000000000004'::UUID;
    hjem_id UUID := '00000000-0000-0000-0000-000000000005'::UUID;
    biler_id UUID := '00000000-0000-0000-0000-000000000006'::UUID;
    boern_id UUID := '00000000-0000-0000-0000-000000000007'::UUID;
    samler_id UUID := '00000000-0000-0000-0000-000000000008'::UUID;
BEGIN
    -- Indsæt kategorierne hvis de ikke eksisterer
    INSERT INTO categories (id, name, created_at)
    SELECT elektronik_id, 'Elektronik', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = elektronik_id);

    INSERT INTO categories (id, name, created_at)
    SELECT moebler_id, 'Møbler', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = moebler_id);

    INSERT INTO categories (id, name, created_at)
    SELECT toej_id, 'Tøj og mode', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = toej_id);

    INSERT INTO categories (id, name, created_at)
    SELECT sport_id, 'Sport og fritid', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = sport_id);

    INSERT INTO categories (id, name, created_at)
    SELECT hjem_id, 'Hjem og have', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = hjem_id);

    INSERT INTO categories (id, name, created_at)
    SELECT biler_id, 'Biler og bådudstyr', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = biler_id);

    INSERT INTO categories (id, name, created_at)
    SELECT boern_id, 'Børn og baby', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = boern_id);

    INSERT INTO categories (id, name, created_at)
    SELECT samler_id, 'Samlerartikler', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = samler_id);
    
    RAISE NOTICE 'Standard-kategorier oprettet eller opdateret';
END $$;

-- 5. Fix products.category_id relation
DO $$ 
DECLARE
    cat_id_type TEXT;
BEGIN
    -- Tjek categories.id datatype
    SELECT data_type INTO cat_id_type
    FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'id';
    
    -- Drop eksisterende foreign key constraint hvis den findes
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    
    IF cat_id_type = 'uuid' THEN
        -- Hvis categories.id er UUID, ændrer vi products.category_id til UUID
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            AND column_name = 'category_id'
        ) THEN
            -- Hvis kolonnen findes, omdøb den
            ALTER TABLE products RENAME COLUMN category_id TO category_id_old;
        END IF;
        
        -- Opret ny UUID kolonne
        ALTER TABLE products ADD COLUMN category_id UUID;
        
        -- Forsøg at konvertere eksisterende kategorier baseret på category
        UPDATE products p
        SET category_id = CASE 
            WHEN p.category = '1' OR p.category = 'Elektronik' THEN '00000000-0000-0000-0000-000000000001'::UUID
            WHEN p.category = '2' OR p.category = 'Møbler' THEN '00000000-0000-0000-0000-000000000002'::UUID
            WHEN p.category = '3' OR p.category = 'Tøj og mode' THEN '00000000-0000-0000-0000-000000000003'::UUID
            WHEN p.category = '4' OR p.category = 'Sport og fritid' THEN '00000000-0000-0000-0000-000000000004'::UUID
            WHEN p.category = '5' OR p.category = 'Hjem og have' THEN '00000000-0000-0000-0000-000000000005'::UUID
            WHEN p.category = '6' OR p.category = 'Biler og bådudstyr' THEN '00000000-0000-0000-0000-000000000006'::UUID
            WHEN p.category = '7' OR p.category = 'Børn og baby' THEN '00000000-0000-0000-0000-000000000007'::UUID
            WHEN p.category = '8' OR p.category = 'Samlerartikler' THEN '00000000-0000-0000-0000-000000000008'::UUID
        END
        WHERE p.category IS NOT NULL;
        
        -- Tilføj foreign key constraint
        ALTER TABLE products
        ADD CONSTRAINT products_category_id_fkey 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id);
        
        RAISE NOTICE 'products.category_id ændret til UUID og foreign key constraint oprettet';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Fejl ved oprettelse af foreign key constraint: %', SQLERRM;
END $$;

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