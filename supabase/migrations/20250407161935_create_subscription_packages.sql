-- Create subscription_packages table
CREATE TABLE subscription_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL,
    product_limit INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product_slots table
CREATE TABLE product_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slot_count INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default subscription packages
INSERT INTO subscription_packages (name, description, duration_weeks, product_limit, price) VALUES
('Starter', 'Perfekt til at komme i gang', 2, 4, 49),
('Basic', 'Mest populær for casual sælgere', 4, 6, 79),
('Pro', 'Ideel til regelmæssige sælgere', 6, 8, 119),
('Business', 'For professionelle sælgere', 8, 12, 179);

-- Insert default product slots
INSERT INTO product_slots (name, description, slot_count, price) VALUES
('Lille udvidelse', 'Tilføj 4 ekstra produktpladser', 4, 29),
('Medium udvidelse', 'Tilføj 8 ekstra produktpladser', 8, 49),
('Stor udvidelse', 'Tilføj 16 ekstra produktpladser', 16, 89);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to both tables
CREATE TRIGGER update_subscription_packages_updated_at
    BEFORE UPDATE ON subscription_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_slots_updated_at
    BEFORE UPDATE ON product_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
