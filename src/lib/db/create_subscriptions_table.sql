-- Opret subscriptions tabellen hvis den ikke findes
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tilføj RLS til subscriptions tabellen
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop eksisterende policies for at undgå konflikter
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users with owner role can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Only owners can create subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Only owners can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Only owners can delete subscriptions" ON subscriptions;

-- Opret policies for subscriptions tabellen
CREATE POLICY "Users can view their own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users with owner role can view all subscriptions"
ON subscriptions FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can create subscriptions"
ON subscriptions FOR INSERT
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can update subscriptions"
ON subscriptions FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner')
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can delete subscriptions"
ON subscriptions FOR DELETE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

-- Opret trigger for at opdatere updated_at automatisk
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger hvis den allerede findes
DROP TRIGGER IF EXISTS update_subscriptions_updated_at_trigger ON subscriptions;

-- Opret trigger
CREATE TRIGGER update_subscriptions_updated_at_trigger
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at(); 