-- Tilføj is_reserved felt til products
ALTER TABLE products ADD COLUMN is_reserved boolean DEFAULT false;
