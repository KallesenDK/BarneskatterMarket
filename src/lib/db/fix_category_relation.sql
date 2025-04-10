-- Fix inkompatibilitet mellem products.category_id og categories.id

-- 1. Først undersøger vi datatyperne
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' AND column_name = 'id';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'category_id';

-- 2. Ændr category_id kolonnen til UUID hvis categories.id er UUID
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'id' 
        AND data_type IN ('uuid')
    ) THEN
        -- Drop eksisterende foreign key constraint hvis den findes
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
        
        -- Omdøb eksisterende category_id kolonne til category_id_old
        ALTER TABLE products 
        RENAME COLUMN category_id TO category_id_old;
        
        -- Opret ny UUID kolonne
        ALTER TABLE products 
        ADD COLUMN category_id UUID;
        
        -- Opdater ny kolonne med eksisterende værdier, hvis muligt
        -- Dette vil konvertere strenge til UUID, hvis de er gyldige UUID'er
        UPDATE products
        SET category_id = CAST(category_id_old AS UUID)
        WHERE category_id_old IS NOT NULL AND category_id_old ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
        
        -- Tilføj foreign key constraint
        ALTER TABLE products
        ADD CONSTRAINT products_category_id_fkey 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id);
        
        RAISE NOTICE 'Ændret products.category_id til UUID datatype og tilføjet foreign key constraint';
    ELSE
        -- Hvis categories.id ikke er UUID, forsøger vi at ændre det til VARCHAR for at matche
        RAISE NOTICE 'categories.id er ikke UUID datatype, tjekker om vi kan ændre products.category_id til at matche';
        
        -- Drop eksisterende foreign key constraint hvis den findes
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
        
        -- Forsøg at oprette constraint med eksisterende datatyper
        BEGIN
            ALTER TABLE products
            ADD CONSTRAINT products_category_id_fkey 
            FOREIGN KEY (category_id) 
            REFERENCES categories(id);
            
            RAISE NOTICE 'Foreign key constraint oprettet med eksisterende datatyper';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Kunne ikke oprette foreign key constraint: %', SQLERRM;
        END;
    END IF;
END $$;

-- 3. Tjek om foreign key constraint blev oprettet
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