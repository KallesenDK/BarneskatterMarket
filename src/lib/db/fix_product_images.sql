-- Opret product_images tabellen hvis den ikke findes
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tilføj RLS til product_images tabellen
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Opret policies for product_images tabellen
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
CREATE POLICY "Anyone can view product images"
ON product_images FOR SELECT
USING (true);

-- Denne policy havde en USING del, som ikke er tilladt for INSERT
DROP POLICY IF EXISTS "Users can insert images for own products" ON product_images;
CREATE POLICY "Users can insert images for own products"
ON product_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update images for own products" ON product_images;
CREATE POLICY "Users can update images for own products"
ON product_images FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete images for own products" ON product_images;
CREATE POLICY "Users can delete images for own products"
ON product_images FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.user_id = auth.uid()
  )
); 