-- Migration: Add max_quantity and sold_quantity to subscription_packages
ALTER TABLE subscription_packages
ADD COLUMN max_quantity INTEGER,
ADD COLUMN sold_quantity INTEGER DEFAULT 0;
