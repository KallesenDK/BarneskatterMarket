-- Tilføj afhentningskode til products-tabellen
ALTER TABLE products ADD COLUMN pickup_code VARCHAR(16);
-- Husk evt. at tilføje NOT NULL eller UNIQUE hvis nødvendigt
