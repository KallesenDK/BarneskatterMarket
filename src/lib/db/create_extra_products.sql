-- Create extra_products table
CREATE TABLE IF NOT EXISTS extra_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID REFERENCES subscription_packages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE extra_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active extra products"
    ON extra_products
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage extra products"
    ON extra_products
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'kenneth@sigmatic.dk');

-- Create trigger for updating updated_at
CREATE TRIGGER update_extra_products_updated_at
    BEFORE UPDATE ON extra_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some example extra products
INSERT INTO extra_products (package_id, name, description, price) 
SELECT 
    p.id,
    'Ekstra produkt plads',
    'Tilføj en ekstra produktplads til din pakke',
    29.00
FROM subscription_packages p
WHERE p.name = 'Basic'
AND NOT EXISTS (
    SELECT 1 FROM extra_products WHERE name = 'Ekstra produkt plads'
); 