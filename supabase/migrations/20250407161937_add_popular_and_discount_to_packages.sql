-- Tilføj nye kolonner til subscription_packages tabellen
ALTER TABLE subscription_packages
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discount_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS discount_end_date TIMESTAMP WITH TIME ZONE;

-- Opdater eksisterende pakker
UPDATE subscription_packages
SET is_popular = true
WHERE name = 'Basic';

-- Tilføj constraint for at sikre at discount_price er mindre end normal pris
ALTER TABLE subscription_packages
ADD CONSTRAINT check_discount_price CHECK (discount_price IS NULL OR (discount_price > 0 AND discount_price < price));

-- Tilføj constraint for at sikre at discount datoer er gyldige
ALTER TABLE subscription_packages
ADD CONSTRAINT check_discount_dates CHECK (
    (discount_start_date IS NULL AND discount_end_date IS NULL) OR
    (discount_start_date IS NOT NULL AND discount_end_date IS NOT NULL AND discount_start_date < discount_end_date)
); 