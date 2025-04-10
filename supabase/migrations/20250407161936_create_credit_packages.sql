-- Create credit_packages table
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active credit packages"
    ON credit_packages
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage credit packages"
    ON credit_packages
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'kenneth@sigmatic.dk');

-- Create trigger for updating updated_at
CREATE TRIGGER update_credit_packages_updated_at
    BEFORE UPDATE ON credit_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some example credit packages
INSERT INTO credit_packages (name, description, credits, price) VALUES
('Lille pakke', '100 kreditter til ekstra produktpladser', 100, 49),
('Medium pakke', '250 kreditter til ekstra produktpladser', 250, 99),
('Stor pakke', '500 kreditter til ekstra produktpladser', 500, 179),
('Enterprise pakke', '1000 kreditter til ekstra produktpladser', 1000, 299); 