-- Opret en funktion, der kan køres via rpc
CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Kun brugere med rolle 'owner' må køre SQL kommandoer
  IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'owner' THEN
    RAISE EXCEPTION 'Kun administratorer kan køre SQL kommandoer';
  END IF;

  -- Kør SQL kommandoen og returner resultatet som JSON
  EXECUTE 'SELECT to_jsonb(array_to_json(array_agg(row_to_json(t))))
           FROM (' || sql || ') t' INTO result;
  
  RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$; 