-- Opret payouts tabellen hvis den ikke findes
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tilføj RLS til payouts tabellen
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Drop eksisterende policies for at undgå konflikter
DROP POLICY IF EXISTS "Users can view their own payouts" ON payouts;
DROP POLICY IF EXISTS "Users with owner role can view all payouts" ON payouts;
DROP POLICY IF EXISTS "Only owners can create payouts" ON payouts;
DROP POLICY IF EXISTS "Only owners can update payouts" ON payouts;
DROP POLICY IF EXISTS "Only owners can delete payouts" ON payouts;

-- Opret policies for payouts tabellen
CREATE POLICY "Users can view their own payouts"
ON payouts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users with owner role can view all payouts"
ON payouts FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can create payouts"
ON payouts FOR INSERT
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can update payouts"
ON payouts FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner')
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Only owners can delete payouts"
ON payouts FOR DELETE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

-- Opret trigger for at opdatere updated_at automatisk
CREATE OR REPLACE FUNCTION update_payouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger hvis den allerede findes
DROP TRIGGER IF EXISTS update_payouts_updated_at_trigger ON payouts;

-- Opret trigger
CREATE TRIGGER update_payouts_updated_at_trigger
BEFORE UPDATE ON payouts
FOR EACH ROW
EXECUTE FUNCTION update_payouts_updated_at(); 