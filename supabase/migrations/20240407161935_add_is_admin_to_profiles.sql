-- Tilføj RLS politik for credit_packages
CREATE POLICY "Kun administratorer kan administrere kredit pakker" ON credit_packages
    FOR ALL
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 
            FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    ); 