-- Opretter manglende kolonner i products-tabellen
ALTER TABLE products
ADD COLUMN IF NOT EXISTS condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS category_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Opret subscriptions-tabellen hvis den ikke findes
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tilføj RLS til subscriptions-tabellen
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Opret policies for subscriptions-tabellen
CREATE POLICY "Users can view their own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users with owner role can view all subscriptions"
ON subscriptions FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can create subscriptions"
ON subscriptions FOR INSERT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner')
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can update subscriptions"
ON subscriptions FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner')
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can delete subscriptions"
ON subscriptions FOR DELETE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

-- Vis strukturen af products-tabellen
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

-- Vis faktisk om conditon kolonnen findes i products tabellen
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'condition'
) AS condition_column_exists; 