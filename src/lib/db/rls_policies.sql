-- =============================================
-- RLS for profiles tabellen
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tillad brugere at læse deres egen profil
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Tillad brugere at opdatere deres egen profil
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Tillad indsættelse af profil når bruger oprettes
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =============================================
-- RLS for categories tabellen
-- =============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Tillad alle at læse kategorier
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- Tillad autentificerede brugere at indsætte kategorier
CREATE POLICY "Authenticated users can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Tillad autentificerede brugere at opdatere kategorier
CREATE POLICY "Authenticated users can update categories"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Tillad autentificerede brugere at slette kategorier
CREATE POLICY "Authenticated users can delete categories"
ON categories FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- RLS for products tabellen
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Tillad alle at læse produkter
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (true);

-- Tillad brugere at indsætte egne produkter
CREATE POLICY "Users can insert their own products"
ON products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Tillad brugere at opdatere egne produkter
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Tillad brugere at slette egne produkter
CREATE POLICY "Users can delete own products"
ON products FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- RLS for product_images tabellen
-- =============================================
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Tillad alle at læse produkt-billeder
CREATE POLICY "Anyone can view product images"
ON product_images FOR SELECT
USING (true);

-- Tillad autentificerede brugere at indsætte produkt-billeder
-- Dette kræver at produktet allerede eksisterer og er oprettet af brugeren
CREATE POLICY "Users can insert images for their own products"
ON product_images FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_images.product_id
        AND products.user_id = auth.uid()
    )
);

-- Tillad brugere at opdatere egne produkt-billeder
CREATE POLICY "Users can update images for their own products"
ON product_images FOR UPDATE
TO authenticated
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

-- Tillad brugere at slette egne produkt-billeder
CREATE POLICY "Users can delete images for their own products"
ON product_images FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM products
        WHERE products.id = product_images.product_id
        AND products.user_id = auth.uid()
    )
); 