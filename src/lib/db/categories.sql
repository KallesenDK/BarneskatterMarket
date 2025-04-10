-- Indsætning af kategorier til produkter
INSERT INTO categories (id, name, created_at) VALUES
(uuid_generate_v4(), 'Elektronik', NOW()),
(uuid_generate_v4(), 'Møbler', NOW()),
(uuid_generate_v4(), 'Tøj og mode', NOW()),
(uuid_generate_v4(), 'Sport og fritid', NOW()),
(uuid_generate_v4(), 'Hjem og have', NOW()),
(uuid_generate_v4(), 'Biler og bådudstyr', NOW()),
(uuid_generate_v4(), 'Børn og baby', NOW()),
(uuid_generate_v4(), 'Samlerartikler', NOW()),
(uuid_generate_v4(), 'Spil og legetøj', NOW()),
(uuid_generate_v4(), 'Bøger og medier', NOW()),
(uuid_generate_v4(), 'Skønhed og velvære', NOW()),
(uuid_generate_v4(), 'Håndlavede produkter', NOW()),
(uuid_generate_v4(), 'Værktøj og maskiner', NOW()),
(uuid_generate_v4(), 'Instrumenter', NOW()),
(uuid_generate_v4(), 'Kunst og dekoration', NOW());

-- For at indsætte underkategorier, skal vi først gemme kategori UUIDs i variabler
DO $$
DECLARE
  elektronik_id UUID;
  moebler_id UUID;
  toej_mode_id UUID;
BEGIN
  -- Hent UUID for de kategorier vi skal bruge
  SELECT id INTO elektronik_id FROM categories WHERE name = 'Elektronik' LIMIT 1;
  SELECT id INTO moebler_id FROM categories WHERE name = 'Møbler' LIMIT 1;
  SELECT id INTO toej_mode_id FROM categories WHERE name = 'Tøj og mode' LIMIT 1;

  -- Underkategorier for Elektronik
  INSERT INTO subcategories (id, category_id, name, created_at) VALUES
  (uuid_generate_v4(), elektronik_id, 'Mobiltelefoner', NOW()),
  (uuid_generate_v4(), elektronik_id, 'Computere', NOW()),
  (uuid_generate_v4(), elektronik_id, 'TV og lyd', NOW()),
  (uuid_generate_v4(), elektronik_id, 'Foto og video', NOW()),
  (uuid_generate_v4(), elektronik_id, 'Gaming', NOW());

  -- Underkategorier for Møbler
  INSERT INTO subcategories (id, category_id, name, created_at) VALUES
  (uuid_generate_v4(), moebler_id, 'Sofaer og lænestole', NOW()),
  (uuid_generate_v4(), moebler_id, 'Borde', NOW()),
  (uuid_generate_v4(), moebler_id, 'Senge og madrasser', NOW()),
  (uuid_generate_v4(), moebler_id, 'Opbevaring', NOW()),
  (uuid_generate_v4(), moebler_id, 'Kontor', NOW());

  -- Underkategorier for Tøj og mode
  INSERT INTO subcategories (id, category_id, name, created_at) VALUES
  (uuid_generate_v4(), toej_mode_id, 'Herretøj', NOW()),
  (uuid_generate_v4(), toej_mode_id, 'Dametøj', NOW()),
  (uuid_generate_v4(), toej_mode_id, 'Sko', NOW()),
  (uuid_generate_v4(), toej_mode_id, 'Tasker og accessories', NOW()),
  (uuid_generate_v4(), toej_mode_id, 'Ure og smykker', NOW());
END $$; 