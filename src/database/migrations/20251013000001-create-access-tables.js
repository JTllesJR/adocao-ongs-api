'use strict';

const uuidPk = (Sequelize) => ({
  type: Sequelize.UUID,
  primaryKey: true,
  allowNull: false,
  defaultValue: Sequelize.literal('gen_random_uuid()'),
});

const timestamps = (Sequelize) => ({
  created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
  updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
      id: uuidPk(Sequelize),
      resource: { type: Sequelize.STRING(60), allowNull: false },
      action: { type: Sequelize.STRING(60), allowNull: false },
      description: { type: Sequelize.STRING(255) },
    });
    await queryInterface.addConstraint('permissions', {
      fields: ['resource', 'action'],
      type: 'unique',
      name: 'permissions_resource_action_unique',
    });

    await queryInterface.createTable('roles', {
      id: uuidPk(Sequelize),
      name: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      description: { type: Sequelize.STRING(255) },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      is_system: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('role_permissions', {
      role_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'permissions', key: 'id' },
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.createTable('users', {
      id: uuidPk(Sequelize),
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(100), allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
      },
      failed_login_attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      locked_until: { type: Sequelize.DATE },
      ...timestamps(Sequelize),
      deleted_at: { type: Sequelize.DATE },
    });
    await queryInterface.addIndex('users', ['role_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('permissions');
  },
};
