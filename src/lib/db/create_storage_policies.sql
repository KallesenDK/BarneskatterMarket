-- Opret product-images bucket hvis den ikke allerede findes
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE name = 'product-images'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true);
    RAISE NOTICE 'Bucket "product-images" oprettet';
  ELSE
    RAISE NOTICE 'Bucket "product-images" findes allerede';
  END IF;
END $$;

-- Se kolonner og deres datatyper for storage.objects
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' AND table_name = 'objects';

-- Opret storage policies for product-images bucket

-- 1. SELECT (visning) policy - Tillad alle at se billeder
BEGIN;
  -- Drop existing policy hvis den findes
  DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
  
  -- Opret ny SELECT policy
  CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
COMMIT;

-- 2. INSERT (upload) policy - Tillad authenticated brugere at uploade
BEGIN;
  -- Drop existing policy hvis den findes
  DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
  
  -- Opret ny INSERT policy
  CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );
COMMIT;

-- 3. UPDATE policy - Tillad autentificerede brugere at opdatere egne filer
BEGIN;
  -- Drop existing policy hvis den findes
  DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
  
  -- Opret simplificeret UPDATE policy
  CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');
COMMIT;

-- 4. DELETE policy - Tillad autentificerede brugere at slette egne filer
BEGIN;
  -- Drop existing policy hvis den findes
  DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
  
  -- Opret simplificeret DELETE policy
  CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');
COMMIT;

-- Bekræft at policies er oprettet (med korrekte kolonnenavne)
SELECT
  policyname,
  schemaname,
  tablename,
  permissive,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%images%'; 