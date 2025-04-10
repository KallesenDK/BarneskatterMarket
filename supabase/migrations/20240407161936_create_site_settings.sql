-- Opret site_settings tabel
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tilføj RLS politikker
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Fjern eksisterende politikker hvis de findes
DROP POLICY IF EXISTS "Alle kan læse site settings" ON site_settings;
DROP POLICY IF EXISTS "Kun administratorer kan administrere site settings" ON site_settings;
DROP POLICY IF EXISTS "Kun superadmin kan administrere site settings" ON site_settings;

-- Alle kan læse indstillinger
CREATE POLICY "Alle kan læse site settings" ON site_settings
    FOR SELECT
    USING (true);

-- Kun superadmin kan administrere indstillinger
CREATE POLICY "Kun superadmin kan administrere site settings" ON site_settings
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'kenneth@sigmatic.dk');

-- Indsæt eller opdater standard grid indstillinger
INSERT INTO site_settings (key, value) VALUES
('credit_packages_grid', '{"sm": 2, "md": 3, "lg": 4}'::jsonb),
('subscription_packages_grid', '{"sm": 2, "md": 3, "lg": 4}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = TIMEZONE('utc'::text, NOW()); 