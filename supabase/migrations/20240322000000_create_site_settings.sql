-- Drop existing table if it exists
DROP TABLE IF EXISTS site_settings;

-- Create site_settings table
CREATE TABLE site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Site settings are viewable by everyone"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify site settings"
    ON site_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

-- Insert default grid settings
INSERT INTO site_settings (key, value)
VALUES 
    ('credit_packages_grid', '{"lg": 3, "md": 2, "sm": 1}'::jsonb),
    ('subscription_packages_grid', '{"lg": 3, "md": 2, "sm": 1}'::jsonb)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value; 