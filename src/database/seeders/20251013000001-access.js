'use strict';

const bcrypt = require('bcryptjs');
const { PERMISSION_CATALOG } = require('../../common/permissions/permissions.catalog');
const { ROLE_DEFINITIONS } = require('../role-permissions');

// pode rodar várias vezes: tudo é "insere se não existir" ou "atualiza"
module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;
    const run = (sql, replacements) => db.query(sql, { replacements });

    for (const [resource, actions] of Object.entries(PERMISSION_CATALOG)) {
      for (const action of actions) {
        await run(
          `INSERT INTO permissions (id, resource, action, description)
           VALUES (gen_random_uuid(), :resource, :action, :description)
           ON CONFLICT (resource, action) DO NOTHING`,
          { resource, action, description: `${resource}:${action}` },
        );
      }
    }

    for (const [name, def] of Object.entries(ROLE_DEFINITIONS)) {
      await run(
        `INSERT INTO roles (id, name, description, active, is_system)
         VALUES (gen_random_uuid(), :name, :description, true, :isSystem)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, updated_at = now()`,
        { name, description: def.description, isSystem: name === 'ADMIN' },
      );
      await run(
        `DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = :name)`,
        { name },
      );
      for (const key of def.permissions) {
        const [resource, action] = key.split(':');
        await run(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT r.id, p.id FROM roles r, permissions p
           WHERE r.name = :name AND p.resource = :resource AND p.action = :action`,
          { name, resource, action },
        );
      }
    }

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'Senha@12345';
    const users = [
      { name: 'Administrador', email: process.env.SEED_ADMIN_EMAIL || 'admin@adocao.local', role: 'ADMIN', password: adminPassword },
      { name: 'Gestor ONG', email: 'gestor@adocao.local', role: 'ONG_MANAGER', password: defaultPassword },
      { name: 'Voluntário', email: 'voluntario@adocao.local', role: 'VOLUNTEER', password: defaultPassword },
      { name: 'Adotante', email: 'adotante@adocao.local', role: 'ADOPTER', password: defaultPassword },
    ];
    for (const u of users) {
      await run(
        `INSERT INTO users (id, name, email, password_hash, role_id)
         SELECT gen_random_uuid(), :name, :email, :hash, r.id FROM roles r WHERE r.name = :role
         ON CONFLICT (email) DO NOTHING`,
        { name: u.name, email: u.email, hash: await bcrypt.hash(u.password, 10), role: u.role },
      );
    }
  },

  async down(queryInterface) {
    const db = queryInterface.sequelize;
    await db.query(`DELETE FROM users WHERE email LIKE '%@adocao.local'`);
    await db.query(`DELETE FROM role_permissions`);
    await db.query(`DELETE FROM roles WHERE name IN ('ADMIN','ONG_MANAGER','VOLUNTEER','ADOPTER')`);
    await db.query(`DELETE FROM permissions`);
  },
};
