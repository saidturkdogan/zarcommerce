CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (email, password, first_name, last_name, role)
SELECT
    'admin@zarcommerce.com',
    crypt('Admin123!', gen_salt('bf')),
    'System',
    'Admin',
    'ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@zarcommerce.com'
);

INSERT INTO admins (user_id, username, is_super_admin)
SELECT u.id, 'admin', TRUE
FROM users u
WHERE u.email = 'admin@zarcommerce.com'
  AND NOT EXISTS (SELECT 1 FROM admins a WHERE a.username = 'admin');
