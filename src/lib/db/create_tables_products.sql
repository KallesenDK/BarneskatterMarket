-- Opdatering af products tabellen
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id VARCHAR(50);

-- Opret en foreign key reference hvis den ikke findes
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