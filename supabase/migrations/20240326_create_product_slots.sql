-- Create product_slots table
CREATE TABLE IF NOT EXISTS product_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slots INTEGER NOT NULL CHECK (slots > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create RLS policies
ALTER TABLE product_slots ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active product slots
CREATE POLICY "Allow anyone to read active product slots"
  ON product_slots
  FOR SELECT
  USING (is_active = true);

-- Allow admins to manage all product slots
CREATE POLICY "Allow admins to manage all product slots"
  ON product_slots
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'kenneth@sigmatic.dk'
  ); 