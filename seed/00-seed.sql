CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* Base permissions */
INSERT INTO permisos (id, name, slug, description)
VALUES
  (gen_random_uuid(), 'Create User', 'create-user', 'Crear Usuario'),
  (gen_random_uuid(), 'List User', 'list-user', 'Listar Usuario'),
  (gen_random_uuid(), 'Delete User', 'delete-user', 'Eliminar usuario'),
  (gen_random_uuid(), 'Edit User', 'edit-user', 'Actualizar usuario'),
  (gen_random_uuid(), 'Create API Key', 'create-api-key', 'Crear usuario'),
  (gen_random_uuid(), 'Delete API KEY', 'delete-api-key', 'Eliminar usuario'),
  (gen_random_uuid(), 'Create Almacen', 'create-almacen', 'Crear almacen'),
  (gen_random_uuid(), 'List Almacen', 'list-almacen', 'Listar almacen'),
  (gen_random_uuid(), 'Delete Almacen', 'delete-almacen', 'Eliminar almacen'),
  (gen_random_uuid(), 'Edit Almacen', 'edit-almacen', 'Actualizar almacen'),
  (gen_random_uuid(), 'Create Producto', 'create-product', 'Crear producto'),
  (gen_random_uuid(), 'List Producto', 'list-product', 'Listar producto'),
  (gen_random_uuid(), 'Delete Producto', 'delete-product', 'Eliminar producto'),
  (gen_random_uuid(), 'Edit Producto', 'edit-product', 'Actualizar producto'),
  (gen_random_uuid(), 'List stock', 'list-stock', 'listar stock'),
  (gen_random_uuid(), 'Add Stock', 'add-stock', 'agregar stock al inventario'),
  (gen_random_uuid(), 'Remove Stock', 'remove-stock', 'quitar stock al inventario'),
  (gen_random_uuid(), 'Create Report', 'create-report', 'Crear reporte'),
  (gen_random_uuid(), 'List Report', 'list-report', 'Listar reporte'),
  (gen_random_uuid(), 'Delete Report', 'delete-report', 'Eliminar reporte'),
  (gen_random_uuid(), 'Edit Report', 'edit-report', 'Actualizar reporte'),
  (gen_random_uuid(), 'Accept Report', 'accept-report', 'Aceptar reporte'),
  (gen_random_uuid(), 'Create Requisicion', 'create-requisicion', 'Crear requisicion'),
  (gen_random_uuid(), 'List Requisicion', 'list-requisicion', 'Listar requisicion'),
  (gen_random_uuid(), 'Delete Requisicion', 'delete-requisicion', 'Eliminar requisicion'),
  (gen_random_uuid(), 'Edit Requisicion', 'edit-requisicion', 'Actualizar requisicion'),
  (gen_random_uuid(), 'Accept Requisicion', 'accept-requisicion', 'Aceptar requisicion'),
  (gen_random_uuid(), 'Create Obra', 'create-obra', 'Crear obra'),
  (gen_random_uuid(), 'List Obra', 'list-obra', 'Listar obra'),
  (gen_random_uuid(), 'Delete Obra', 'delete-obra', 'Eliminar obra'),
  (gen_random_uuid(), 'Edit Obra', 'edit-obra', 'Actualizar obra')
ON CONFLICT (slug) DO NOTHING;

/* Roles */
INSERT INTO roles (id, name, slug)
VALUES
  (gen_random_uuid(),'Admin', 'admin'),
  (gen_random_uuid(),'Blogger', 'blogger'),
  (gen_random_uuid(),'Admin almacen', 'admin-almacen'),
  (gen_random_uuid(),'Operador', 'operador'),
  (gen_random_uuid(),'Admin Web', 'admin-web'),
  (gen_random_uuid(),'Admin Compras', 'admin-compras'),
  (gen_random_uuid(), 'Admin Conta', 'admin-conta')
ON CONFLICT (slug) DO NOTHING;

/* ADMIN - All permissions */
INSERT INTO rol_permiso (id, rol_id, permiso_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.slug = 'admin'
ON CONFLICT DO NOTHING;

/* OPERADOR - create, edit, list reports + list products */
INSERT INTO rol_permiso (id, rol_id, permiso_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r
JOIN permisos p ON p.slug IN (
  'create-report',
  'update-report',
  'list-report',
  'list-product'
)
WHERE r.slug = 'operador'
ON CONFLICT DO NOTHING;

/* ADMIN COMPRAS - list and accept requisiciones only */
INSERT INTO rol_permiso (id, rol_id, permiso_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r
JOIN permisos p ON p.slug IN (
  'list-almacen',
  'list-requisicion',
  'accept-requisicion'
)
WHERE r.slug = 'admin-compras'
ON CONFLICT DO NOTHING;

/* ADMIN CONTA - create requisiciones only */
INSERT INTO rol_permiso (id, rol_id, permiso_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r
JOIN permisos p ON p.slug IN (
  'create-requisicion',
  'list-requisicion',
  'list-almacen'
)
WHERE r.slug = 'admin-conta'
ON CONFLICT DO NOTHING;

/* ADMIN ALMACEN - all products, all stock, all requisiciones except accept, all reports */
INSERT INTO rol_permiso (id, rol_id, permiso_id)
SELECT gen_random_uuid(), r.id, p.id
FROM roles r
JOIN permisos p ON p.slug IN (
  'list-almacen',
  -- Product permissions
  'create-product',
  'list-product',
  'delete-product',
  'update-product',
  -- Stock permissions
  'list-stock',
  'add-stock',
  'remove-stock',
  -- Requisicion permissions (except accept-requisicion)
  'create-requisicion',
  'list-requisicion',
  'delete-requisicion',
  'update-requisicion',
  -- All report permissions
  'create-report',
  'list-report',
  'delete-report',
  'update-report',
  'accept-report'
)
WHERE r.slug = 'admin-almacen'
ON CONFLICT DO NOTHING;

/* Default admin user */
INSERT INTO usuarios (id, email, password, name, "imageUrl", "isActive")
VALUES (
  gen_random_uuid(),
  'ola@ola.com',
  '$2b$10$PhbJcXM2UIZDI5.yqquDEuAa2tkxczpo2gb1Agmj1BFZ/cS20ozqa',
  'Dev Admin',
  NULL,
  TRUE
)
ON CONFLICT (email) DO NOTHING;

/* Attach ADMIN role to the default user */
INSERT INTO usuario_rol (id, usuario_id, rol_id)
SELECT gen_random_uuid(), u.id, r.id
FROM usuarios u
JOIN roles r ON r.slug = 'admin'
WHERE u.email = 'ola@ola.com'
ON CONFLICT DO NOTHING;

/* API key for the default user */
INSERT INTO api_keys ("key", "createdAt", revoked, "userId")
SELECT
  '0b347279-68c5-4c77-9f4b-7f31302b7769',
  now(),
  FALSE,
  u.id
FROM usuarios u
WHERE u.email = 'ola@ola.com'
ON CONFLICT ("key") DO NOTHING;
